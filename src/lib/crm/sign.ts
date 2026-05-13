import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * HMAC-SHA256 over a raw payload string, encoded as a lowercase hex
 * digest. Matches the algorithm RealAI-CRM's webhook receiver
 * verifies (earthscan/route.ts, parsed as "sha256=<hex>").
 *
 * Always sign the EXACT bytes you put on the wire — never the
 * pretty-printed or re-stringified version, because JSON.stringify
 * is not byte-stable across runtimes.
 */
export function signPayload(raw: string, secret: string): string {
  return createHmac("sha256", secret).update(raw, "utf8").digest("hex")
}

/**
 * Constant-time hex comparison. Useful if we ever build an inbound
 * webhook receiver on this side (e.g. CRM → tarrysingh.com for
 * "unsubscribe confirmed" callbacks).
 */
export function verifySignatureHex(
  raw: string,
  secret: string,
  presentedHex: string,
): boolean {
  const expectedHex = signPayload(raw, secret)
  if (expectedHex.length !== presentedHex.length) return false
  try {
    return timingSafeEqual(
      Buffer.from(expectedHex, "hex"),
      Buffer.from(presentedHex, "hex"),
    )
  } catch {
    return false
  }
}
