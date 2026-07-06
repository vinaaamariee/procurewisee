export interface CriterionWeights {
  price: number;
  delivery: number;
  reliability: number;
  compliance: number;
  historicalPerformance: number;
}

export const WEIGHTS: CriterionWeights = {
  price: 0.40,
  delivery: 0.20,
  reliability: 0.20,
  compliance: 0.10,
  historicalPerformance: 0.10,
};
