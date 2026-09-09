export type LabInputs = { agents: number; uniqueFraction: number; checkCapacity: number; passRate: number; attemptCost: number; checkCost: number; experimentCost: number }

/** An accounting scenario, not an empirical model of researcher intelligence. */
export function labScenario(input: LabInputs) {
  const unique = input.agents * input.uniqueFraction
  const checked = Math.min(unique, input.checkCapacity)
  const accepted = checked * input.passRate
  const inference = input.agents * input.attemptCost
  const checking = checked * input.checkCost
  const experiments = accepted * input.experimentCost
  const total = inference + checking + experiments
  return { unique, checked, accepted, queued: Math.max(0, unique - checked), inference, checking, experiments, total, costPerAccepted: accepted ? total / accepted : null }
}

/** Effective sample size for an equicorrelated mean; not a discovery forecast. */
export function effectiveSamples(n: number, correlation: number) {
  return n / (1 + (n - 1) * correlation)
}

export function savingsScenario(researchShare: number, reduction: number, passThrough: number) {
  const baselineCost = 80, baselinePrice = 100
  const saving = baselineCost * researchShare * reduction
  const customerSaving = saving * passThrough
  return { baselineCost, baselinePrice, saving, customerSaving, newCost: baselineCost-saving, newPrice: baselinePrice-customerSaving, newMargin: baselinePrice-customerSaving-(baselineCost-saving) }
}

/** One-period capacity accounting, empty starting queues, all candidates pass. */
export function pipelineScenario(arrivals: number, validationCapacity: number, deploymentCapacity: number) {
  const validated = Math.min(arrivals, validationCapacity)
  const deployed = Math.min(validated, deploymentCapacity)
  return { validated, deployed, awaitingValidation: arrivals-validated, awaitingDeployment: validated-deployed }
}

/** A serial two-stage thought experiment on a 100-unit baseline. */
export function elapsedTimeScenario(acceleratedShare: number, speedup: number) {
  const unchanged = 100 * (1-acceleratedShare)
  const accelerated = 100 * acceleratedShare / speedup
  return { unchanged, accelerated, total: unchanged+accelerated, overallSpeedup: 100/(unchanged+accelerated) }
}
