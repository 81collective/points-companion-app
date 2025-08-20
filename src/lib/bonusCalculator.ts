// Minimal temporary stub while bonuses feature is parked in examples.
type UnknownArgs = unknown[];
export const BonusCalculator = {
  calculateSpendingVelocity: (..._args: UnknownArgs): number => 0,
  generateSpendingRecommendations: (..._args: UnknownArgs): unknown[] => [],
  coordinateMultipleBonuses: (..._args: UnknownArgs): { plan: unknown[]; summary: unknown } => ({ plan: [], summary: {} }),
  createSpendingPlan: (..._args: UnknownArgs): { steps: unknown[]; total: number } => ({ steps: [], total: 0 }),
};
