import type { Level } from "./types";

export const level3: Level = {
  id: 3,
  title: "Interactive Rebase - Squash",
  titlePt: "Rebase Interativo - Squash",
  difficulty: "intermediate",
  description: [
    "O rebase interativo te dá controle total sobre o histórico de commits.",
    "Neste nível, você tem uma branch feature com vários commits pequenos e bagunçados.",
    "Seu objetivo é limpar o histórico combinando (squash) commits relacionados.",
    "Use 'git rebase -i main' para iniciar um rebase interativo. Neste simulador, você terá uma interface para pick/squash/drop commits.",
  ],
  objectives: [
    "Trocar para a branch 'feature'",
    "Usar rebase interativo para combinar (squash) commits",
    "A branch feature deve ter 2 ou menos commits após o squash",
  ],
  hints: [
    "Troque para feature: git checkout feature",
    "Inicie o rebase interativo: git rebase -i main",
    "Use a interface interativa para fazer 'squash' em commits relacionados",
    "Você pode manter o primeiro commit e combinar os outros nele",
  ],
  solution: ["git checkout feature", "git rebase -i main"],
  initialState: {
    commits: [
      { id: "c3a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "main" },
      { id: "c3a0002", message: "Setup project", parents: ["c3a0001"], timestamp: 2000, branch: "main" },
      { id: "c3a0003", message: "Add button", parents: ["c3a0002"], timestamp: 3000, branch: "feature" },
      { id: "c3a0004", message: "Fix button color", parents: ["c3a0003"], timestamp: 3500, branch: "feature" },
      { id: "c3a0005", message: "Fix button size", parents: ["c3a0004"], timestamp: 4000, branch: "feature" },
      { id: "c3a0006", message: "Add button hover", parents: ["c3a0005"], timestamp: 4500, branch: "feature" },
    ],
    branches: [
      { name: "main", tip: "c3a0002" },
      { name: "feature", tip: "c3a0006" },
    ],
    head: { type: "branch", name: "main" },
    commitOrder: ["c3a0001", "c3a0002", "c3a0003", "c3a0004", "c3a0005", "c3a0006"],
  },
  validationRules: [
    { type: "on-branch", branchName: "feature" },
    { type: "commit-count", branchName: "feature", count: 4 }, // 2 main + 2 squashed feature (or fewer)
    { type: "linear-history", branchName: "feature" },
  ],
};
