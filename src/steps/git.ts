import { x } from "tinyexec";

import type {
  InternalReleaseContext,
  ResolvedConfig,
} from "../config/types.ts";
import { GitCommitError, GitPushError, GitTagError } from "../errors.ts";

export async function gitAdd() {
  await x("git", ["add", "."], {
    throwOnError: true,
  });
}

export async function gitCommit(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  try {
    await x(
      "git",
      ["commit", ...config.git.commitArgs, "-m", context.git.commitMessage],
      {
        throwOnError: true,
      },
    );
  } catch {
    throw new GitCommitError();
  }
}

export async function gitTag(context: InternalReleaseContext) {
  try {
    await x("git", ["tag", "-f", context.git.tagName], {
      throwOnError: true,
    });
  } catch {
    throw new GitTagError();
  }
}

export async function gitPush(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  const isDebug = config.verbose === "debug";

  try {
    await x(
      "git",
      ["push", "origin", "HEAD", `refs/tags/${context.git.tagName}`],
      {
        throwOnError: true,
        nodeOptions: {
          stdio: isDebug ? "inherit" : "pipe",
        },
      },
    );
  } catch {
    throw new GitPushError();
  }
}
