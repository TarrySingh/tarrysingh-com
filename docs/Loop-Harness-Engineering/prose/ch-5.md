<!-- words: 1899 · claims: Anthropic 90.2% internal multi-agent uplift (Opus 4 lead + Sonnet 4 subagents) · Anthropic 4x/15x token multipliers · Anthropic BrowseComp 95%/three-factors, 80% tokens alone · Anthropic 3-5 subagents + effort-scaling + CitationAgent · Anthropic sub-agent 1,000-2,000-token summary · Anthropic value-gate quote (economic viability) · Anthropic applicability-boundary quote (shared context / many dependencies) · Anthropic coordination-complexity + divergent-trajectories quotes · Anthropic 40% tool-description task-time cut · Anthropic ~20-query LLM-judge eval rubric · Cognition Don't Build Multi-Agents (fragility + Flappy Bird + two principles) · OpenAI Agents SDK asyncio.gather fan-out primitive -->

## Fan-out and the Orchestra

It is 2am and you have a research task that a single agent grinds through in forty minutes. A colleague, half-asleep in the thread, says just fan it out to five agents. Before you type it, do the arithmetic nobody does. Five agents is not five times faster and it is not five times the cost. It is roughly fifteen times the tokens of a plain chat, spent on a task that may have been sequential all along (Anthropic, How we built our multi-agent research system, 2025). The real question is never can you fan out. It is whether this task's dependency graph lets you, and whether its value clears the bill.

Start with what multi-agent actually is, because it is not a smarter model. It is the loop from Chapter 2, replicated across processes. A lead agent owns the goal. It decomposes the query, then spins up worker sub-agents, each running its own gather-context, act, verify loop in its own clean context window, each returning a condensed summary of what it found. Anthropic describes the shape plainly: the lead agent spins up three to five subagents in parallel, and effort scales with complexity · simple fact-finding needs one agent and three to ten tool calls, a direct comparison might need two to four subagents doing ten to fifteen calls each, and a dedicated CitationAgent walks the documents afterward to place the references (Anthropic, 2025). No new intelligence is added anywhere. The harness is fanned out, and the vocabulary is the vocabulary you already have. Orchestrator, worker, fan-out, fan-in.

Notice what the lead agent is really doing, because this is the part that decides everything downstream. It is not answering the question. It is cutting the question into pieces that can be answered without reference to one another. Take the 2am task from a moment ago · survey the landscape of open-source agent harnesses. A good decomposition hands one worker the Anthropic ecosystem, one the OpenAI ecosystem, one the independent projects, and lets each go read in isolation. A bad decomposition hands one worker "find the best harness" and another "compare it to the second best," and now the second worker cannot start until the first has finished, and the whole point of fanning out has evaporated. Worse, the second worker's whole result is now hostage to the first worker's answer being right, so one weak branch quietly poisons the branch that depends on it. The decomposition is the engineering. The parallelism is just what you get for free when you got the decomposition right.

The orchestrator prompt is where the decomposition lives, and it is not boilerplate:

```text
# lead-agent system prompt (orchestrator)
You are the lead researcher. For the user's query:
1. Decompose it into independent sub-questions.
2. Spawn one worker per sub-question. For EACH worker state:
     - objective        (the single question it owns)
     - output_format    (return a 1-2k-token distilled summary, not raw traces)
     - tool_guidance     (which tools, how many calls to budget)
     - task_boundaries  (what NOT to touch · another worker owns it)
3. Scale worker count to complexity: 1 for a fact, 3-5 for a survey.
4. Never let workers talk to each other. All results return to you.
```

Two wins fall out of that shape, and they are worth keeping separate. The first is wall-clock. Independent workers run concurrently, so the wall time collapses toward the slowest single branch instead of the sum. The second is the one people miss. Each worker gets its own fresh attention budget. A task that would push one agent's context past the rot cliff from Chapter 3 · where accuracy degrades as the window fills, because attention costs n² pairwise relationships for n tokens (Anthropic, Effective context engineering for AI agents, 2025) · gets split into pieces that each stay in the healthy zone. Fan-out is a context-engineering move as much as a speed move. This is the deeper reason the pattern works on research. A single agent asked to read forty sources holds all forty in one window and rots. Ten workers reading four sources each never approach the cliff, and the orchestrator only ever sees ten short summaries. Each worker also reasons over its four sources with an attention budget no other worker is spending, so the fleet buys parallel thinking, not just parallel reading. The window that would have drowned one agent is spread thin enough that no agent drowns. And the measured payoff is real. A multi-agent system with Claude Opus 4 as the lead and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on Anthropic's internal research eval (Anthropic, 2025). That number comes with conditions: it is Anthropic's own internal eval, not an external benchmark, and it is a research task · broad, read-heavy, parallelisable.

That 90.2% does not arrive free, and the cost is the mechanism's shadow. Single agents already use about four times the tokens of a chat. Multi-agent systems use about fifteen times (Anthropic, 2025). And the performance is largely bought with those tokens, not conjured beside them. On BrowseComp, three factors explained 95% of the performance variance, and token usage by itself explained 80% of it, with the number of tool calls and the model choice as the other two (Anthropic, 2025). Read that as an engineer. Most of what you get back scales with the spend, which means fan-out is not a clever trick that beats the token curve. It is a way of climbing the token curve faster, in parallel, and paying for the whole climb at once.

That reframes the 90.2% as well. It is not free performance a smaller budget could have bought. It is performance that cost fifteen times the tokens, on a task where fifteen times the tokens was worth it. So Anthropic states the gate in its own words: for economic viability, multi-agent systems require tasks where the value of the task is high enough to pay for the increased performance (Anthropic, 2025). Capability becomes economics, and the economics are unforgiving. A task where the answer is worth a few cents does not get better with a fifteen-times bill. It just gets more expensive.

Put the arithmetic on the table so the gate is not abstract:

```text
# illustrative · price is a placeholder, multipliers are cited
chat baseline          1x    →  $1.00   per task-equivalent
single agent           4x    →  $4.00
multi-agent (5 workers) 15x   →  $15.00

break-even: fan out only when
   (value of a better answer)  >  $15.00 − $1.00  =  $14.00
```

The multiplier and the variance split are set. Now move the sliders.

[[INSTRUMENT: V6 Fan-out Economics]]

The tree is draggable. Add a worker and watch wall-clock fall while total tokens climb toward the fifteen-times line and quality bends up, then flattens. Every axis is a real number · the token axis anchored to the cited 4x and 15x multipliers, the quality axis to the 90.2% datum. The fan-out that pays is the point on the Pareto frontier where the marginal gain in quality still clears the marginal token cost. Then flip the interdependence toggle, and watch the frontier collapse. The workers stop composing. Quality falls as you add them. That collapse is what happens when the workers are not independent.

Because fan-out only pays when the sub-tasks are independent. Anthropic draws the boundary itself: some domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today (Anthropic, 2025). The reason is mechanical. Multi-agent systems carry a rapid growth in coordination complexity, and one step failing can cause agents to explore entirely different trajectories, leading to unpredictable outcomes (Anthropic, 2025). Give it a name, because it earns one. Shared mutable state is to fan-out what an unverified step is to the loop. It is the thing that silently corrupts the whole run while every part still looks busy.

The most honest read on this failure did not come from Anthropic. It came from Cognition, arguing the opposite case. Walden Yan's position is that parallel-subagent architectures are fragile · running multiple agents in collaboration only results in fragile systems, because the decision-making ends up too dispersed and context is not shared thoroughly enough (Cognition, Don't Build Multi-Agents, 2025). His example is exact. Ask two subagents to build a Flappy Bird clone. One builds a Super Mario Bros-style background. The other builds a bird that moves nothing like the bird in Flappy Bird, because neither ever saw the other's implicit design choices. The pieces do not fit, and no single subagent was wrong. Cognition's two principles read as law for anyone who fans out anyway: share full agent traces, not just individual messages, and remember that actions carry implicit decisions, and conflicting decisions carry bad results (Cognition, 2025).

Anthropic and Cognition are not in conflict once you hold the independence condition in your hand. Anthropic fans out read-heavy research, where each worker gathers facts that stand on their own and the lead stitches them together at the end. Nothing worker two reads changes what worker one should have read. Cognition warns against fanning out write-heavy building, where every file a worker touches encodes a decision the next worker must respect · the frame rate, the physics constants, the art style · and none of those decisions are written down anywhere the other worker can see. Both are right. The difference is not the number of agents. It is whether the sub-tasks share state. Read tasks usually do not. Build tasks almost always do. The dependency graph decides which one you are living in, and you can read it off the task before you spend a token. The canonical shipped primitive makes the condition concrete:

```python
# OpenAI Agents SDK · the fan-out / fan-in primitive
# developers.openai.com/cookbook/examples/agents_sdk/parallel_agents
async def run_agents(parallel_agents, task):
    results = await asyncio.gather(
        *(Runner.run(agent, task) for agent in parallel_agents)
    )
    labelled = [f"[{a.name}] {r.final_output}"
                for a, r in zip(parallel_agents, results)]
    return await Runner.run(meta_agent, "\n".join(labelled))
```

`asyncio.gather` composes cleanly precisely because the branches do not depend on each other. Each `Runner.run` is a worker in its own context. The meta-agent is the fan-in · the lead reading labelled summaries and synthesising. The moment one branch needed another's half-written output, `gather` would be the wrong tool, and you would be back inside Cognition's mismatched bird.

So the design rules are not taste. They are the physics. Scope worker count to complexity and do not default to five · the effort-scaling guidance is one agent for a fact, up to two-to-four subagents for a comparison (Anthropic, 2025). Force workers to return distilled summaries, often 1,000 to 2,000 tokens, never raw traces, so the orchestrator's own context stays lean (Anthropic, 2025). Keep peer-to-peer worker channels off and route everything through the lead, so there is no shared mutable state to corrupt. Treat the orchestrator prompt and the worker tool descriptions as tuned artifacts, not filler · an agent that tested and rewrote tool descriptions for other agents produced a 40% decrease in task-completion time for the agents that used them (Anthropic, 2025). The models did not change. The task did not change. Someone rewrote the instructions the workers read, and the fleet got forty percent faster at the same work. The prompt is not the wrapper around the intelligence. It is a component you profile and tune like any other, and it moves the number as hard as a model swap would. And evaluate the fleet the way you would evaluate one agent. Anthropic started with about twenty queries representing real usage patterns and an LLM judge scoring each output against a rubric · factual accuracy, citation accuracy, completeness, source quality, tool efficiency · on a 0.0 to 1.0 scale with a pass-fail grade, human-backstopped for the edge cases (Anthropic, 2025). Twenty real queries and a graded rubric will tell you within an afternoon whether your orchestra plays or just spends. A fleet that scores high on completeness but low on tool efficiency is climbing the token curve without buying enough answer · the exact failure the value gate warns about.

The orchestrator that decomposes a goal, dispatches workers, and grades what comes back is the same shape as the loop that trains the model in the first place. That older loop is next.

*The orchestra only plays if every musician can read their own part alone. The moment two of them need to watch each other's hands, you do not have an orchestra. You have a bill.*
