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
