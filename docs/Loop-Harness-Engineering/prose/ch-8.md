<!-- words: 2503 · claims: Meta adaptation ladder 10^5-10^7 GPU-hrs / PEFT 1-6% / FinPythia-6.9B 18 days 24B tokens (Meta AI 2024) · Balaguer agriculture FT +6pp RAG +5pp cumulative (arXiv:2401.08406, 2024) · Sturm automotive RAG most cost-efficient (arXiv:2605.09533, 2026) · LoRA -10,000x params / -3x GPU memory / no inference latency (Hu et al. arXiv:2106.09685, 2021) · QLoRA 65B on 48GB / Guanaco 99.3% Vicuna / 24 GPU-hrs (Dettmers et al. arXiv:2305.14314, 2023) · ChipNeMo DAPT 23.1B tokens / 2,620·4,940·20,500 GPU-hrs / <1.5% / tokenizer +1.6-3.3% (Liu et al. arXiv:2311.00176, 2023) · worked CPT $2,331 / 57 hrs / 8xA100 (Nachum Medium 2024, secondary) · ChipNeMo TCO 90-95% PROJECTION (Sharma et al. arXiv:2404.08850, 2024) · BloombergGPT 50.6B / 709B tokens / 1.3M GPU-hrs / 512 A100 / 53 days (Wu et al. arXiv:2303.17564, 2023); $3-10M ESTIMATE (liquide.life 2024) · DeepSeek-V3 2.788M H800-hrs / $5.576M official-run-only (arXiv:2412.19437, 2024) · Llama 3 405B 16,384 H100 / 54 days / 466 interruptions / >90% goodput (arXiv:2407.21783, 2024) · Pan et al. break-even 24-32B 0.3-3mo / 70-120B 3.8-34mo / 235B+ 3.5-69.3mo / >=50M tok/mo (arXiv:2509.18101, 2025) · Nemotron-4 340B Reward >98% synthetic / ~20K human (NVIDIA arXiv:2406.11704, 2024) · Constitutional AI RLAIF far fewer human labels (Bai et al. arXiv:2212.08073, 2022) · DORA in force 17 Jan 2025 / 20 entity types / CTPP (EIOPA 2025) · Gartner EU sovereign IaaS $6.9B->$12.6B->$23.1B (Gartner 9 Feb 2026) · ALIA-40B 40B / 9.37T tokens / MareNostrum 5 / Apache-2.0 (BSC 2025) · Teuken-7B 7B / ~4T tokens / JUWELS (OpenGPT-X 2024) · realai.eu 3-layer Hominis stack (2026) -->

## Use Case I · The Private Frontier

09:00 Monday. Three people around a table and one number on the whiteboard. Forty billion tokens. That is the proprietary corpus a finance-data team has accreted over a decade of filings, memos, and graded trades, and no public model has ever seen a line of it. There is a legal mandate that it never leaves the building. And there is a CFO in the doorway asking why the Claude bill keeps climbing. Three roads leave that room. Continued-pretrain a company model. Stand up a LoRA fleet. Go RAG-first and train nothing. Pick wrong and you either burn a GPU quarter on a model you did not need, or you carry a permanent capability gap you paid a rented API to keep. This chapter is the run-book that turns that fork into arithmetic.

Start with the default posture, because the default is not to build. Meta publishes an adaptation ladder and its advice is to start simple and add complexity only as needed (Methods for adapting large language models, Meta AI, 2024). In-context learning is the cheapest rung. RAG is best for knowledge that moves. Parameter-efficient fine-tuning modifies only about 1 to 6% of a model's parameters. And full pre-training or continued-pretraining sits at the top at roughly 10^5 to 10^7 GPU-hours, tagged in Meta's own words as not recommended for most teams (Meta AI, 2024). Four variables decide where you land on that ladder: how many tokens your corpus holds, how far your domain drifts from what public models already know, your latency budget, and whether a residency mandate takes the rented API off the table entirely. The finance team has the last one, which is why they are even in this room. Most teams do not, and for them the ladder ends early.

Write the fork down as a file, because a decision you can version is a decision you can defend.

```yaml
# adaptation-policy.yaml  · the run-book's first artifact
corpus_tokens: 40_000_000_000     # 40B, the vault from Ch7, now a number
domain_drift: high                # filings + graded trades, far OOD
latency_p95_ms: 800
residency:
  mandate: true                   # legal: the corpus never leaves the building
route:                            # the tree reads top-down, first match wins
  - if: residency.mandate && corpus_tokens > 10e9
    then: continued_pretrain
  - if: domain_drift == high && !residency.mandate
    then: lora_fleet
  - else: rag_first               # the default nobody regrets
```

That `else` is the honest default. Before anyone trains a weight, RAG usually wins on cost. Microsoft's agriculture study measured it: fine-tuning added over 6 percentage points of accuracy and RAG added a further 5, and the two gains stacked rather than competed (Balaguer et al., arXiv:2401.08406, 2024). An industrial automotive QA study on two closed datasets reached the same verdict from the other side. Premium closed models led out of the box, but open models pulled level once given RAG, and RAG came out as the most effective and most cost-efficient adaptation for both open and closed models (Sturm et al., arXiv:2605.09533, 2026). Read those two together and the answer for most teams is not RAG versus fine-tuning. It is RAG first, fine-tuning second, and only if the retrieval floor is not enough.

The finance team's mandate is the thing that overrides this. If your corpus can leave the building, you start at the bottom of the ladder and climb only when the numbers force you. Meta's own worked example on this rung is FinPythia-6.9B: continued-pretrain over 24 billion tokens took 18 days (Meta AI, 2024). That is a small model and a modest corpus, and it still cost most of three weeks of wall-clock. Now weigh that against a retrieval pipeline you can stand up in an afternoon and re-index nightly, and the ordering is obvious. You train when retrieval stops closing the gap, not before, and you keep RAG mounted underneath the trained model afterward, because the two are cumulative and the Microsoft numbers say so plainly. The mistake is not choosing wrong between them. The mistake is treating them as rivals and paying for a training run to solve a problem a retriever already solved.

When it is not enough, the middle road is a LoRA fleet. This is where teams with real domain drift and no residency mandate should live. LoRA cuts trainable parameters by a factor of 10,000 and GPU memory by a factor of 3 against a full fine-tune of GPT-3 175B, matches full-fine-tune quality, and adds no inference latency (Hu et al., arXiv:2106.09685, 2021). QLoRA pushed the floor lower still: a 65B model fine-tuned on a single 48GB GPU, and the resulting Guanaco reached 99.3% of ChatGPT's Vicuna level after 24 hours on one GPU (Dettmers et al., NeurIPS 2023). The word fleet is the point. One frozen base, many cheap adapters, one per business unit, swapped at request time.

```bash
# one frozen base · one adapter per business unit
python -m peft.train \
  --base meta-llama/Llama-3.1-70B \
  --rank 16 --target_modules q_proj,v_proj \
  --data corpora/finance-q3.jsonl \
  --out adapters/finance-q3.safetensors     # 80MB, not 140GB
# serve: mount many, share one base in memory
#   adapters/finance-q3.safetensors
#   adapters/legal.safetensors
#   adapters/risk.safetensors
```

Each adapter is tens of megabytes against a base measured in hundreds of gigabytes. That asymmetry is the harness pattern: you are not shipping models, you are shipping deltas, and the standing structure that mounts them against one base is the thing you own. It also changes the operational math. A new business unit does not mean a new training run and a new set of weights to serve. It means one more adapter file and a routing rule, trained in hours on a fraction of a node, versioned in the same repository as the rest of your code. When the desk's data drifts you retrain one adapter, not the base, and the blast radius of a bad run is a single 80-megabyte file you can roll back. Compare that to a fine-tuned full model per unit, where every retrain is a full run and every rollback is a redeploy. The fleet is not a clever trick for saving GPU memory. It is what makes per-unit domain adaptation something a small team can actually operate at company scale.

The tier above that is continued-pretrain, domain-adaptive pretraining, and its reputation for being ruinous is mostly wrong. NVIDIA's ChipNeMo ran DAPT over 23.1 billion tokens of internal chip-design documents and reported it as much cheaper, only requiring a few thousand GPU hours: 2,620 for the 7B, 4,940 for the 13B, 20,500 for the 70B, all under 1.5% of from-scratch pretrain compute, with a domain tokenizer buying a further 1.6 to 3.3% efficiency (Liu et al., arXiv:2311.00176, 2023). A practitioner's worked cost lands in the same place: a 7B model over roughly 1 billion tokens on one 8-way A100-80GB node for about 57 hours costs around $2,331 in compute, which excludes data prep, alignment, and serving (Nachum, Medium, 2024, a secondary back-of-envelope, not a benchmarked run).

```text
ChipNeMo DAPT · Liu et al. 2023 (arXiv:2311.00176)
  model   GPU-hours   share of from-scratch
  7B       2,620      < 1.5%
  13B      4,940      < 1.5%
  70B     20,500      < 1.5%
worked 7B CPT · Nachum 2024 (secondary estimate)
  ~1B tokens · 8xA100-80GB · ~57 hrs = ~$2,331
# excludes data prep, alignment, serving · the headline hides all three
```

One caveat you must carry, because this audience will check. A separate TCO study projects that domain-adapted LLMs could cut total cost of ownership by roughly 90 to 95% against frontier APIs for chip-design coding (Sharma et al., arXiv:2404.08850, 2024). That is a projection from an economic model, not a measured ChipNeMo deployment result, and it is only honest stated as such.

The top tier, from-scratch, is the exception, and its price buys something other than a model. BloombergGPT trained a 50.6B-parameter financial model from scratch on 709B tokens using 1.3 million GPU-hours across 512 A100-40GB GPUs over 53 days (Wu et al., arXiv:2303.17564, 2023); a third-party analyst puts the compute at roughly $3 to $10 million, an estimate, not a Bloomberg-published number (liquide.life, 2024). DeepSeek-V3 is the efficiency frontier: 2.788 million H800-hours, which the technical report costs at $5.576 million at an assumed $2 per GPU-hour, and that figure covers only the official training run and explicitly excludes all prior research and ablation experiments on architectures, algorithms, and data (DeepSeek-V3 Technical Report, arXiv:2412.19437, 2024). The low number is credible only because the run held. The report states it experienced no irrecoverable loss spikes and performed no rollbacks. That is what the money buys, and Meta's 405B run shows why. Over a 54-day snapshot on 16,384 H100s, the cluster hit 466 job interruptions, 419 of them unexpected, roughly one failure every three hours, and still held above 90% goodput with only 3 incidents needing manual intervention (The Llama 3 Herd of Models, arXiv:2407.21783, 2024). The rest was absorbed by automated checkpoint and restart.

```text
# training-cluster log · 16,384 GPUs · what >90% goodput looks like
[checkpoint] step 148000 saved  ok
[fault]      node-1193 GPU HBM3 ECC uncorrectable · draining
[restart]    resumed from 148000 · 0 steps lost
[checkpoint] step 149000 saved  ok
[fault]      node-0407 NCCL timeout · draining
[restart]    resumed from 149000 · 0 steps lost
# 419 unexpected faults over 54 days, 3 needed a human
```

That log is the from-scratch tier's real product. You are not paying for weights. You are paying for a fault-tolerant training harness that turns 419 failures into zero lost work.

The lesson scales down, not just up. MosaicML's MPT-7B trained in roughly 9.5 days on 440 A100-40GB GPUs for about $200,000 on 1 trillion tokens, with no human intervention, and four hardware failures during the run were detected and recovered automatically (Databricks/MosaicML, 2023). Same shape as the 405B run, three orders of magnitude smaller: the money bought FSDP-sharded parallelism and an automated checkpoint-restart loop, and what you got at the end was not only a model but the harness that made the run reproducible. This is the through-line of every cost tier above RAG. The published GPU-hour figure is the sticker. The thing it buys is a standing structure that survives faults, and that structure is the part you cannot download with the weights.

Now the arithmetic that settles the fork. On-premise deployment breaks even against a rented frontier API on a schedule you can compute. Against Claude-4 Opus at $15 per million input and $75 per million output tokens, small models of 24 to 32B break even in 0.3 to 3 months, medium 70 to 120B models in 3.8 to 34 months, and large 235B-plus models in 3.5 to 69.3 months, with on-premise turning economically viable primarily above roughly 50 million tokens per month or under a strict residency mandate (Pan et al., arXiv:2509.18101, 2025).

```text
monthly_rented = tokens/mo × blended_$/tok          # the API bill
monthly_owned  = (gpu_capex + dapt_gpu_hrs×$/hr) / amortize_months
break_even when monthly_owned < monthly_rented
# 50M tok/mo is the volume where the lines cross for small models;
# a residency mandate crosses them at any volume
```

Read the shape of those bands before you read the finance team's answer, because the shape is the advice. Small models cross into the black in months, not years. The 235B-plus tier can take almost six years to pay back, which is another way of saying that for most companies the largest owned model is a decision you will not live to see amortized, and the rented API is simply cheaper for as long as your volume stays under the line. The break-even is not a moral argument for owning your stack. It is a volume threshold and a residency switch, and if you clear neither, building is vanity that a CFO will eventually cost out of you.

For the finance team the second clause decides it. Their volume alone might not justify building. Their mandate does, at any volume, because the rented line is not on the table. That is the whole reason the fork was a fork and not a foregone conclusion: strip the mandate and this same team routes to RAG-first with a small adapter fleet, and the forty-billion-token corpus becomes a retrieval index rather than a training set. The number on the whiteboard did not decide anything. The legal line under it did.

You now hold all four variables and all three cost tiers as static numbers. Turn the dial on your own company.

[[INSTRUMENT: V11 The Private Frontier Run-Book]]

Load the bank archetype and the tree routes it to continued-pretrain: a residency mandate plus a 40-billion-token corpus leaves no other rung, and the run-book stages curation, a domain tokenizer, DAPT, SFT on process data, RLAIF, private evals, deploy, and a drift loop, each stage carrying its own compute and headcount band. Load the mid-cap and the same twelve stages route somewhere cheaper: low drift, no mandate, so the tree lands on RAG-first with a LoRA fleet, break-even in the low single-digit months, a team you can count on one hand. Same pipeline, different path, because the variables changed. What the instrument shows is that the moat is not any single stage. It is the standing loop that connects them.

That loop is where the role lives, and it is the whole point of the tier above the model. The trained weights are table stakes. The asset is the agentic stack on top, and it has four organs. Private evals, the Ch4 argument turned company-internal, the held-out set no competitor can download. A verifier fleet, which NVIDIA instantiates concretely: Nemotron-4 340B Reward ranks and filters synthetic responses before they reach tuning, and over 98% of the alignment data was synthetic against only about 20,000 human-annotated examples (NVIDIA, arXiv:2406.11704, 2024). RLAIF against a written constitution, the mechanism Anthropic named: a list of principles becomes the only human oversight, the model critiques and revises its own outputs against those principles, and an AI-feedback preference model serves as the reward signal, reaching harmlessness comparable to RLHF with far fewer human labels (Bai et al., arXiv:2212.08073, 2022). And a drift loop that keeps the private model calibrated to a corpus that keeps moving.

```yaml
# constitution.yaml  · versioned like code, not a slogan
principles:
  - id: pii-01
    rule: never surface a customer PII field in a generated summary
  - id: cite-01
    rule: every figure in an analyst note must carry its source row
  - id: scope-01
    rule: refuse trades outside the desk's mandated instruments
# → feeds the preference model that scores every SFT candidate
```

The drift loop is the organ people forget, and it is the one that decides whether the other three stay worth anything. A private model is calibrated to a corpus at the moment you froze it. The corpus does not hold still. New filings land, the desk's mandate changes, a regulation moves the ground under a whole class of documents. If nothing watches for that drift and re-runs the private evals against fresh held-out data, the model quietly diverges from the company it was trained to serve, and it does it silently, the way any loop without a verify stage does. So the drift loop is a schedule: sample recent process data, score the live model against it, and when the number sags, trigger the cheapest rung that closes the gap, which is usually a new adapter, occasionally a fresh DAPT pass, almost never a from-scratch rebuild. That cadence is the run-book's real output. Not a model, a maintained model.

This is the Loop and Harness Researcher's standing job. Not train-once. Operate the loop that keeps a private model honest against a live corpus.

Here the advice writes itself from the data. The chapter has shown two things. The moat is the agentic layer between your models and your data, not the model. And that layer is already normal wherever the data cannot leave: DORA entered application on 17 January 2025 across 20 types of financial entity and their ICT providers with an oversight regime for critical third parties (EIOPA, 2025); Gartner forecasts European sovereign-cloud IaaS rising from $6.9 billion in 2025 to $12.6 billion in 2026 to $23.1 billion in 2027 (Gartner, 9 Feb 2026); and shipped public models prove the tier is real, Spain's ALIA-40B on 9.37 trillion tokens across MareNostrum 5 under Apache-2.0 (BSC, 2025) and Germany's Teuken-7B on roughly 4 trillion tokens on JUWELS (OpenGPT-X, 2024). So the advice the data forces is this: the layer between your models and your data is a harness, and you decide to buy-or-build it deliberately, at the tier the thresholds justify, because the run-book you just parameterized is an architecture and an architecture can be a product. Real AI builds this layer as Hominis, a foundation model then an agentic OS then the apps on top, one-to-one with the run-book, at realai.eu [receipt: dated realai.eu product-page snapshot confirming the three-layer stack copy].

The private frontier is one place the discipline holds. The next is the R&D discovery loop, where the same rule, own the loop, verification is the bottleneck, decides whether a lab finds anything at all.

*I have trained the model and I have rented the model, and only one of those left me holding a loop I could not be locked out of.*
