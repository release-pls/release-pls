import { confirm } from "@inquirer/prompts";
import ansis from "ansis";

import type { InternalReleaseContext } from "../options.ts";
import { blank, gitChangeset } from "../utils/index.js";
import { logger } from "../utils/index.js";

export async function summary(context: InternalReleaseContext) {
  const summary = {
    Version: context.version,
    "Npm Dist Tag": context.tag,
    Owner: context.repo.owner,
    Repository: context.repo.repository,
    Branch: context.branchName,
    "Git Tag": context.git.tagName,
  };

  await renderSection("Summary:", () => {
    renderKeyValue(summary);
  });

  await renderSection("Changeset:", async () => {
    await gitChangeset();
  });

  blank();

  const ok = await confirm({
    message: `Releasing v${context.version} on ${context.tag}. Confirm?`,
    default: false,
  });

  if (ok === false) context.cancel();
}

function renderSection(title: string, fn: () => Promise<void> | void) {
  blank();
  logger.log(ansis.cyan(title));
  return fn();
}

function renderKeyValue(data: Record<string, string>) {
  const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));

  for (const [key, val] of Object.entries(data)) {
    logger.log(ansis.green(key.padEnd(maxKeyLength + 2)), ansis.yellow(val));
  }
}
