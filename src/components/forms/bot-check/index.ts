/**
 * Shared anti-bot layer for every form that posts to
 * /api/newsletter/subscribe. Wire it in like this:
 *
 *   const bot = useBotCheck()
 *   ...
 *   <form {...bot.formProps} onSubmit={submit}>
 *     <HoneypotField value={bot.hp} onChange={bot.setHp} />
 *     ... real fields ...
 *   </form>
 *   <TurnstileWidget {...bot.turnstile} theme="light" />
 *
 * `formProps` marks the form engaged on the first focus or press inside
 * it; the widget renders, and runs its challenge, only from then on.
 *
 * A form that is not on screen when its host mounts (a scroll-triggered
 * peek) passes `useBotCheck({ active: visible })` so the timer starts
 * when the form appears.
 *
 * On submit send `botCheck: await bot.getBotCheck()` in the JSON body,
 * and call `bot.rearm()` when the submit fails so a retry gets a fresh
 * Turnstile token. The realai-crm receiver verifies the signals and
 * decides; the site never rejects on them.
 */

export { useBotCheck } from "./useBotCheck"
export type {
  BotCheck,
  BotCheckFormProps,
  TurnstileBinding,
  TurnstileStatus,
  UseBotCheck,
  UseBotCheckOptions,
} from "./useBotCheck"
export { HoneypotField } from "./HoneypotField"
export { TurnstileWidget } from "./TurnstileWidget"
