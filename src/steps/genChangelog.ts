import { createSpinner } from "nanospinner";

import type {
  ChangelogOptions,
  InternalReleaseContext,
} from "../config/types.ts";
import type { ResolvedConfig } from "../config/types.ts";
import { OUTPUT_FLAGS } from "../constants.ts";
import { GenerateChangelogError } from "../errors.ts";
import { runGitCliff } from "../git-cliff.ts";
import { getFlagValue, hasFlag, removeFlag } from "../utils/argv.ts";
import { renderTemplate, runInDryRun } from "../utils/index.js";

export async function genChangelog(
  changelog: ChangelogOptions,
  config: ResolvedConfig,
  context: InternalReleaseContext,
) {
  try {
    changelog.args = renderArgs(changelog.args, context);

    // dry-run模式下永远都把输出选项都移除掉
    await runInDryRun(config, () => {
      changelog.args = removeFlag(changelog.args, OUTPUT_FLAGS);
    });
    const spinner = createSpinner("Generating changelog, please wait…").start();

    const stdout = await runGitCliff(changelog);

    const hasOutput = hasFlag(changelog.args, OUTPUT_FLAGS);

    if (hasOutput) {
      const changelogFile = getFlagValue(changelog.args, OUTPUT_FLAGS);

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
