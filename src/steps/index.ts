import { createSpinner } from "nanospinner";

import type {
  InternalReleaseContext,
  ResolvedConfig,
  Task,
} from "../config/types.ts";
import { HOOKS, LogLevels } from "../constants.ts";
import type { HookEvent } from "../options.ts";
import { runHook } from "../utils/hook.ts";
import { effect, hasChangelog, logger, runInDryRun } from "../utils/index.ts";
import type { ResolvedConfigWithChangelog } from "../utils/type.ts";
import { bump } from "./bump.ts";
import { confirmChangelog } from "./confirmChangelog.ts";
import { genChangelog } from "./genChangelog.ts";
import { gitAdd, gitCommit, gitPush, gitTag } from "./git.ts";
import { selectTag } from "./selectTag.ts";
import { selectVersion } from "./selectVersion.ts";
import { summary } from "./summary.ts";
export * from "./createContext.ts";

const hookTask = (hookName: HookEvent): Task => ({
  run: async (config, ctx) => {
    await runHook(config, ctx, hookName, config.hooks?.[hookName]);
  },
  effect: `run hook ${hookName}`,
});

const changelogTasks: Task<ResolvedConfigWithChangelog>[] = [
  hookTask(HOOKS.BEFORE_CHANGELOG),
  {
    run: async (config, context) => {
      await genChangelog(config, context);
    },
  },
  hookTask(HOOKS.AFTER_CHANGELOG),
  {
    run: async (config, context) => {
      await runInDryRun(config, () => {
        logger.box(context.git.changelog);
      });
    },
  },
  {
    run: async (config, context) => {
      await confirmChangelog(context);
    },
  },
];

const gitTasks: Task[] = [
  hookTask(HOOKS.BEFORE_GIT),
  hookTask(HOOKS.BEFORE_GIT_ADD),
  {
    run: async (config) => {
      await gitAdd(config);
    },
    effect: "git add",
  },
  hookTask(HOOKS.AFTER_GIT_ADD),
  hookTask(HOOKS.BEFORE_GIT_COMMIT),
  {
    run: async (config, context) => {
      await gitCommit(config, context);
    },
    effect: "git commit",
  },
  hookTask(HOOKS.AFTER_GIT_COMMIT),
  hookTask(HOOKS.BEFORE_GIT_TAG),
  {
    run: async (config, context) => {
      await gitTag(config, context);
    },
    effect: "git tag",
  },
  hookTask(HOOKS.AFTER_GIT_TAG),
  hookTask(HOOKS.BEFORE_GIT_PUSH),
  {
    run: async (config, context) => {
      await gitPush(config, context);
    },
    effect: "git push",
  },
  hookTask(HOOKS.AFTER_GIT_PUSH),
  hookTask(HOOKS.AFTER_GIT),
];

export const steps: Task[] = [
  hookTask(HOOKS.BEFORE_INIT),
  hookTask(HOOKS.BEFORE_SELECT_VERSION),
  {
    run: selectVersion,
  },
  hookTask(HOOKS.AFTER_SELECT_VERSION),
  hookTask(HOOKS.BEFORE_SELECT_TAG),
  {
    run: selectTag,
  },
  hookTask(HOOKS.AFTER_SELECT_TAG),
  // 变更日志
  {
    run: async (config, ctx) => {
      if (!hasChangelog(config)) return;
      await runTasks(changelogTasks, config, ctx);
    },
  },

  // bump
  hookTask(HOOKS.BEFORE_BUMP),
  {
    run: async (config, context) => {
      await bump(config, context);
    },
    effect: (ctx) => `bump version: ${ctx.latestVersion} → ${ctx.version}`,
  },
  hookTask(HOOKS.AFTER_BUMP),
  {
    run: async (config, context) => {
      await summary(context);
    },
  },
  {
    run: async (config, ctx) => {
      const isDebug = config.verbose >= LogLevels.debug;

      const spinner = isDebug ? null : createSpinner("Releasing…").start();

      try {
        await runTasks(gitTasks, config, ctx);
      } finally {
        spinner?.stop();
      }
    },
  },
];

export async function runTasks<T extends ResolvedConfig>(
  tasks: Task<T>[],
  config: T,
  ctx: InternalReleaseContext,
) {
  for (const task of tasks) {
    if (!task.effect) {
      await task.run(config, ctx);
      continue;
    }

    const desc =
      typeof task.effect === "function" ? task.effect(ctx) : task.effect;

    await effect(config, desc, () => task.run(config, ctx));
  }
}
