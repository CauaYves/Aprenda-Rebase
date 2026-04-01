import type { GitCommand, CommandResult } from "./types";
import type { GitRepository } from "./repository";

export function parseCommand(input: string): GitCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("git ")) {
    return null;
  }

  const parts = trimmed.slice(4).trim().split(/\s+/);
  const subcommand = parts[0];

  switch (subcommand) {
    case "checkout": {
      if (parts.length < 2) return null;
      // git checkout -b <name> creates and switches
      if (parts[1] === "-b" && parts[2]) {
        return { type: "branch", name: parts[2], startPoint: parts[3] };
      }
      return { type: "checkout", target: parts[1] };
    }

    case "switch": {
      if (parts.length < 2) return null;
      if (parts[1] === "-c" && parts[2]) {
        return { type: "branch", name: parts[2], startPoint: parts[3] };
      }
      return { type: "switch", target: parts[1] };
    }

    case "branch": {
      if (parts.length === 1) {
        return { type: "branch-list" };
      }
      if (parts[1] === "-d" || parts[1] === "-D") {
        if (parts[2]) return { type: "branch-delete", name: parts[2] };
        return null;
      }
      return { type: "branch", name: parts[1], startPoint: parts[2] };
    }

    case "commit": {
      let message = "Novo commit";
      const mIndex = parts.indexOf("-m");
      if (mIndex !== -1 && parts[mIndex + 1]) {
        // Collect everything after -m as message, handling quotes
        const rest = trimmed.slice(trimmed.indexOf("-m") + 2).trim();
        // Remove surrounding quotes if present
        if (
          (rest.startsWith('"') && rest.endsWith('"')) ||
          (rest.startsWith("'") && rest.endsWith("'"))
        ) {
          message = rest.slice(1, -1);
        } else {
          message = rest;
        }
      }
      return { type: "commit", message };
    }

    case "merge": {
      if (parts.length < 2) return null;
      return { type: "merge", branch: parts[1] };
    }

    case "rebase": {
      if (parts.length < 2) return null;
      if (parts[1] === "-i" || parts[1] === "--interactive") {
        if (parts[2]) {
          return {
            type: "rebase-interactive",
            onto: parts[2],
            entries: [],
          };
        }
        return null;
      }
      return { type: "rebase", onto: parts[1] };
    }

    case "log": {
      return { type: "log" };
    }

    case "status": {
      return { type: "status" };
    }

    case "help": {
      return { type: "help" };
    }

    default:
      return null;
  }
}

export function executeCommand(
  repo: GitRepository,
  command: GitCommand
): CommandResult {
  switch (command.type) {
    case "checkout":
      return repo.checkout(command.target);

    case "switch":
      return repo.switch(command.target);

    case "branch":
      // If this was a checkout -b, also switch
      const result = repo.createBranch(command.name, command.startPoint);
      if (result.success) {
        repo.checkout(command.name);
        return {
          success: true,
          message: `Trocou para a nova branch '${command.name}'`,
          type: "success",
        };
      }
      return result;

    case "branch-delete":
      return repo.deleteBranch(command.name);

    case "branch-list":
      return repo.branchList();

    case "commit":
      return repo.commit(command.message);

    case "merge":
      return repo.merge(command.branch);

    case "rebase":
      return repo.rebase(command.onto);

    case "rebase-interactive":
      return repo.rebaseInteractive(command.onto, command.entries);

    case "log":
      return repo.log();

    case "status":
      return repo.status();

    case "help":
      return {
        success: true,
        message: [
          "Comandos disponíveis:",
          "  git checkout <branch|commit>   Trocar de branch ou restaurar arquivos",
          "  git checkout -b <nome>         Criar e trocar para nova branch",
          "  git switch <branch>            Trocar de branch",
          "  git switch -c <nome>           Criar e trocar para nova branch",
          "  git branch                     Listar branches",
          "  git branch <nome>              Criar nova branch",
          "  git branch -d <nome>           Deletar branch",
          '  git commit -m "<mensagem>"     Criar um novo commit',
          "  git merge <branch>             Fazer merge de uma branch",
          "  git rebase <branch>            Fazer rebase sobre uma branch",
          "  git rebase -i <branch>         Rebase interativo",
          "  git log                        Mostrar histórico de commits",
          "  git status                     Mostrar status",
          "  git help                       Mostrar esta ajuda",
        ].join("\n"),
        type: "info",
      };
  }
}
