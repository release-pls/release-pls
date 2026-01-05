#!/usr/bin/env node

import { Command } from "commander";
import { release } from "./index.js";
import { loadConfig } from "./config.js";
import { NAME } from "./constants/index.js";
import { logger } from "./utils/index.js";
import { changelog } from "./changelog.js";
import pkg from "../package.json" with { type: "json" };
import { CancelledError } from "./errors.js";
const program = new Command();

program
  .name("please-release")
  .version(pkg.version)
  .description("A lightweight, generic release CLI.")
  .option("--dry-run", "只模拟执行，不做实际发布")
  .option("-c, --config <path>", "指定配置文件路径")
  .action(async () => {
    const opts = program.opts();
    const config = await loadConfig(NAME, opts.config);

    await release(config);
  });

program
  .command("changelog [args...]")
  .description("生成 changelog 并透传 git-cliff 参数")
  .allowUnknownOption(true)
  .option("-c, --config <path>", "指定配置文件路径")
  .action(async (args) => {
    const opts = program.opts();
    const config = await loadConfig(NAME, opts.config, {
      changelog: {
        args,
      },
    });
    await changelog(config);
  });

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err) {
    err instanceof CancelledError
      ? logger.warn(err.message)
      : logger.error(err);
    process.exit(1);
  } else {
    process.exit(0);
  }
}
