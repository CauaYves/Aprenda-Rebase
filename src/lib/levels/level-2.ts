import type { Level } from "./types";

export const level2: Level = {
  id: 2,
  title: "Update Feature with Main",
  titlePt: "Atualizar Feature com Main",
  difficulty: "beginner",
  description: [
    "Seu colega fez merge de mudanças importantes na 'main' enquanto você trabalhava na sua feature.",
    "Você precisa atualizar sua branch 'feature' com as últimas mudanças da 'main' usando rebase.",
    "Esse é um fluxo de trabalho muito comum em equipes que preferem rebase ao invés de merge.",
    "O resultado deve ser um histórico linear limpo onde seus commits da feature ficam em cima da main.",
  ],
  objectives: [
    "Trocar para a branch 'feature'",
    "Fazer rebase da 'feature' sobre a 'main'",
    "Garantir que o histórico seja linear (sem commits de merge)",
  ],
  hints: [
    "Use 'git checkout feature' para trocar de branch",
    "Use 'git rebase main' para reaplicar seus commits sobre a main",
    "Verifique com 'git log' para ver o resultado",
  ],
  solution: ["git checkout feature", "git rebase main"],
  initialState: {
    commits: [
      { id: "c2a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "main" },
      { id: "c2a0002", message: "Setup project", parents: ["c2a0001"], timestamp: 2000, branch: "main" },
      { id: "c2a0003", message: "Add auth module", parents: ["c2a0002"], timestamp: 3000, branch: "main" },
      { id: "c2a0004", message: "Fix security bug", parents: ["c2a0003"], timestamp: 4000, branch: "main" },
      { id: "c2a0005", message: "Add login page", parents: ["c2a0002"], timestamp: 2500, branch: "feature" },
      { id: "c2a0006", message: "Add signup page", parents: ["c2a0005"], timestamp: 3500, branch: "feature" },
      { id: "c2a0007", message: "Style forms", parents: ["c2a0006"], timestamp: 4500, branch: "feature" },
    ],
    branches: [
      { name: "main", tip: "c2a0004" },
      { name: "feature", tip: "c2a0007" },
    ],
    head: { type: "branch", name: "main" },
    commitOrder: ["c2a0001", "c2a0002", "c2a0003", "c2a0004", "c2a0005", "c2a0006", "c2a0007"],
  },
  validationRules: [
    { type: "on-branch", branchName: "feature" },
    { type: "branch-ancestor", branch: "feature", ancestor: "main" },
    { type: "linear-history", branchName: "feature" },
    { type: "no-merge-commits", branchName: "feature" },
  ],
};
