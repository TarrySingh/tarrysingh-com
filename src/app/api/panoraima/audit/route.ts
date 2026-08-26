import { NextRequest, NextResponse } from "next/server"
import { PANORAIMA_COOKIE, readSessionToken } from "@/lib/panoraima/auth"
import { can, listAccessLog, resolveRole } from "@/lib/panoraima/members"

/** GET /api/panoraima/audit — recent access events. Admin only. */
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(PANORAIMA_COOKIE)?.value,
  )
  if (!session || !can(resolveRole(session.email, session.role), "manage_members")) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 })
  }
  return NextResponse.json({ ok: true, events: await listAccessLog(60) })
}
