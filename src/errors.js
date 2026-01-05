export class CancelledError extends Error {
  constructor(message = "Release cancelled by user") {
    super(message);
    this.name = "CancelledError";
    this.code = "USER_CANCEL";
    this.isCancelled = true;
  }
}
export class NotGitRepoError extends Error {
  constructor(message = "Current working directory is not a git repository.") {
    super(message);
    this.name = "NotGitRepoError";
    this.code = "NOT_GIT_REPO";
  }
}

export class GitDirtyError extends Error {
  constructor(
    message = "Working directory is not clean. Please commit your changes."
  ) {
    super(message);
    this.name = "GitDirtyError";
    this.code = "GIT_DIRTY";
  }
}
