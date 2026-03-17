import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60 // Allow up to 60s for web search + LLM scoring

// ---------- Rate limiter (in-memory, per serverless instance) ----------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

// ---------- Valid values ----------
const VALID_SCENARIOS = ["conservative", "moderate", "aggressive"] as const
const VALID_REGIONS = ["local", "europe", "global"] as const

const REGION_SEARCH_HINTS: Record<string, string> = {
  local: "Dutch and Benelux banks",
  europe: "European banks (EU-wide)",
  global: "global banks worldwide",
}

const SCENARIO_LABELS: Record<string, string> = {
  conservative: "Conservative (slow adoption, -18% modifier)",
  moderate: "Moderate (peer-paced adoption, 0% modifier)",
  aggressive: "Aggressive (fast-mover, +15% modifier)",
}

// ---------- Fallback demo results ----------
function getDemoResults() {
  return {
    evidence: "Demo mode: In production, this performs live web search via Anthropic API to gather real-time evidence of AI adoption in banking credit risk functions.",
    scoring: {
      domains: {
        core_modeling: { realWorldScore: 65, evidence: "Banks increasingly using ML for PD/LGD models, but regulatory caution remains.", confidence: "medium", delta: 5 },
        data_analytics: { realWorldScore: 82, evidence: "Data pipelines and feature engineering heavily automated across tier-1 banks.", confidence: "high", delta: 8 },
        validation_governance: { realWorldScore: 38, evidence: "Model validation still requires significant human judgment and regulatory expertise.", confidence: "high", delta: -5 },
        reporting_comm: { realWorldScore: 60, evidence: "Automated reporting gaining traction but stakeholder communication remains manual.", confidence: "medium", delta: 3 },
        implementation: { realWorldScore: 70, evidence: "MLOps platforms accelerating model deployment, but legacy system integration challenging.", confidence: "medium", delta: 6 },
        strategic: { realWorldScore: 35, evidence: "Strategic risk decisions still heavily human-driven; AI assists but doesn't replace.", confidence: "high", delta: -3 },
      },
      overallInsight: "AI adoption in credit risk is accelerating, particularly in data-intensive tasks, but governance and strategic domains remain firmly human-led. Expect 2-3 year transition for mid-tier automation.",
      topSignal: "Major banks investing in AI/ML platforms for credit modeling, with regulatory bodies issuing new guidance on AI model governance.",
      riskLevel: "moderate",
    },
    fromCache: false,
    cachedAt: new Date().toISOString(),
  }
}

// ---------- Types ----------
interface CategoryInput {
  id: string
  name: string
  tasks: Array<{ id: string; name: string; aiScore: number }>
}

interface SimulationRequest {
  roleSlug: string
  scenario: string
  region: string
  categories: CategoryInput[]
}

// ---------- POST /api/simulation ----------
export async function POST(request: NextRequest) {
  const userId = request.cookies.get("sim_user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Rate limit
  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Max 5 requests per minute" },
      { status: 429 }
    )
  }

  // Parse and validate request
  let body: SimulationRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { roleSlug, scenario, region, categories } = body

  if (!roleSlug || !scenario || !region || !categories?.length) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }

  if (!VALID_SCENARIOS.includes(scenario as typeof VALID_SCENARIOS[number])) {
    return NextResponse.json({ error: "invalid_scenario" }, { status: 400 })
  }

  if (!VALID_REGIONS.includes(region as typeof VALID_REGIONS[number])) {
    return NextResponse.json({ error: "invalid_region" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check token balance
  const { data: tokenData } = await supabase
    .from("user_tokens")
    .select("balance")
    .eq("user_id", userId)
    .single()

  const balance = tokenData?.balance ?? 0
  if (balance <= 0) {
    return NextResponse.json(
      { error: "insufficient_tokens", balance: 0 },
      { status: 402 }
    )
  }

  // Check cache (24h TTL)
  const { data: cached } = await supabase
    .from("simulation_cache")
    .select("results")
    .eq("role_slug", roleSlug)
    .eq("scenario", scenario)
    .eq("region", region)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (cached?.results) {
    // Deduct token even for cache hits (user pays for access)
    await supabase.rpc("deduct_token", { p_user_id: userId })

    return NextResponse.json({
      ...cached.results,
      fromCache: true,
      cachedAt: new Date().toISOString(),
    })
  }

  // Call Anthropic API with web search
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const categoryContext = categories
      .map((c) => {
        const avgScore = Math.round(
          c.tasks.reduce((a, t) => a + t.aiScore, 0) / c.tasks.length
        )
        return `- ${c.id} (${c.name}): Contains tasks like ${c.tasks
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")}. Baseline AI score: ${avgScore}%`
      })
      .join("\n")

    const prompt = `You are an expert analyst scoring real-world AI adoption in credit risk modeling at banks.

CONTEXT:
- Role: Credit Risk Modeler
- Adoption scenario: ${SCENARIO_LABELS[scenario]}
- Peer group: ${REGION_SEARCH_HINTS[region]}

TASK:
1. Search the web for recent evidence (last 12 months) of AI/ML adoption in credit risk modeling at ${REGION_SEARCH_HINTS[region]}. Look for:
   - AI/ML model deployment announcements in credit risk
   - Regulatory guidance on AI in credit risk (EBA, ECB, Basel Committee)
   - Industry surveys on automation in risk functions
   - Specific bank AI initiatives in credit modeling

2. Based on your findings, score each of these 6 domains on a 0-100 scale for real-world AI automation adoption:

${categoryContext}

3. Return your assessment as a JSON object with EXACTLY this structure:
{
  "domains": {
    "core_modeling": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer, difference from baseline> },
    "data_analytics": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer> },
    "validation_governance": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer> },
    "reporting_comm": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer> },
    "implementation": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer> },
    "strategic": { "realWorldScore": <0-100>, "evidence": "<1-2 sentence evidence>", "confidence": "<low|medium|high>", "delta": <integer> }
  },
  "overallInsight": "<2-3 sentence synthesis of findings>",
  "topSignal": "<single most important finding>",
  "riskLevel": "<low|moderate|high|critical>"
}

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code blocks, no explanation before or after.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    })

    // Extract text content from response (after web search tool uses)
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    )

    const lastText = textBlocks[textBlocks.length - 1]?.text || ""

    // Parse JSON from response — handle potential markdown wrapping
    let jsonStr = lastText.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const scoring = JSON.parse(jsonStr)

    // Validate structure
    if (!scoring.domains || !scoring.overallInsight) {
      throw new Error("Invalid scoring structure")
    }

    const results = {
      evidence: `Live analysis via Anthropic Claude with web search — ${response.usage?.input_tokens || "?"} input tokens used.`,
      scoring,
      fromCache: false,
      cachedAt: new Date().toISOString(),
    }

    // Cache results (24h TTL)
    await supabase.from("simulation_cache").insert({
      role_slug: roleSlug,
      scenario,
      region,
      results,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Deduct token
    await supabase.rpc("deduct_token", { p_user_id: userId })

    return NextResponse.json(results)
  } catch (err) {
    console.error("[simulation] Anthropic API error:", err)

    // Deduct token even on failure (API was called, cost was incurred)
    // But return demo results as fallback
    await supabase.rpc("deduct_token", { p_user_id: userId })

    const fallback = getDemoResults()
    fallback.evidence =
      "Live API encountered an error — showing baseline assessment. " +
      fallback.evidence

    return NextResponse.json(fallback)
  }
}
