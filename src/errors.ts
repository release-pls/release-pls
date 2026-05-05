// 基础错误类
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // 自动使用类名作为 name
  }
}

// 用户自己取消错误
export class CancelledError extends BaseError {
  constructor(message: string = "Release cancelled by user") {
    super(message);
  }
}

// 当前目录非 Git 仓库错误
export class NotGitRepoError extends BaseError {
  constructor(
    message: string = "Current working directory is not a git repository.",
  ) {
    super(message);
  }
}

// Git 工作目录不干净错误
export class GitDirtyError extends BaseError {
  constructor(
    message: string = "Working directory is not clean. Please commit your changes.",
  ) {
    super(message);
  }
}

export class GitNotInstalledError extends BaseError {
  constructor(
    message: string = "Git is not installed or not available in your PATH. Please install Git to continue.",
  ) {
    super(message);
  }
}

export class GitRemoteNotFoundError extends BaseError {
  constructor(
    message: string = "No Git remote repository found (e.g. 'origin'). Please add a remote using 'git remote add origin <url>'.",
  ) {
    super(message);
  }
}

export class GitRemoteParseError extends BaseError {
  constructor(
    message: string = "Failed to parse Git remote URL. Please ensure it is a valid Git repository URL (e.g. GitHub, GitLab, Bitbucket).",
  ) {
    super(message);
  }
}
export class GenerateChangelogError extends BaseError {
  constructor(message: string = "Failed to generate changelog.") {
    super(message);
  }
}
export class NotAllowedBranchError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class GitPushError extends BaseError {
  constructor(message = "Failed to push to remote repository.") {
    super(message);
  }
}

export class GitCommitError extends BaseError {
  constructor(message = "Failed to commit changes.") {
    super(message);
  }
}

export class GitTagError extends BaseError {
  constructor(message = "Failed to create git tag.") {
    super(message);
  }
}

export class GitBranchError extends BaseError {
  constructor(
    message = "Failed to determine current Git branch.",
    public cause?: unknown,
  ) {
    super(message);
  }
}

export class ExitSignal extends Error {
  constructor(
    public code: number = 0,
    public cause?: unknown,
  ) {
    super(`Exit with code ${code}`);
  }
}
