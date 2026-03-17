import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/**
 * GET /api/tokens
 * Returns the current token balance for the anonymous user.
 */
export async function GET(request: NextRequest) {
  const userId = request.cookies.get("sim_user_id")?.value

  if (!userId) {
    return NextResponse.json({ balance: 0 })
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("user_tokens")
      .select("balance")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found, which is fine (new user)
      console.error("[tokens] Supabase error:", error)
      return NextResponse.json({ balance: 0 })
    }

    return NextResponse.json({ balance: data?.balance ?? 0 })
  } catch (err) {
    console.error("[tokens] Error:", err)
    return NextResponse.json({ balance: 0 })
  }
}
