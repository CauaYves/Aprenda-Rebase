import type { SerializableRepository } from "../git-engine/types";
import type { ValidationRule } from "../git-engine/validation";

export type Level = {
  id: number;
  title: string;
  titlePt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string[];
  objectives: string[];
  hints: string[];
  solution: string[];
  initialState: SerializableRepository;
  validationRules: ValidationRule[];
};
