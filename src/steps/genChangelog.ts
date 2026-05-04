import mri from "mri";
import { createSpinner } from "nanospinner";

import type { FlagName, InternalReleaseContext } from "../config/types.ts";
import { OUTPUT_FLAGS } from "../constants.ts";
import { GenerateChangelogError } from "../errors.ts";
import { runGitCliff } from "../git-cliff.ts";
import { renderTemplate, runInDryRun } from "../utils/index.js";
import type { ResolvedConfigWithChangelog } from "../utils/type.ts";

export async function genChangelog(
  config: ResolvedConfigWithChangelog,
  context: InternalReleaseContext,
) {
  try {
    config.git.changelog.args = renderArgs(config.git.changelog.args, context);

    // dry-run模式下永远都把输出选项都移除掉
    await runInDryRun(config, () => {
      config.git.changelog.args = removeFlag(
        config.git.changelog.args,
        OUTPUT_FLAGS,
      );
    });
    const spinner = createSpinner("Generating changelog, please wait…").start();

    const stdout = await runGitCliff(config.git.changelog);

    const cli = parseArgv(config.git.changelog.args);

    const hasOutput = cli.hasFlag(OUTPUT_FLAGS);

    if (hasOutput) {
      const changelogFile = cli.getFlagValue<string | boolean>(OUTPUT_FLAGS);

      context.git.changelog =
        typeof changelogFile === "string" ? changelogFile : "CHANGELOG.md";
    } else {
      context.git.changelog = stdout;
    }

    spinner.stop();
  } catch {
    throw new GenerateChangelogError();
  }
}

function renderArgs(args: string[], context: InternalReleaseContext) {
  return args.map((v) => renderTemplate(v, context));
}

function isStringArray(x: FlagName): x is readonly string[] {
  return Array.isArray(x);
}

function normalizeNames(name: FlagName): readonly string[] {
  return isStringArray(name) ? name : [name];
}

function parseArgv(argv: string[]) {
  const args = mri(argv);

  return {
    hasFlag(name: FlagName): boolean {
      const names = normalizeNames(name);
      return names.some((n) => args[n] !== undefined);
    },

    getFlagValue<T = unknown>(name: FlagName): T | undefined {
      const names = normalizeNames(name);

      for (const n of names) {
        if (args[n] !== undefined) {
          return args[n] as T;
        }
      }
    },
  };
}

function removeFlag(argv: string[], name: FlagName): string[] {
  const names = normalizeNames(name);

  const isFlag = (arg: string) =>
    names.some(
      (n) => arg === `-${n}` || arg === `--${n}` || arg.startsWith(`--${n}=`),
    );

  const result: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;

    if (isFlag(arg)) {
      // 如果是 --xxx value 或 -x value
      if (!arg.includes("=")) {
        const next = argv[i + 1];
        if (next && !next.startsWith("-")) {
          i++; // 跳过 value
        }
      }
      continue;
    }

    result.push(arg);
  }

  return result;
}
