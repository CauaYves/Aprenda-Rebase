import type { Level } from "./types";

export const level1: Level = {
  id: 1,
  title: "Move Branch with Rebase",
  titlePt: "Mover Branch com Rebase",
  difficulty: "beginner",
  description: [
    "Bem-vindo ao Git Rebase! Neste nível, você vai aprender o básico.",
    "Você tem uma branch 'user/jhon/1243-integracao' que divergiu da 'develop'. A branch 'develop' tem novos commits que sua user/jhon/1243-integracao não possui.",
    "Seu objetivo é fazer rebase da 'user/jhon/1243-integracao' sobre a 'develop' para que os commits da user/jhon/1243-integracao apareçam após o último commit da main.",
    "Isso cria um histórico limpo e linear, como se você tivesse começado seu trabalho a partir da última main.",
  ],
  objectives: [
    "Trocar para a branch 'user/jhon/1243-integracao'",
    "Fazer rebase da 'user/jhon/1243-integracao' sobre a 'develop'",
    "A branch user/jhon/1243-integracao deve ter um histórico linear baseado na main",
  ],
  hints: [
    "Primeiro, troque para a branch user/jhon/1243-integracao: git checkout user/jhon/1243-integracao",
    "Depois faça rebase sobre a main: git rebase develop",
    "Após o rebase, os commits da user/jhon/1243-integracao serão reaplicados sobre o tip da main",
  ],
  solution: ["git checkout user/jhon/1243-integracao", "git rebase develop"],
  initialState: {
    commits: [
      { id: "c1a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "develop" },
      { id: "c1a0002", message: "Add README", parents: ["c1a0001"], timestamp: 2000, branch: "develop" },
      { id: "c1a0003", message: "Update config", parents: ["c1a0002"], timestamp: 3000, branch: "develop" },
      { id: "c1a0004", message: "Add user/jhon/1243-integracao A", parents: ["c1a0002"], timestamp: 2500, branch: "user/jhon/1243-integracao" },
      { id: "c1a0005", message: "Add user/jhon/1243-integracao B", parents: ["c1a0004"], timestamp: 3500, branch: "user/jhon/1243-integracao" },
    ],
    branches: [
      { name: "develop", tip: "c1a0003" },
      { name: "user/jhon/1243-integracao", tip: "c1a0005" },
    ],
    head: { type: "branch", name: "develop" },
    commitOrder: ["c1a0001", "c1a0002", "c1a0003", "c1a0004", "c1a0005"],
  },
  validationRules: [
    { type: "on-branch", branchName: "user/jhon/1243-integracao" },
    { type: "branch-ancestor", branch: "user/jhon/1243-integracao", ancestor: "develop" },
    { type: "linear-history", branchName: "user/jhon/1243-integracao" },
  ],
};
