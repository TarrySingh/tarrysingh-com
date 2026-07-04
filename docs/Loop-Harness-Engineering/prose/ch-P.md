<!-- words: 995 · claims: Prologue outage (founder-attested, receipt 6c9cb1d) · Anthropic "gather context -> take action -> verify work -> repeat" loop framing (Building agents with the Claude Agent SDK, 2025) · Anthropic verification as a pluggable stage (Building agents with the Claude Agent SDK, 2025) · METR o3 reward hacking ~1-2% of attempts (Recent Frontier Models Are Reward Hacking, 2025) -->

## The Morning the Loop Died

23:00. The loop files tomorrow's Dispatch brief, exactly as designed. It has done this every night for months: read the day's signal, draft a brief, write it to Supabase, send me the prompt email so I can glance at what tomorrow will cover. Nothing about that night was different. The brief landed. The email arrived.

08:45 UTC. The other half of the loop wakes up. A server-side backup-writer reads the filed brief, calls a model to turn it into a drafted, web-grounded article, persists the draft, and fires an approval email. That morning it returned 400. No page. No alarm. No red anything. The evening brief email arrived on schedule that night, and the one after, so the inbox read normal and the dashboard read green while the thing that actually publishes had stopped publishing.

Six mornings in a row, starting the 24th (founder-attested, our own logs). Identical 502 at the same tick each day. The loop we built ran, failed, and told no one, because the only mouth it had was wired to the half that still worked. I did not find it by watching a graph. I found it because a reader asked where the article was.

Anthropic frames the core agent loop as four steps · gather context, take action, verify work, repeat (Building agents with the Claude Agent SDK, 2025). Ours had three of them. It gathered context at 23:00. It took action at 08:45. It persisted, when there was anything to persist. What it never had was a verify stage with a mouth · a check on the write step's exit code that could reach a human. So the loop optimised the one thing it could still do, which was look alive.

Here is the exact shape of the corpse. The backup-writer built its request like this, against the cost-controlled default model:

```ts
// src/lib/studio/ai-backup-writer.ts  (pre-fix)
const res = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  thinking: { type: "adaptive" },        // <- 400 on Sonnet, every time, deterministic
  output_config: { effort: "high" },
  messages: buildBriefPrompt(brief),
});
// 400 invalid_request_error: "adaptive thinking is not supported on this model"
```

Adaptive thinking exists only on the Opus-4.6-and-up family (plus Fable and Mythos). Send it to Sonnet and you do not get a soft degrade or a warning header. You get a hard 400, deterministically, on every request, forever. This was a harness bug, not a model bug. The model was never asked to do anything. The wrong parameters went to the wrong model family, and the API did exactly what it says it does.

Trace the chain and the silence stops being mysterious. The 400 became an `ai_call_failed`. That became a 502 out of the backup-writer. No article got written, so the filed brief never executed, so no approval email fired. And the nightly brief email · a completely different code path · kept arriving right on time. That is why it read as "files every night but never publishes" instead of "broken." The loop had persistence and it had a notification organ. The notification organ was bolted to the surviving half. Nothing anywhere watched the write step's exit code, so a deterministic, total, six-day failure produced exactly as much noise as a healthy night: none.

I want to name the verdict before I hand you the instrument, because the instrument only confirms it. A loop without a verify stage does not fail loudly. It succeeds at the wrong thing, quietly, and it keeps succeeding. Anthropic is explicit that verification is a stage you wire in · rules-based checks, visual checks, an LLM judging output · not something the loop gives you for free (Building agents with the Claude Agent SDK, 2025). Leave it out and you do not get a crash. You get a machine that runs beautifully and diverges from what you wanted, one confident tick at a time. This is not a corner case of tired pipelines. METR found a shipping frontier model, o3, attempting to game the scoring environment on roughly one to two percent of task attempts across its evaluation suites · reward hacking rather than solving, whenever nothing checked it hard enough (Recent Frontier Models Are Reward Hacking, 2025). Weak verification does not slow the loop down. It lets the loop lie to you at speed.

So take the same anatomy, live, and break it the way we did.

[[INSTRUMENT: V1 The Loop]]

Pull the Verify stage out and watch what "nothing happens" actually means. The ring keeps spinning · plan, act, persist, repeat · and the divergence counter climbs, because the loop is still doing work, it is just no longer doing the right work, and nothing on the ring can tell the difference. That climbing number is our six silent mornings, drawn as a picture. The loop was not idle. It was busy being wrong.

The fix (commit 6c9cb1d) was not a bigger model or a smarter prompt. It was two lines. Pick the thinking mode by model family, and add the hook that was missing:

```ts
const supportsAdaptive = /^claude-(?:opus-4-[678]|fable-5|mythos-(?:5|preview))/.test(model);
const thinking = supportsAdaptive
  ? { type: "adaptive" }
  : { type: "enabled", budget_tokens: 8000 }; // classic extended thinking for Sonnet/Haiku
```

The first line keeps the deep reasoning on the models that support it and stops sending the 400 to the ones that do not. It is a family check, three tokens wide, that any of us could have written on day one and none of us did. The second is the actual lesson · a verify-and-alert hook on the write step, so that a total silence can never again read as health. Deep reasoning preserved. Six-day outage ended. Two lines, and the second one is the one this whole book is about.

The model was fine. The loop was fine. The harness around the loop was one hook short, and one hook was the whole cost of six days of nothing. Everything that follows in this book lives in that gap · the standing structure around the loop, the part you cannot buy and have to build, the part that decides whether a working machine ever does any work at all.

*The model was never the thing that failed us · the loop ran perfectly and the harness had one hook too few, and that gap is the whole of what comes next.*
