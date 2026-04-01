import type { Level } from "./types";

export const level3: Level = {
  id: 3,
  title: "Interactive Rebase - Squash",
  titlePt: "Rebase Interativo - Squash",
  difficulty: "intermediate",
  description: [
    "O rebase interativo te dá controle total sobre o histórico de commits.",
    "Neste nível, você tem uma branch user/eu/16001-epic-payment/18002-adicionar-stripe com vários commits pequenos e bagunçados.",
    "Seu objetivo é limpar o histórico combinando (squash) commits relacionados.",
    "Use 'git rebase -i main' para iniciar um rebase interativo. Neste simulador, você terá uma interface para pick/squash/drop commits.",
  ],
  objectives: [
    "Trocar para a branch 'user/eu/16001-epic-payment/18002-adicionar-stripe'",
    "Usar rebase interativo para combinar (squash) commits",
    "A branch user/eu/16001-epic-payment/18002-adicionar-stripe deve ter 2 ou menos commits após o squash",
  ],
  hints: [
    "Troque para user/eu/16001-epic-payment/18002-adicionar-stripe: git checkout user/eu/16001-epic-payment/18002-adicionar-stripe",
    "Inicie o rebase interativo: git rebase -i main",
    "Use a interface interativa para fazer 'squash' em commits relacionados",
    "Você pode manter o primeiro commit e combinar os outros nele",
  ],
  solution: ["git checkout user/eu/16001-epic-payment/18002-adicionar-stripe", "git rebase -i main"],
  initialState: {
    commits: [
      { id: "c3a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "develop" },
      { id: "c3a0002", message: "Setup project", parents: ["c3a0001"], timestamp: 2000, branch: "develop" },
      { id: "c3a0003", message: "Add button", parents: ["c3a0002"], timestamp: 3000, branch: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
      { id: "c3a0004", message: "Fix button color", parents: ["c3a0003"], timestamp: 3500, branch: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
      { id: "c3a0005", message: "Fix button size", parents: ["c3a0004"], timestamp: 4000, branch: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
      { id: "c3a0006", message: "Add button hover", parents: ["c3a0005"], timestamp: 4500, branch: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
    ],
    branches: [
      { name: "develop", tip: "c3a0002" },
      { name: "user/eu/16001-epic-payment/18002-adicionar-stripe", tip: "c3a0006" },
    ],
    head: { type: "branch", name: "develop" },
    commitOrder: ["c3a0001", "c3a0002", "c3a0003", "c3a0004", "c3a0005", "c3a0006"],
  },
  validationRules: [
    { type: "on-branch", branchName: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
    { type: "commit-count", branchName: "user/eu/16001-epic-payment/18002-adicionar-stripe", count: 4 }, // 2 main + 2 squashed user/eu/16001-epic-payment/18002-adicionar-stripe (or fewer)
    { type: "linear-history", branchName: "user/eu/16001-epic-payment/18002-adicionar-stripe" },
  ],
};
