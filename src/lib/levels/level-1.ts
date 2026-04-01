import type { Level } from "./types";

export const level1: Level = {
  id: 1,
  title: "Move Branch with Rebase",
  titlePt: "Mover Branch com Rebase",
  difficulty: "beginner",
  description: [
    "Bem-vindo ao Git Rebase! Neste nível, você vai aprender o básico.",
    "Você tem uma branch 'feature' que divergiu da 'main'. A branch 'main' tem novos commits que sua feature não possui.",
    "Seu objetivo é fazer rebase da 'feature' sobre a 'main' para que os commits da feature apareçam após o último commit da main.",
    "Isso cria um histórico limpo e linear, como se você tivesse começado seu trabalho a partir da última main.",
  ],
  objectives: [
    "Trocar para a branch 'feature'",
    "Fazer rebase da 'feature' sobre a 'main'",
    "A branch feature deve ter um histórico linear baseado na main",
  ],
  hints: [
    "Primeiro, troque para a branch feature: git checkout feature",
    "Depois faça rebase sobre a main: git rebase main",
    "Após o rebase, os commits da feature serão reaplicados sobre o tip da main",
  ],
  solution: ["git checkout feature", "git rebase main"],
  initialState: {
    commits: [
      { id: "c1a0001", message: "Initial commit", parents: [], timestamp: 1000, branch: "main" },
      { id: "c1a0002", message: "Add README", parents: ["c1a0001"], timestamp: 2000, branch: "main" },
      { id: "c1a0003", message: "Update config", parents: ["c1a0002"], timestamp: 3000, branch: "main" },
      { id: "c1a0004", message: "Add feature A", parents: ["c1a0002"], timestamp: 2500, branch: "feature" },
      { id: "c1a0005", message: "Add feature B", parents: ["c1a0004"], timestamp: 3500, branch: "feature" },
    ],
    branches: [
      { name: "main", tip: "c1a0003" },
      { name: "feature", tip: "c1a0005" },
    ],
    head: { type: "branch", name: "main" },
    commitOrder: ["c1a0001", "c1a0002", "c1a0003", "c1a0004", "c1a0005"],
  },
  validationRules: [
    { type: "on-branch", branchName: "feature" },
    { type: "branch-ancestor", branch: "feature", ancestor: "main" },
    { type: "linear-history", branchName: "feature" },
  ],
};
