import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

const BASKET_SIZE = 5
const BASKET_PRICE_CENTS = 500 // $5.00

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for a token basket purchase.
 * Returns { url } to redirect the user to Stripe.
 */
export async function POST(request: NextRequest) {
  const userId = request.cookies.get("sim_user_id")?.value

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.error("[stripe/checkout] Missing STRIPE_SECRET_KEY")
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 500 }
    )
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
    })

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: BASKET_PRICE_CENTS,
            product_data: {
              name: "Simulation Token Basket",
              description: `${BASKET_SIZE} live AI simulation runs for Credit Risk Modeler`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: userId,
        tokens: String(BASKET_SIZE),
        role_slug: "credit-risk-modeler",
      },
      success_url: `${siteUrl}/experiments/agent-and-me/bfsi?purchase=success`,
      cancel_url: `${siteUrl}/experiments/agent-and-me/bfsi?purchase=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[stripe/checkout] Error:", err)
    return NextResponse.json(
      { error: "checkout_failed", message: String(err) },
      { status: 500 }
    )
  }
}
