import type {
  Commit,
  Branch,
  HeadState,
  Repository,
  CommandResult,
  RebaseEntry,
  SerializableRepository,
} from "./types";

let counter = 0;

function generateId(): string {
  counter++;
  const chars = "0123456789abcdef";
  let result = "";
  const seed = Date.now() + counter;
  for (let i = 0; i < 7; i++) {
    result += chars[(seed * (i + 1) * 31 + counter * 17) % chars.length];
  }
  return result;
}

export class GitRepository {
  private state: Repository;
  private history: Repository[] = []; // for undo

  constructor() {
    this.state = {
      commits: new Map(),
      branches: [],
      head: { type: "branch", name: "main" },
      commitOrder: [],
    };
  }

  // === Serialization ===

  static fromSerializable(data: SerializableRepository): GitRepository {
    const repo = new GitRepository();
    const commits = new Map<string, Commit>();
    for (const c of data.commits) {
      commits.set(c.id, { ...c });
    }
    repo.state = {
      commits,
      branches: data.branches.map((b) => ({ ...b })),
      head: { ...data.head },
      commitOrder: [...data.commitOrder],
    };
    return repo;
  }

  toSerializable(): SerializableRepository {
    return {
      commits: Array.from(this.state.commits.values()).map((c) => ({ ...c })),
      branches: this.state.branches.map((b) => ({ ...b })),
      head: { ...this.state.head },
      commitOrder: [...this.state.commitOrder],
    };
  }

  clone(): GitRepository {
    return GitRepository.fromSerializable(this.toSerializable());
  }

  // === State Access ===

  getState(): Repository {
    return this.state;
  }

  getCommit(id: string): Commit | undefined {
    return this.state.commits.get(id);
  }

  getBranch(name: string): Branch | undefined {
    return this.state.branches.find((b) => b.name === name);
  }

  getCurrentBranch(): Branch | undefined {
    if (this.state.head.type === "branch") {
      return this.getBranch(this.state.head.name);
    }
    return undefined;
  }

  getHeadCommitId(): string {
    if (this.state.head.type === "branch") {
      const branch = this.getBranch(this.state.head.name);
      return branch ? branch.tip : "";
    }
    return this.state.head.commitId;
  }

  getAllCommits(): Commit[] {
    return this.state.commitOrder.map((id) => this.state.commits.get(id)!).filter(Boolean);
  }

  getBranches(): Branch[] {
    return this.state.branches;
  }

  getHead(): HeadState {
    return this.state.head;
  }

  // === Save State for Undo ===

  private saveState(): void {
    this.history.push({
      commits: new Map(
        Array.from(this.state.commits.entries()).map(([k, v]) => [k, { ...v }])
      ),
      branches: this.state.branches.map((b) => ({ ...b })),
      head: { ...this.state.head },
      commitOrder: [...this.state.commitOrder],
    });
    if (this.history.length > 50) this.history.shift();
  }

  // === Git Commands ===

  checkout(target: string): CommandResult {
    this.saveState();

    // Check if target is a branch
    const branch = this.getBranch(target);
    if (branch) {
      this.state.head = { type: "branch", name: target };
      return {
        success: true,
        message: `Trocou para a branch '${target}'`,
        type: "success",
      };
    }

    // Check if target is a commit
    if (this.state.commits.has(target)) {
      this.state.head = { type: "detached", commitId: target };
      return {
        success: true,
        message: `HEAD está agora em ${target.slice(0, 7)}`,
        type: "warning",
      };
    }

    return {
      success: false,
      message: `erro: pathspec '${target}' não corresponde a nenhum arquivo conhecido pelo git`,
      type: "error",
    };
  }

  switch(target: string): CommandResult {
    const branch = this.getBranch(target);
    if (!branch) {
      return {
        success: false,
        message: `fatal: referência inválida: ${target}`,
        type: "error",
      };
    }
    return this.checkout(target);
  }

  createBranch(name: string, startPoint?: string): CommandResult {
    this.saveState();

    if (this.getBranch(name)) {
      return {
        success: false,
        message: `fatal: Uma branch com o nome '${name}' já existe.`,
        type: "error",
      };
    }

    let tip: string;
    if (startPoint) {
      const branch = this.getBranch(startPoint);
      if (branch) {
        tip = branch.tip;
      } else if (this.state.commits.has(startPoint)) {
        tip = startPoint;
      } else {
        return {
          success: false,
          message: `fatal: nome de objeto inválido: '${startPoint}'`,
          type: "error",
        };
      }
    } else {
      tip = this.getHeadCommitId();
    }

    this.state.branches.push({ name, tip });
    return {
      success: true,
      message: `Branch '${name}' criada em ${tip.slice(0, 7)}`,
      type: "success",
    };
  }

  deleteBranch(name: string): CommandResult {
    this.saveState();

    if (name === "main") {
      return {
        success: false,
        message: `erro: Não é possível deletar a branch 'main'`,
        type: "error",
      };
    }

    const currentBranch = this.getCurrentBranch();
    if (currentBranch?.name === name) {
      return {
        success: false,
        message: `erro: Não é possível deletar a branch '${name}' na qual você está atualmente.`,
        type: "error",
      };
    }

    const idx = this.state.branches.findIndex((b) => b.name === name);
    if (idx === -1) {
      return {
        success: false,
        message: `erro: branch '${name}' não encontrada.`,
        type: "error",
      };
    }

    this.state.branches.splice(idx, 1);
    return {
      success: true,
      message: `Branch ${name} deletada`,
      type: "success",
    };
  }

  commit(message: string): CommandResult {
    this.saveState();

    const parentId = this.getHeadCommitId();
    const branchName =
      this.state.head.type === "branch" ? this.state.head.name : undefined;

    const newCommit: Commit = {
      id: generateId(),
      message,
      parents: parentId ? [parentId] : [],
      timestamp: Date.now(),
      branch: branchName,
    };

    this.state.commits.set(newCommit.id, newCommit);
    this.state.commitOrder.push(newCommit.id);

    // Update branch tip
    if (this.state.head.type === "branch") {
      const branch = this.getBranch(this.state.head.name);
      if (branch) {
        branch.tip = newCommit.id;
      }
    } else {
      this.state.head = { type: "detached", commitId: newCommit.id };
    }

    return {
      success: true,
      message: `[${branchName || "detached HEAD"} ${newCommit.id.slice(0, 7)}] ${message}`,
      type: "success",
    };
  }

  merge(branchName: string): CommandResult {
    this.saveState();

    const sourceBranch = this.getBranch(branchName);
    if (!sourceBranch) {
      return {
        success: false,
        message: `merge: ${branchName} - não é algo que podemos fazer merge`,
        type: "error",
      };
    }

    const currentHeadId = this.getHeadCommitId();
    if (!currentHeadId) {
      return {
        success: false,
        message: `fatal: nenhum commit ainda`,
        type: "error",
      };
    }

    // Check if already merged (source is ancestor of current)
    if (this.isAncestor(sourceBranch.tip, currentHeadId)) {
      return {
        success: true,
        message: `Já está atualizado.`,
        type: "info",
      };
    }

    // Check for fast-forward (current is ancestor of source)
    if (this.isAncestor(currentHeadId, sourceBranch.tip)) {
      if (this.state.head.type === "branch") {
        const branch = this.getBranch(this.state.head.name);
        if (branch) {
          branch.tip = sourceBranch.tip;
        }
      }
      return {
        success: true,
        message: `Merge fast-forward: ${currentHeadId.slice(0, 7)}..${sourceBranch.tip.slice(0, 7)}`,
        type: "success",
      };
    }

    // Create merge commit
    const currentBranchName =
      this.state.head.type === "branch" ? this.state.head.name : "HEAD";
    const mergeCommit: Commit = {
      id: generateId(),
      message: `Merge branch '${branchName}' into ${currentBranchName}`,
      parents: [currentHeadId, sourceBranch.tip],
      timestamp: Date.now(),
      branch: this.state.head.type === "branch" ? this.state.head.name : undefined,
    };

    this.state.commits.set(mergeCommit.id, mergeCommit);
    this.state.commitOrder.push(mergeCommit.id);

    if (this.state.head.type === "branch") {
      const branch = this.getBranch(this.state.head.name);
      if (branch) {
        branch.tip = mergeCommit.id;
      }
    }

    return {
      success: true,
      message: `Merge feito pela estratégia 'ort'.\n${mergeCommit.id.slice(0, 7)} Merge da branch '${branchName}'`,
      type: "success",
    };
  }

  rebase(onto: string): CommandResult {
    this.saveState();

    let ontoCommitId: string;
    const ontoBranch = this.getBranch(onto);
    if (ontoBranch) {
      ontoCommitId = ontoBranch.tip;
    } else if (this.state.commits.has(onto)) {
      ontoCommitId = onto;
    } else {
      return {
        success: false,
        message: `fatal: upstream inválido '${onto}'`,
        type: "error",
      };
    }

    const currentHeadId = this.getHeadCommitId();
    if (!currentHeadId) {
      return {
        success: false,
        message: `fatal: nenhum commit ainda`,
        type: "error",
      };
    }

    // Already on the same commit or ancestor
    if (currentHeadId === ontoCommitId) {
      return {
        success: true,
        message: `Branch atual já está atualizada.`,
        type: "info",
      };
    }

    if (this.isAncestor(currentHeadId, ontoCommitId)) {
      // Fast-forward case
      if (this.state.head.type === "branch") {
        const branch = this.getBranch(this.state.head.name);
        if (branch) branch.tip = ontoCommitId;
      }
      return {
        success: true,
        message: `Fast-forward para ${ontoCommitId.slice(0, 7)}`,
        type: "success",
      };
    }

    // Find commits to rebase (commits reachable from HEAD but not from onto)
    const commonAncestor = this.findCommonAncestor(currentHeadId, ontoCommitId);
    if (!commonAncestor) {
      return {
        success: false,
        message: `fatal: nenhum ancestral comum encontrado`,
        type: "error",
      };
    }

    const commitsToRebase = this.getCommitsBetween(commonAncestor, currentHeadId);

    // Create new commits on top of onto
    let currentBase = ontoCommitId;
    const newCommitIds: string[] = [];

    for (const oldCommit of commitsToRebase) {
      const newCommit: Commit = {
        id: generateId(),
        message: oldCommit.message,
        parents: [currentBase],
        timestamp: Date.now(),
        branch: this.state.head.type === "branch" ? this.state.head.name : undefined,
      };
      this.state.commits.set(newCommit.id, newCommit);
      this.state.commitOrder.push(newCommit.id);
      newCommitIds.push(newCommit.id);
      currentBase = newCommit.id;
    }

    // Update branch
    if (this.state.head.type === "branch") {
      const branch = this.getBranch(this.state.head.name);
      if (branch) {
        branch.tip = currentBase;
      }
    } else {
      this.state.head = { type: "detached", commitId: currentBase };
    }

    return {
      success: true,
      message: `Rebase feito com sucesso e refs/heads/${this.state.head.type === "branch" ? this.state.head.name : "HEAD"} atualizado.\n${commitsToRebase.length} commit(s) reaplicado(s) sobre ${ontoCommitId.slice(0, 7)}`,
      type: "success",
    };
  }

  rebaseInteractive(onto: string, entries: RebaseEntry[]): CommandResult {
    this.saveState();

    let ontoCommitId: string;
    const ontoBranch = this.getBranch(onto);
    if (ontoBranch) {
      ontoCommitId = ontoBranch.tip;
    } else if (this.state.commits.has(onto)) {
      ontoCommitId = onto;
    } else {
      return {
        success: false,
        message: `fatal: upstream inválido '${onto}'`,
        type: "error",
      };
    }

    let currentBase = ontoCommitId;
    let squashMessages: string[] = [];
    let rebasedCount = 0;

    for (const entry of entries) {
      const oldCommit = this.state.commits.get(entry.commitId);
      if (!oldCommit) continue;

      switch (entry.action) {
        case "pick": {
          // Flush squash buffer
          if (squashMessages.length > 0) {
            const squashedCommit: Commit = {
              id: generateId(),
              message: squashMessages.join("\n"),
              parents: [currentBase],
              timestamp: Date.now(),
              branch:
                this.state.head.type === "branch"
                  ? this.state.head.name
                  : undefined,
            };
            this.state.commits.set(squashedCommit.id, squashedCommit);
            this.state.commitOrder.push(squashedCommit.id);
            currentBase = squashedCommit.id;
            squashMessages = [];
            rebasedCount++;
          }

          const newCommit: Commit = {
            id: generateId(),
            message: entry.newMessage || oldCommit.message,
            parents: [currentBase],
            timestamp: Date.now(),
            branch:
              this.state.head.type === "branch"
                ? this.state.head.name
                : undefined,
          };
          this.state.commits.set(newCommit.id, newCommit);
          this.state.commitOrder.push(newCommit.id);
          currentBase = newCommit.id;
          rebasedCount++;
          break;
        }
        case "squash": {
          squashMessages.push(entry.newMessage || oldCommit.message);
          break;
        }
        case "reword": {
          const rewordedCommit: Commit = {
            id: generateId(),
            message: entry.newMessage || oldCommit.message,
            parents: [currentBase],
            timestamp: Date.now(),
            branch:
              this.state.head.type === "branch"
                ? this.state.head.name
                : undefined,
          };
          this.state.commits.set(rewordedCommit.id, rewordedCommit);
          this.state.commitOrder.push(rewordedCommit.id);
          currentBase = rewordedCommit.id;
          rebasedCount++;
          break;
        }
        case "drop": {
          // Skip this commit
          break;
        }
        case "edit": {
          const editedCommit: Commit = {
            id: generateId(),
            message: entry.newMessage || oldCommit.message,
            parents: [currentBase],
            timestamp: Date.now(),
            branch:
              this.state.head.type === "branch"
                ? this.state.head.name
                : undefined,
          };
          this.state.commits.set(editedCommit.id, editedCommit);
          this.state.commitOrder.push(editedCommit.id);
          currentBase = editedCommit.id;
          rebasedCount++;
          break;
        }
      }
    }

    // Flush remaining squash buffer
    if (squashMessages.length > 0) {
      const squashedCommit: Commit = {
        id: generateId(),
        message: squashMessages.join("\n"),
        parents: [currentBase],
        timestamp: Date.now(),
        branch:
          this.state.head.type === "branch" ? this.state.head.name : undefined,
      };
      this.state.commits.set(squashedCommit.id, squashedCommit);
      this.state.commitOrder.push(squashedCommit.id);
      currentBase = squashedCommit.id;
      rebasedCount++;
    }

    // Update branch
    if (this.state.head.type === "branch") {
      const branch = this.getBranch(this.state.head.name);
      if (branch) {
        branch.tip = currentBase;
      }
    } else {
      this.state.head = { type: "detached", commitId: currentBase };
    }

    return {
      success: true,
      message: `Rebase interativo concluído com sucesso. ${rebasedCount} commit(s) processado(s).`,
      type: "success",
    };
  }

  log(): CommandResult {
    const headCommitId = this.getHeadCommitId();
    if (!headCommitId) {
      return {
        success: true,
        message: "Nenhum commit ainda.",
        type: "info",
      };
    }

    const ancestry = this.getAncestry(headCommitId);
    const lines = ancestry.map((c) => {
      const branchLabels = this.state.branches
        .filter((b) => b.tip === c.id)
        .map((b) => b.name);
      const headMark = c.id === headCommitId ? "HEAD -> " : "";
      const refs =
        branchLabels.length > 0
          ? ` (${headMark}${branchLabels.join(", ")})`
          : headMark
            ? ` (${headMark.trim()})`
            : "";
      return `* ${c.id.slice(0, 7)}${refs} ${c.message}`;
    });

    return {
      success: true,
      message: lines.join("\n"),
      type: "info",
    };
  }

  status(): CommandResult {
    const branchName =
      this.state.head.type === "branch"
        ? this.state.head.name
        : `detached at ${this.state.head.commitId.slice(0, 7)}`;

    return {
      success: true,
      message: `Na branch ${branchName}\nnada para commitar, árvore de trabalho limpa`,
      type: "info",
    };
  }

  branchList(): CommandResult {
    const currentBranchName =
      this.state.head.type === "branch" ? this.state.head.name : null;
    const lines = this.state.branches.map((b) => {
      const prefix = b.name === currentBranchName ? "* " : "  ";
      return `${prefix}${b.name}`;
    });
    return {
      success: true,
      message: lines.join("\n"),
      type: "info",
    };
  }

  // === Internal Helpers ===

  private isAncestor(potentialAncestor: string, commitId: string): boolean {
    const visited = new Set<string>();
    const queue = [commitId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === potentialAncestor) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const commit = this.state.commits.get(current);
      if (commit) {
        queue.push(...commit.parents);
      }
    }
    return false;
  }

  private findCommonAncestor(
    commitA: string,
    commitB: string
  ): string | null {
    const ancestorsA = new Set<string>();
    const queueA = [commitA];
    while (queueA.length > 0) {
      const current = queueA.shift()!;
      if (ancestorsA.has(current)) continue;
      ancestorsA.add(current);
      const commit = this.state.commits.get(current);
      if (commit) queueA.push(...commit.parents);
    }

    const queueB = [commitB];
    const visited = new Set<string>();
    while (queueB.length > 0) {
      const current = queueB.shift()!;
      if (ancestorsA.has(current)) return current;
      if (visited.has(current)) continue;
      visited.add(current);
      const commit = this.state.commits.get(current);
      if (commit) queueB.push(...commit.parents);
    }
    return null;
  }

  private getCommitsBetween(ancestor: string, tip: string): Commit[] {
    const commits: Commit[] = [];
    const visited = new Set<string>();

    const walk = (commitId: string): void => {
      if (commitId === ancestor || visited.has(commitId)) return;
      visited.add(commitId);

      const commit = this.state.commits.get(commitId);
      if (!commit) return;

      for (const parentId of commit.parents) {
        walk(parentId);
      }

      commits.push(commit);
    };

    walk(tip);
    return commits;
  }

  private getAncestry(commitId: string): Commit[] {
    const result: Commit[] = [];
    const visited = new Set<string>();
    const queue = [commitId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const commit = this.state.commits.get(current);
      if (commit) {
        result.push(commit);
        queue.push(...commit.parents);
      }
    }
    return result;
  }
}
