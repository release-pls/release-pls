import { run, renderTemplate } from "../utils/index.js";
import ora from "ora";

export async function gitAdd(config, ctx) {
  await run("git", ["add", "."]);
}

export async function gitCommit(config, ctx) {
  const message = renderTemplate(config.git?.commitMessage, ctx);
  await run("git", ["commit", "--no-verify", "-s", "-m", message]);
}

export async function gitTag(config, ctx) {
  const tagName = renderTemplate(config.git?.tagName, ctx);
  await run("git", ["tag", tagName]);
}

export async function gitPush(config, ctx) {
  const spinner = ora("Releasing…").start();
  const tagName = renderTemplate(config.git?.tagName, ctx);
  await run("git", ["push"]);
  await run("git", ["push", "origin", `refs/tags/${tagName}`]);
  spinner.stop();
}
