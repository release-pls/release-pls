import prompts from "prompts";
import { CancelledError } from "../errors.js";
import {
  workerDirRestore,
  gitChangeset,
  blank,
  renderTemplate,
} from "../utils/index.js";
import { logger } from "../utils/index.js";
import chalk from "chalk";

export async function summary(config, ctx) {
  const tagName = renderTemplate(config.git?.tagName, ctx);

  const entries = [
    ["Version", ctx.version],
    ["Npm Dist Tag", ctx.tag],
    ["Repository", ctx.repo.repository],
    ["Branch", ctx.git.branch],
    ["Git Tag", tagName],
  ];

  blank();
  logger.log(chalk.cyan("Summary:"));
  logger.log(chalk.gray("----------------------------------"));
  for (const [key, val] of entries) {
    logger.log(chalk.green(key.padEnd(20)), chalk.yellow(val));
  }
  blank();
  logger.log(chalk.cyan("Changeset:"));
  await gitChangeset();
  blank();

  const { ok } = await prompts(
    {
      type: "confirm",
      name: "ok",
      message: "Proceed with release",
      initial: false,
    },
    {
      // 当用户按 Ctrl+C 或 ESC 时触发
      onCancel() {
        throw new CancelledError();
      },
    }
  );

  if (ok === false) {
    await workerDirRestore(); // 恢复所有的变更
    throw new CancelledError();
  }
}
