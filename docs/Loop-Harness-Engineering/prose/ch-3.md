<!-- words: 2006 · claims: Anthropic attention-budget + context-rot + n² (Effective context engineering, 2025) · Lost in the Middle U-shape (Liu et al., arXiv 2307.03172, 2023) · Chroma Context Rot 18-model roster + non-uniformity (Hong/Troynikov/Huber, 2025) · NoLiMa 32K collapse (Modarressi et al., arXiv 2502.05167, 2025) · Lodha GPT-5 configs C1-C4 + C4 token/time savings (arXiv 2606.10209, 2026) · four harness responses (Anthropic, 2025) · compaction recall-then-precision (Anthropic, 2025) · JIT lightweight identifiers + head/tail (Anthropic, 2025) · sub-agent 1,000-2,000-token summary (Anthropic, 2025) · bloated-tool litmus (Anthropic, 2025) · Governance Decay compaction eviction (Chen, arXiv 2606.22528, 2026) · Anthropic context-editing +29%/+39% (Managing context on the Claude Developer Platform, 2025) -->

## Context Is a Budget

The counter reads 184,320 tokens and the agent is getting worse. Not stuck, not crashed. Worse. Twenty thousand tokens ago it was pulling the right row from the right table on the first try. Now, with a full day of tool results behind it, it reaches past the answer sitting three turns up and re-runs a query it already ran. The window did not fill up and stop. It filled up and dulled. I used to think a million-token window was the end of this problem. The window got bigger. The attention did not.

The window is not a backpack you keep stuffing. It is a budget you spend, and every token you add is charged against every token already there. Anthropic names the mechanism plainly: LLMs are built on the transformer, "which enables every token to attend to every other token across the entire context. This results in n² pairwise relationships for n tokens" (Anthropic, Effective context engineering for AI agents, 2025). That is the cold math under the anecdote. Double the context and you quadruple the relationships the model has to hold at once. The attention the model can spend is finite, and it gets spread thinner over every pair you add, so each new token dilutes the weight left for the ones that carry the answer. They call the symptom "context rot" · "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" · and they call the resource an "attention budget" (Anthropic, 2025). A bigger window raises the ceiling on what you can waste. It does not raise the floor on what you can trust.

So read the window the way you read a bill. Here is a real long-running agent's context, line-itemed near the limit:

```
CONTEXT BUDGET · agent @ turn 214 / 200k window
  segment                         tokens      note
  system prompt                    2,400      fixed
  tool schemas (31 tools)         14,800      curate this
  user turns                       6,100      the actual ask
  model reasoning                 18,500      thinking traces
  accumulated tool results       142,000  ←  90% of an 8-hour run
  -----------------------------  --------
  total                          183,800      spending on rot
```

Ninety percent of the budget is accumulated tool results · the least load-bearing tokens in the window, the raw dumps of every file read and every query run, almost none of which the model needs on turn 214. That segment grows monotonically and taxes everything above it. The engineer's instinct is to buy a bigger window and let it keep growing. The correct move is to notice you are spending your entire attention budget on receipts.

The decay is measured, not folklore. Three results converge, and you can reproduce all of them. The oldest is Lost in the Middle: performance is highest when the needed information sits at the start or end of the input and drops sharply when it lands in the middle, "even for explicitly long-context models," measured on multi-document QA and key-value retrieval (Liu et al., arXiv 2307.03172, TACL 2023). Position is not neutral. Chroma pushed harder. Their Context Rot study ran 18 current models · Claude Opus 4, Sonnet 4, o3, GPT-4.1, Gemini 2.5 Pro, Qwen3-235B, the whole roster · and found reliability falling as input length grows even on trivially simple retrieval and text-replication tasks (Hong, Troynikov, Huber, Chroma, 2025). The decay is not uniform: it worsens as the question's semantic similarity to the needle falls, a single distractor already lowers performance and four lower it more, and models scored higher on shuffled haystacks than on logically coherent ones (Chroma, 2025). Coherence should help. It hurt. The well-ordered context you took care to assemble did worse than the same tokens thrown in at random, which means the structure you are paying to maintain can be the thing dragging recall down. This was not a stress test built to embarrass the models · their LongMemEval runs averaged around 113k tokens across 306 prompts, and the text-replication task spanned inputs from 25 words to 10,000 (Chroma, 2025). Ordinary lengths, ordinary tasks, measurable rot. Then NoLiMa cut the sharpest. Strip the lexical overlap so the model has to reason by latent association, and of 13 models each advertising 128K-plus context, 11 drop below half their short-length baseline by 32K tokens. GPT-4o falls from a 99.3% baseline to 69.7% at 32K (Modarressi et al., arXiv 2502.05167, ICML 2025). Thirty-two thousand tokens is a quarter of the window everyone treats as free.

None of this is a bug a bigger context retires. It is a property of attention. Which means the length at which your agent's trust should stop is a number you can find, not a feeling you wait for. There is one control that matters here: a slider that stuffs the window while the accuracy readout falls in real time. Drag it until the pruned line and the full-history line cross, and read the length off the axis. That crossover is the number you can find, turned into a dial.

[[INSTRUMENT: V4 Context Rot]]

The ghost band you just dragged · the pruned config holding near 91.6% while full history sags toward 71% · is not decoration. It is the exact experiment a production team ran.

Lodha and colleagues took a single GPT-5 agent through a 50-task Microsoft Dynamics 365 hotel-expense itemisation benchmark and swapped only one thing: how much history the agent carried. Four configs. C1, no user model, scored 8.0% complete itemisation. C2, the full conversation history · the default everyone ships · scored 71.0%. C3, keeping only the last five tool call and response pairs, scored 79.0%. C4, those last five plus an automated summary of what came before, scored 91.6% (Lodha et al., arXiv 2606.10209, Table 2, 2026). Read that again against instinct. The config that remembered everything came third. Keeping only the last five exchanges, with no summary at all, already beat full history by eight points. Adding a running summary of the discarded turns took it the rest of the way. The config that threw most of it away came first, by more than twenty points over the one that hoarded.

And it did not pay for that accuracy with cost. C4 also reached 99.64% average amount itemised while cutting token consumption 62.7% · from 1,481.0K down to 553.4K tokens · and wall-clock time 60.2%, from 14.56 hours to 5.79 (Lodha et al., 2026). Fewer tokens, less time, better answers. The paper's own headline is +20.6 points over full context. One honest caveat: that is a single GPT-5 agent, no multi-agent architecture, no orchestra of subagents. The real number is +20.6 points from pruning. Anything larger you may have read about this paper was never in it.

The difference between 71% and 91.6% is one config field.

```ts
// context policy is a setting, not a research project
type ContextPolicy = "full_history" | "last_5" | "last_5_plus_summary";

const AGENT_CONFIG = {
  // full_history      → 71.0% complete · 1,481K tokens · 14.56 hrs
  // last_5            → 79.0% complete
  // last_5_plus_summary → 91.6% complete · 553K tokens · 5.79 hrs
  contextPolicy: "last_5_plus_summary" as ContextPolicy,
};
```

The default is `full_history`, and the default is wrong. That is the shape of most context bugs I have shipped: not a missing capability, a bad default nobody changed.

The move that makes pruning safe is a distinction I now draw before I write any agent: memory versus vault. Memory is what lives in the window right now, spending budget this turn. The vault is what lives on disk, addressed by a lightweight identifier and paid for only when you load it. Anthropic gives four organs for moving spend out of memory and into the vault (Anthropic, 2025). Compaction: summarise the history near the limit and reinitialise a fresh window from the summary, and do it in that order · "Start by maximizing recall... then iterate to improve precision" (Anthropic, 2025). Persisted memory: a memory tool, shipped in public beta 29 Sep 2025, that writes structured notes to disk the agent reads back later. Just-in-time retrieval: agents "maintain lightweight identifiers (file paths, stored queries, web links, etc.)" and pull the payload on demand · Claude Code uses "Bash commands like head and tail to analyze large volumes of data without ever loading the full data objects into context" (Anthropic, 2025). And sub-agent isolation: a specialised sub-agent works in its own clean window and "returns only a condensed, distilled summary of its work (often 1,000-2,000 tokens)" to the lead agent (Anthropic, 2025).

The vault pattern is three shell lines an engineer already types:

```bash
# hold the identifier, touch the data, persist a note · never cat the file in
head -50 sales_2025.csv                    # 50 rows, not 4M
grep -c "refund" transactions.jsonl        # a count, not the log
cat >> .claude/claude-progress.txt <<'EOF'
Q3 refunds: 1,204 rows. Root cause isolated to promo SKU-88.
Next: reconcile against ledger export (path: exports/ledger_q3.csv).
EOF
```

Forty lines of note beat four gigabytes of context, and the four gigabytes never entered the window. That is the whole discipline in three commands: identifier held, data touched on demand, summary persisted.

Tool schemas are budget too. Look back at that ledger · 14,800 tokens of tool definitions, spent every single turn whether or not the agent uses them. A bloated tool set is a context-rot vector the same as a bloated transcript, and the pruning heuristic generalises cleanly. Anthropic's litmus: "If a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better" (Anthropic, 2025). If two of your tools make you hesitate, they make the model hesitate at 14,800 tokens a turn. Cut one. Every schema you keep is a rent you pay on every turn for a capability the agent may never reach for, and the more of them you list, the more often the model picks the wrong door. That cost compounds the wrong way: on a long run the fixed schema block is charged against every one of hundreds of turns, so a set you never trimmed on day one quietly bills you for the length of the whole session. Curating the tool surface is not tidiness. It is the same pruning discipline aimed at a segment of the budget most people never look at, because it does not grow the way a transcript grows · it just sits there, fixed and expensive, from turn one.

Now the danger, because pruning is a scalpel and I have seen it used as a bulldozer. When you compact, you decide what survives the summary, and you can silently drop things you cannot afford to lose. One preprint measured exactly this. When a safety or governance policy sat in full context, constraint violations ran at 0%. After compaction, violations rose to 30%, reaching 59% on some models. When the constraint survived summarisation, violations stayed at 0%; when it was dropped, they hit 38% (Chen, Governance Decay, arXiv 2606.22528, 2026). Those numbers come from 1,323 episodes, and the same work demonstrates a compaction-eviction attack that steers the summariser into omitting legitimate policies, then a fix · constraint pinning · that restored violations to 0% (Chen, 2026). It is one non-peer-reviewed preprint, so hold it as a signal, not a settled law. But the shape is exactly right: the thing your summariser forgets is the thing your agent stops obeying. I have shipped a compactor that quietly dropped a tool-permission line, and the agent did not warn me it had stopped respecting it. It simply started doing the thing the line forbade.

So prune aggressively and pin deliberately. Pin the constraints out of the eviction path:

```ts
const compacted = await compact(history, {
  strategy: "recall_then_precision",
  pin: ["safety_policy", "tool_permissions"], // never summarised away
});
```

Principled editing is a net win, not a tax. Anthropic reports that on an internal agentic-search eval, context editing alone lifted performance 29% over baseline, and the memory tool plus context editing lifted it 39% (Anthropic, Managing context on the Claude Developer Platform, 2025). Those are their own figures on their own eval, so weight them as such. But they point the same way every result in this chapter points: the agents that throw context away on purpose beat the ones that keep everything.

Three moves for Monday. First, treat the window as a budget with a line-item ledger and default to pruning, not hoarding · `full_history` is the wrong default and you now have the config field to change it. Second, split memory from vault: hold identifiers, not payloads, and retrieve just-in-time. Third, compact with recall-then-precision and pin what must never be evicted. Pruning keeps one loop honest. The next scaling move is to spend the budget across many loops at once, which is where verification and fan-out become the problem.

*I stopped treating the window as a place to keep things and started treating it as money I was spending every token, and my agents got sharper the day I began throwing context away on purpose.*
