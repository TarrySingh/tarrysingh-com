/**
 * Shared anti-bot layer for every form that posts to
 * /api/newsletter/subscribe. Wire it in like this:
 *
 *   const bot = useBotCheck()
 *   ...
 *   <form onSubmit={submit}>
 *     <HoneypotField value={bot.hp} onChange={bot.setHp} />
 *     ... real fields ...
 *   </form>
 *   <TurnstileWidget {...bot.turnstile} theme="light" />
 *
 * On submit send `botCheck: await bot.getBotCheck()` in the JSON body,
 * and call `bot.rearm()` when the submit fails so a retry gets a fresh
 * Turnstile token. The realai-crm receiver verifies the signals and
 * decides; the site never rejects on them.
 */

export { useBotCheck } from "./useBotCheck"
export type {
  BotCheck,
  TurnstileBinding,
  TurnstileStatus,
  UseBotCheck,
} from "./useBotCheck"
export { HoneypotField } from "./HoneypotField"
export { TurnstileWidget } from "./TurnstileWidget"
