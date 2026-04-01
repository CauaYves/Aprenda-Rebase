import type { Level } from "./types";

export const level5: Level = {
  id: 5,
  title: "Multi-Branch Rebase",
  titlePt: "Rebase com Múltiplas Branches",
  difficulty: "advanced",
  description: [
    "Este é o desafio definitivo de rebase! Você tem múltiplas branches de feature.",
    "Tanto 'user/eu/16500-otimizacao/19001-a' quanto 'user/eu/16500-otimizacao/19002-b' saíram de uma versão antiga da main.",
    "A main avançou desde então. Você precisa fazer rebase de ambas as branches sobre a última main.",
    "Isso simula um cenário real onde múltiplos desenvolvedores precisam atualizar suas branches.",
  ],
  objectives: [
    "Fazer rebase da 'user/eu/16500-otimizacao/19001-a' sobre a última 'develop'",
    "Fazer rebase da 'user/eu/16500-otimizacao/19002-b' sobre a última 'develop'",
    "Ambas as branches devem ter histórico linear",
    "Ambas devem estar baseadas na última main",
  ],
  hints: [
    "Comece com user/eu/16500-otimizacao/19001-a: git checkout user/eu/16500-otimizacao/19001-a",
    "Faça o rebase: git rebase develop",
    "Depois troque para user/eu/16500-otimizacao/19002-b: git checkout user/eu/16500-otimizacao/19002-b",
    "Faça o rebase também: git rebase develop",
  ],
  solution: [
    "git checkout user/eu/16500-otimizacao/19001-a",
    "git rebase develop",
    "git checkout user/eu/16500-otimizacao/19002-b",
    "git rebase develop",
  ],
  initialState: {
    commits: [
      { id: "c5a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "develop" },
      { id: "c5a0002", message: "Setup project", parents: ["c5a0001"], timestamp: 2000, branch: "develop" },
      { id: "c5a0003", message: "Add CI/CD", parents: ["c5a0002"], timestamp: 3000, branch: "develop" },
      { id: "c5a0004", message: "Add linting", parents: ["c5a0003"], timestamp: 4000, branch: "develop" },
      { id: "c5a0005", message: "Add navbar", parents: ["c5a0002"], timestamp: 2500, branch: "user/eu/16500-otimizacao/19001-a" },
      { id: "c5a0006", message: "Style navbar", parents: ["c5a0005"], timestamp: 3500, branch: "user/eu/16500-otimizacao/19001-a" },
      { id: "c5a0007", message: "Add footer", parents: ["c5a0002"], timestamp: 2800, branch: "user/eu/16500-otimizacao/19002-b" },
      { id: "c5a0008", message: "Style footer", parents: ["c5a0007"], timestamp: 3800, branch: "user/eu/16500-otimizacao/19002-b" },
    ],
    branches: [
      { name: "develop", tip: "c5a0004" },
      { name: "user/eu/16500-otimizacao/19001-a", tip: "c5a0006" },
      { name: "user/eu/16500-otimizacao/19002-b", tip: "c5a0008" },
    ],
    head: { type: "branch", name: "develop" },
    commitOrder: [
      "c5a0001", "c5a0002", "c5a0003", "c5a0004",
      "c5a0005", "c5a0006", "c5a0007", "c5a0008",
    ],
  },
  validationRules: [
    { type: "branch-ancestor", branch: "user/eu/16500-otimizacao/19001-a", ancestor: "develop" },
    { type: "branch-ancestor", branch: "user/eu/16500-otimizacao/19002-b", ancestor: "develop" },
    { type: "linear-history", branchName: "user/eu/16500-otimizacao/19001-a" },
    { type: "linear-history", branchName: "user/eu/16500-otimizacao/19002-b" },
  ],
};
