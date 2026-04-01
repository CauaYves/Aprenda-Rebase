import type { GitRepository } from "./repository";
import type { Commit } from "./types";

export type ValidationRule =
  | { type: "branch-exists"; branchName: string }
  | { type: "branch-not-exists"; branchName: string }
  | { type: "on-branch"; branchName: string }
  | { type: "commit-count"; branchName: string; count: number }
  | { type: "branch-tip-message"; branchName: string; message: string }
  | {
      type: "commit-messages-in-order";
      branchName: string;
      messages: string[];
    }
  | { type: "branch-ancestor"; branch: string; ancestor: string }
  | { type: "linear-history"; branchName: string }
  | { type: "no-merge-commits"; branchName: string };

export type ValidationResult = {
  passed: boolean;
  message: string;
};

export function validateRule(
  repo: GitRepository,
  rule: ValidationRule
): ValidationResult {
  switch (rule.type) {
    case "branch-exists": {
      const branch = repo.getBranch(rule.branchName);
      return {
        passed: !!branch,
        message: branch
          ? `✓ Branch '${rule.branchName}' existe`
          : `✗ Branch '${rule.branchName}' não existe`,
      };
    }

    case "branch-not-exists": {
      const branch = repo.getBranch(rule.branchName);
      return {
        passed: !branch,
        message: !branch
          ? `✓ Branch '${rule.branchName}' foi removida`
          : `✗ Branch '${rule.branchName}' ainda existe`,
      };
    }

    case "on-branch": {
      const head = repo.getHead();
      const isOnBranch =
        head.type === "branch" && head.name === rule.branchName;
      return {
        passed: isOnBranch,
        message: isOnBranch
          ? `✓ Atualmente na branch '${rule.branchName}'`
          : `✗ Não está na branch '${rule.branchName}'`,
      };
    }

    case "commit-count": {
      const branch = repo.getBranch(rule.branchName);
      if (!branch) {
        return { passed: false, message: `✗ Branch '${rule.branchName}' não encontrada` };
      }
      const commits = getCommitChain(repo, branch.tip);
      const passed = commits.length === rule.count;
      return {
        passed,
        message: passed
          ? `✓ Branch '${rule.branchName}' tem ${rule.count} commits`
          : `✗ Branch '${rule.branchName}' tem ${commits.length} commits (esperado ${rule.count})`,
      };
    }

    case "branch-tip-message": {
      const branch = repo.getBranch(rule.branchName);
      if (!branch) {
        return { passed: false, message: `✗ Branch '${rule.branchName}' não encontrada` };
      }
      const commit = repo.getCommit(branch.tip);
      const passed = commit?.message === rule.message;
      return {
        passed,
        message: passed
          ? `✓ Tip da branch '${rule.branchName}' tem a mensagem "${rule.message}"`
          : `✗ Tip da branch '${rule.branchName}' tem a mensagem "${commit?.message}" (esperado "${rule.message}")`,
      };
    }

    case "commit-messages-in-order": {
      const branch = repo.getBranch(rule.branchName);
      if (!branch) {
        return { passed: false, message: `✗ Branch '${rule.branchName}' não encontrada` };
      }
      const commits = getCommitChain(repo, branch.tip);
      const messages = commits.map((c) => c.message);
      const expected = rule.messages;

      const passed =
        messages.length === expected.length &&
        messages.every((m, i) => m === expected[i]);
      return {
        passed,
        message: passed
          ? `✓ Mensagens dos commits na ordem esperada`
          : `✗ Mensagens dos commits não correspondem.\n  Obtido: ${messages.join(" → ")}\n  Esperado: ${expected.join(" → ")}`,
      };
    }

    case "branch-ancestor": {
      const branch = repo.getBranch(rule.branch);
      const ancestor = repo.getBranch(rule.ancestor);
      if (!branch || !ancestor) {
        return { passed: false, message: `✗ Branch não encontrada` };
      }
      const chain = getCommitChain(repo, branch.tip);
      const passed = chain.some((c) => c.id === ancestor.tip);
      return {
        passed,
        message: passed
          ? `✓ '${rule.ancestor}' é ancestral de '${rule.branch}'`
          : `✗ '${rule.ancestor}' não é ancestral de '${rule.branch}'`,
      };
    }

    case "linear-history": {
      const branch = repo.getBranch(rule.branchName);
      if (!branch) {
        return { passed: false, message: `✗ Branch '${rule.branchName}' não encontrada` };
      }
      const commits = getCommitChain(repo, branch.tip);
      const passed = commits.every((c) => c.parents.length <= 1);
      return {
        passed,
        message: passed
          ? `✓ Branch '${rule.branchName}' tem histórico linear`
          : `✗ Branch '${rule.branchName}' tem commits de merge (não linear)`,
      };
    }

    case "no-merge-commits": {
      const branch = repo.getBranch(rule.branchName);
      if (!branch) {
        return { passed: false, message: `✗ Branch '${rule.branchName}' não encontrada` };
      }
      const commits = getCommitChain(repo, branch.tip);
      const hasMerge = commits.some((c) => c.parents.length > 1);
      return {
        passed: !hasMerge,
        message: !hasMerge
          ? `✓ Sem commits de merge na branch '${rule.branchName}'`
          : `✗ Commits de merge encontrados na branch '${rule.branchName}'`,
      };
    }
  }
}

export function validateAll(
  repo: GitRepository,
  rules: ValidationRule[]
): { allPassed: boolean; results: ValidationResult[] } {
  const results = rules.map((rule) => validateRule(repo, rule));
  return {
    allPassed: results.every((r) => r.passed),
    results,
  };
}

function getCommitChain(repo: GitRepository, tipId: string): Commit[] {
  const commits: Commit[] = [];
  let currentId: string | undefined = tipId;

  while (currentId) {
    const commit = repo.getCommit(currentId);
    if (!commit) break;
    commits.push(commit);
    currentId = commit.parents[0]; // Follow first parent
  }

  return commits;
}
