import ansis from "ansis";
import { Listr } from "listr2";
import { x } from "tinyexec";

import type {
  HookFn,
  InternalReleaseContext,
  NormalizedHook,
  ResolvedConfig,
} from "../config/types.ts";
import { LogLevels } from "../constants.ts";
import { renderTemplate } from "./index.ts";

export async function runHook(
  config: ResolvedConfig,
  context: InternalReleaseContext,
  hookName: string,
  hooks?: NormalizedHook,
) {
  if (!hooks?.length) return;

  const isHooksOutput = config.verbose >= LogLevels.hooks;

  const tasks = new Listr(
    {
      title: ansis.dim(`${hookName} (${hooks.length} hooks)`),
      task: () =>
        new Listr(
          hooks.map((hook, index) => {
            const title = ansis.dim(getHookTitle(hook, index, context));

            return {
              title,
              task: async () => {
                if (typeof hook === "string") {
                  const cmd = renderTemplate(hook, context);

                  await x(cmd, [], {
                    nodeOptions: {
                      shell: true,
                      stdio: isHooksOutput ? "inherit" : "pipe",
                    },
                  });
                } else {
                  const { initialRef: _, ...publicCtx } = context;

                  // 静默函数输出
                  await muteStdout(() => hook(publicCtx), {
                    mute: isHooksOutput ? false : true,
                  });
                }
              },
            };
          }),
          {
            concurrent: false, // 顺序执行子任务
          },
        ),
    },
    {
      concurrent: false,
      renderer: isHooksOutput ? "verbose" : "default",
    },
  );

  await tasks.run();
}

function getHookTitle(
  hook: HookFn | string,
  index: number,
  context: InternalReleaseContext,
) {
  if (typeof hook === "string") {
    return renderTemplate(hook, context);
  }

  const name = hook.name?.trim();

  if (name) {
    return `fn:${name}`;
  }

  return `fn:<anonymous-${index + 1}>`;
}

async function muteStdout<T>(
  fn: () => Promise<T> | T,
  options: { mute?: boolean } = { mute: true },
): Promise<T> {
  if (!options.mute) {
    return fn();
  }

  const stdoutWrite = process.stdout.write.bind(process.stdout);
  const stderrWrite = process.stderr.write.bind(process.stderr);

  const noop: typeof process.stdout.write = (..._args) => true;

  process.stdout.write = noop;
  process.stderr.write = noop;

  try {
    return await fn();
  } finally {
    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  }
}
