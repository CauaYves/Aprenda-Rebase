import type { Level } from "./types";

export const level2: Level = {
  id: 2,
  title: "Update Feature with Main",
  titlePt: "Atualizar Feature com Main",
  difficulty: "beginner",
  description: [
    "Seu colega fez merge de mudanças importantes na 'develop' enquanto você trabalhava na sua user/eu/15844-fix-autenticacao/17400-correcao-token.",
    "Você precisa atualizar sua branch 'user/eu/15844-fix-autenticacao/17400-correcao-token' com as últimas mudanças da 'develop' usando rebase.",
    "Esse é um fluxo de trabalho muito comum em equipes que preferem rebase ao invés de merge.",
    "O resultado deve ser um histórico linear limpo onde seus commits da user/eu/15844-fix-autenticacao/17400-correcao-token ficam em cima da main.",
  ],
  objectives: [
    "Trocar para a branch 'user/eu/15844-fix-autenticacao/17400-correcao-token'",
    "Fazer rebase da 'user/eu/15844-fix-autenticacao/17400-correcao-token' sobre a 'develop'",
    "Garantir que o histórico seja linear (sem commits de merge)",
  ],
  hints: [
    "Use 'git checkout user/eu/15844-fix-autenticacao/17400-correcao-token' para trocar de branch",
    "Use 'git rebase develop' para reaplicar seus commits sobre a main",
    "Verifique com 'git log' para ver o resultado",
  ],
  solution: ["git checkout user/eu/15844-fix-autenticacao/17400-correcao-token", "git rebase develop"],
  initialState: {
    commits: [
      { id: "c2a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "develop" },
      { id: "c2a0002", message: "Setup project", parents: ["c2a0001"], timestamp: 2000, branch: "develop" },
      { id: "c2a0003", message: "Add auth module", parents: ["c2a0002"], timestamp: 3000, branch: "develop" },
      { id: "c2a0004", message: "Fix security bug", parents: ["c2a0003"], timestamp: 4000, branch: "develop" },
      { id: "c2a0005", message: "Add login page", parents: ["c2a0002"], timestamp: 2500, branch: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
      { id: "c2a0006", message: "Add signup page", parents: ["c2a0005"], timestamp: 3500, branch: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
      { id: "c2a0007", message: "Style forms", parents: ["c2a0006"], timestamp: 4500, branch: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
    ],
    branches: [
      { name: "develop", tip: "c2a0004" },
      { name: "user/eu/15844-fix-autenticacao/17400-correcao-token", tip: "c2a0007" },
    ],
    head: { type: "branch", name: "develop" },
    commitOrder: ["c2a0001", "c2a0002", "c2a0003", "c2a0004", "c2a0005", "c2a0006", "c2a0007"],
  },
  validationRules: [
    { type: "on-branch", branchName: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
    { type: "branch-ancestor", branch: "user/eu/15844-fix-autenticacao/17400-correcao-token", ancestor: "develop" },
    { type: "linear-history", branchName: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
    { type: "no-merge-commits", branchName: "user/eu/15844-fix-autenticacao/17400-correcao-token" },
  ],
};
