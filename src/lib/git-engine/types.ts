// Core Git simulation types

export type Commit = {
  id: string;
  message: string;
  parents: string[];
  timestamp: number;
  branch?: string; // branch that created this commit
  copiedFrom?: string; // origin commit ID this was cloned from (for rebase animation)
};

export type Branch = {
  name: string;
  tip: string; // commit id the branch points to
};

export type HeadState =
  | { type: "branch"; name: string }
  | { type: "detached"; commitId: string };

export type Repository = {
  commits: Map<string, Commit>;
  branches: Branch[];
  head: HeadState;
  commitOrder: string[]; // ordered list of commit ids for rendering
};

export type RebaseAction = "pick" | "squash" | "drop" | "reword" | "edit";

export type RebaseEntry = {
  action: RebaseAction;
  commitId: string;
  newMessage?: string;
};

export type CommandResult = {
  success: boolean;
  message: string;
  type: "info" | "error" | "success" | "warning";
  steps?: SerializableRepository[];
};

export type GitCommand =
  | { type: "checkout"; target: string }
  | { type: "switch"; target: string }
  | { type: "branch"; name: string; startPoint?: string }
  | { type: "branch-delete"; name: string }
  | { type: "commit"; message: string }
  | { type: "merge"; branch: string }
  | { type: "rebase"; onto: string }
  | { type: "rebase-interactive"; onto: string; entries: RebaseEntry[] }
  | { type: "log" }
  | { type: "status" }
  | { type: "branch-list" }
  | { type: "help" };

// Serializable version of Repository for levels
export type SerializableRepository = {
  commits: { id: string; message: string; parents: string[]; timestamp: number; branch?: string; copiedFrom?: string }[];
  branches: Branch[];
  head: HeadState;
  commitOrder: string[];
};
