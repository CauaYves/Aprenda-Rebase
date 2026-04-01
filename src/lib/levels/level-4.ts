import type { Level } from "./types";

export const level4: Level = {
  id: 4,
  title: "Clean Dirty History",
  titlePt: "Limpar Histórico Sujo",
  difficulty: "advanced",
  description: [
    "Sua branch feature tem um histórico bagunçado: commits WIP, correções de typo e commits de código de debug.",
    "Antes de fazer merge na main, você precisa limpar isso usando rebase interativo.",
    "Remova (drop) os commits de debug, combine (squash) os fixups e mantenha apenas os commits significativos.",
    "Um histórico limpo facilita muito a revisão de código!",
  ],
  objectives: [
    "Trocar para a branch 'feature'",
    "Usar rebase interativo para limpar o histórico",
    "Remover commits de debug/WIP",
    "Combinar commits de correção (fixup)",
    "Terminar com um histórico limpo e significativo",
  ],
  hints: [
    "Troque para feature: git checkout feature",
    "Use git rebase -i main para iniciar o rebase interativo",
    "Remova (drop) commits como 'WIP' e 'debug: add console.log'",
    "Combine (squash) 'Fix typo' com seu commit pai",
  ],
  solution: ["git checkout feature", "git rebase -i main"],
  initialState: {
    commits: [
      { id: "c4a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "main" },
      { id: "c4a0002", message: "Setup project", parents: ["c4a0001"], timestamp: 2000, branch: "main" },
      { id: "c4a0003", message: "Add user model", parents: ["c4a0002"], timestamp: 3000, branch: "feature" },
      { id: "c4a0004", message: "WIP", parents: ["c4a0003"], timestamp: 3500, branch: "feature" },
      { id: "c4a0005", message: "debug: add console.log", parents: ["c4a0004"], timestamp: 4000, branch: "feature" },
      { id: "c4a0006", message: "Add user API", parents: ["c4a0005"], timestamp: 4500, branch: "feature" },
      { id: "c4a0007", message: "Fix typo in user model", parents: ["c4a0006"], timestamp: 5000, branch: "feature" },
      { id: "c4a0008", message: "Add user tests", parents: ["c4a0007"], timestamp: 5500, branch: "feature" },
    ],
    branches: [
      { name: "main", tip: "c4a0002" },
      { name: "feature", tip: "c4a0008" },
    ],
    head: { type: "branch", name: "main" },
    commitOrder: ["c4a0001", "c4a0002", "c4a0003", "c4a0004", "c4a0005", "c4a0006", "c4a0007", "c4a0008"],
  },
  validationRules: [
    { type: "on-branch", branchName: "feature" },
    { type: "linear-history", branchName: "feature" },
    { type: "no-merge-commits", branchName: "feature" },
  ],
};
