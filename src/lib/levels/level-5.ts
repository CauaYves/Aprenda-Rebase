import type { Level } from "./types";

export const level5: Level = {
  id: 5,
  title: "Multi-Branch Rebase",
  titlePt: "Rebase com Múltiplas Branches",
  difficulty: "advanced",
  description: [
    "Este é o desafio definitivo de rebase! Você tem múltiplas branches de feature.",
    "Tanto 'feature-a' quanto 'feature-b' saíram de uma versão antiga da main.",
    "A main avançou desde então. Você precisa fazer rebase de ambas as branches sobre a última main.",
    "Isso simula um cenário real onde múltiplos desenvolvedores precisam atualizar suas branches.",
  ],
  objectives: [
    "Fazer rebase da 'feature-a' sobre a última 'main'",
    "Fazer rebase da 'feature-b' sobre a última 'main'",
    "Ambas as branches devem ter histórico linear",
    "Ambas devem estar baseadas na última main",
  ],
  hints: [
    "Comece com feature-a: git checkout feature-a",
    "Faça o rebase: git rebase main",
    "Depois troque para feature-b: git checkout feature-b",
    "Faça o rebase também: git rebase main",
  ],
  solution: [
    "git checkout feature-a",
    "git rebase main",
    "git checkout feature-b",
    "git rebase main",
  ],
  initialState: {
    commits: [
      { id: "c5a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "main" },
      { id: "c5a0002", message: "Setup project", parents: ["c5a0001"], timestamp: 2000, branch: "main" },
      { id: "c5a0003", message: "Add CI/CD", parents: ["c5a0002"], timestamp: 3000, branch: "main" },
      { id: "c5a0004", message: "Add linting", parents: ["c5a0003"], timestamp: 4000, branch: "main" },
      { id: "c5a0005", message: "Add navbar", parents: ["c5a0002"], timestamp: 2500, branch: "feature-a" },
      { id: "c5a0006", message: "Style navbar", parents: ["c5a0005"], timestamp: 3500, branch: "feature-a" },
      { id: "c5a0007", message: "Add footer", parents: ["c5a0002"], timestamp: 2800, branch: "feature-b" },
      { id: "c5a0008", message: "Style footer", parents: ["c5a0007"], timestamp: 3800, branch: "feature-b" },
    ],
    branches: [
      { name: "main", tip: "c5a0004" },
      { name: "feature-a", tip: "c5a0006" },
      { name: "feature-b", tip: "c5a0008" },
    ],
    head: { type: "branch", name: "main" },
    commitOrder: [
      "c5a0001", "c5a0002", "c5a0003", "c5a0004",
      "c5a0005", "c5a0006", "c5a0007", "c5a0008",
    ],
  },
  validationRules: [
    { type: "branch-ancestor", branch: "feature-a", ancestor: "main" },
    { type: "branch-ancestor", branch: "feature-b", ancestor: "main" },
    { type: "linear-history", branchName: "feature-a" },
    { type: "linear-history", branchName: "feature-b" },
  ],
};
