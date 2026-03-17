import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events, specifically checkout.session.completed.
 * Credits tokens to the anonymous user's balance.
 */
export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    console.error("[stripe/webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET")
    return NextResponse.json({ error: "not_configured" }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  })

  // Read raw body for signature verification
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const tokensStr = session.metadata?.tokens

    if (!userId || !tokensStr) {
      console.error("[stripe/webhook] Missing metadata:", session.metadata)
      return NextResponse.json({ error: "missing_metadata" }, { status: 400 })
    }

    const tokensToCredit = parseInt(tokensStr, 10)
    if (isNaN(tokensToCredit) || tokensToCredit <= 0) {
      console.error("[stripe/webhook] Invalid tokens value:", tokensStr)
      return NextResponse.json({ error: "invalid_tokens" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Idempotency check: don't process same session twice
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single()

    if (existing) {
      console.log("[stripe/webhook] Duplicate webhook for session:", session.id)
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Credit tokens (upsert: create user if new, increment if existing)
    const { data: tokenRow } = await supabase
      .from("user_tokens")
      .select("balance")
      .eq("user_id", userId)
      .single()

    if (tokenRow) {
      // Existing user — increment balance
      await supabase
        .from("user_tokens")
        .update({
          balance: tokenRow.balance + tokensToCredit,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
    } else {
      // New user — insert
      await supabase.from("user_tokens").insert({
        user_id: userId,
        balance: tokensToCredit,
      })
    }

    // Record purchase
    await supabase.from("purchases").insert({
      user_id: userId,
      stripe_session_id: session.id,
      amount: session.amount_total || 500,
      tokens_credited: tokensToCredit,
    })

    console.log(
      `[stripe/webhook] Credited ${tokensToCredit} tokens to user ${userId.slice(0, 8)}...`
    )
  }

  return NextResponse.json({ received: true })
}
