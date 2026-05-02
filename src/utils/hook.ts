import ansis from "ansis";
import { Listr } from "listr2";
import { x } from "tinyexec";

import type { HookItems, InternalReleaseContext } from "../config/types.ts";
import type { HookFn } from "../options.ts";
import { renderTemplate } from "./index.ts";

export async function runHook(
  hookName: string,
  hooks?: HookItems,
  context?: InternalReleaseContext,
) {
  if (!hooks?.length || !context) return;

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
                      stdio: "pipe",
                    },
                  });
                } else {
                  const { initialRef: _, ...publicCtx } = context;

                  // 静默函数输出
                  await muteStdout(() => hook(publicCtx));
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

async function muteStdout<T>(fn: () => Promise<T> | T): Promise<T> {
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
