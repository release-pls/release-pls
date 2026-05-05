import { NonZeroExitError, x } from "tinyexec";

import type {
  InternalReleaseContext,
  ResolvedConfig,
} from "../config/types.ts";
import { LogLevels } from "../constants.ts";
import {
  ExitSignal,
  GitCommitError,
  GitPushError,
  GitTagError,
} from "../errors.ts";

export async function gitAdd(config: ResolvedConfig) {
  const isDebug = config.verbose >= LogLevels.debug;
  await x("git", ["add", "."], {
    throwOnError: true,
    nodeOptions: {
      stdio: isDebug ? "inherit" : "pipe",
    },
  });
}

export async function gitCommit(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  const isDebug = config.verbose >= LogLevels.debug;
  try {
    await x(
      "git",
      ["commit", ...config.git.commitArgs, "-m", context.git.commitMessage],
      {
        throwOnError: true,
        nodeOptions: {
          stdio: isDebug ? "inherit" : "pipe",
        },
      },
    );
  } catch (err: unknown) {
    if (isDebug && err instanceof NonZeroExitError) {
      throw new ExitSignal(err.exitCode, err);
    }
    throw new GitCommitError();
  }
}

export async function gitTag(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  const isDebug = config.verbose >= LogLevels.debug;
  try {
    await x("git", ["tag", "-f", context.git.tagName], {
      throwOnError: true,
      nodeOptions: {
        stdio: isDebug ? "inherit" : "pipe",
      },
    });
  } catch (err) {
    if (isDebug && err instanceof NonZeroExitError) {
      throw new ExitSignal(err.exitCode, err);
    }
    throw new GitTagError();
  }
}

export async function gitPush(
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  const isDebug = config.verbose >= LogLevels.debug;

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
  } catch (err) {
    if (isDebug && err instanceof NonZeroExitError) {
      throw new ExitSignal(err.exitCode, err);
    }
    throw new GitPushError();
  }
}
