import type {
  InternalReleaseContext,
  ResolvedConfig,
  Task,
} from "../config/types.ts";
import { HOOKS } from "../constants.ts";
import type { HookEvent } from "../options.ts";
import { runHook } from "../utils/hook.ts";
import { effect, hasChangelog, logger, runInDryRun } from "../utils/index.ts";
import { bump } from "./bump.ts";
import { confirmChangelog } from "./confirmChangelog.ts";
import { genChangelog } from "./genChangelog.ts";
import { gitAdd, gitCommit, gitPush, gitTag } from "./git.ts";
import { selectTag } from "./selectTag.ts";
import { selectVersion } from "./selectVersion.ts";
import { summary } from "./summary.ts";
export * from "./createContext.ts";

const hookTask = (
  hook: HookEvent,
  condition?: (config: ResolvedConfig, ctx: InternalReleaseContext) => boolean,
): Task => ({
  run: async (config, ctx) => {
    if (condition && !condition(config, ctx)) return;
    await runHook(hook, config.hooks?.[hook], ctx);
  },
  effect: `run hook ${hook}`,
});

const steps: Task[] = [
  hookTask(HOOKS.BEFORE_INIT),
  hookTask(HOOKS.BEFORE_SELECT_VERSION),
  {
    run: selectVersion,
    effect: false,
  },
  hookTask(HOOKS.AFTER_SELECT_VERSION),
  hookTask(HOOKS.BEFORE_SELECT_TAG),
  {
    run: selectTag,
    effect: false,
  },
  hookTask(HOOKS.AFTER_SELECT_TAG),
  // 变更日志
  hookTask(HOOKS.BEFORE_CHANGELOG, (config) => hasChangelog(config)),
  {
    run: async (config, context) => {
      if (!hasChangelog(config)) return;
      await genChangelog(config, context);
    },
    effect: false,
  },
  hookTask(HOOKS.AFTER_CHANGELOG, (config) => hasChangelog(config)),
  {
    run: async (config, context) => {
      await runInDryRun(config, () => {
        logger.box(context.git.changelog);
      });
    },
    effect: false,
  },
  {
    run: async (config, context) => {
      if (!hasChangelog(config)) return;
      await confirmChangelog(context);
    },
    effect: false,
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
    effect: false,
  },
  hookTask(HOOKS.BEFORE_GIT),
  hookTask(HOOKS.BEFORE_GIT_ADD),
  {
    run: async () => {
      await gitAdd();
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
      await gitTag(context);
    },
    effect: "git tag",
  },
  hookTask(HOOKS.AFTER_GIT_TAG),
  hookTask(HOOKS.BEFORE_GIT_PUSH),
  {
    run: async (config, context) => {
      await gitPush(context);
    },
    effect: "git push",
  },
  hookTask(HOOKS.AFTER_GIT_PUSH),
  hookTask(HOOKS.AFTER_GIT),
  hookTask(HOOKS.AFTER_RELEASE),
];

export async function runStep(
  config: ResolvedConfig,
  ctx: InternalReleaseContext,
) {
  for (const task of steps) {
    if (!task.effect) {
      await task.run(config, ctx);
      continue;
    }

    const desc =
      typeof task.effect === "function" ? task.effect(ctx) : task.effect;

    await effect(config, desc, () => task.run(config, ctx));
  }
}
