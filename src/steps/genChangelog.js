import { changelog } from "../changelog.js";
import prompts from "prompts";
import { CancelledError } from "../errors.js";
import { renderTemplate } from "../utils/index.js";

export async function genChangelog(config, ctx) {
  // 格式化args参数

  config.changelog.args = transformArgs(config.changelog.args, ctx);

  await changelog(config);

  const { yes: changelogOk } = await prompts({
    type: "confirm",
    name: "yes",
    message: `Changelog generated. Does it look good?`,
  });

  if (!changelogOk) {
    throw new CancelledError();
  }
}

function transformArgs(input, ctx) {
  if (typeof input !== "string" && !Array.isArray(input)) {
    throw new TypeError("Expected string or array");
  }
  const arr = typeof input === "string" ? input.trim().split(/\s+/) : input;

  return arr.map((v) => renderTemplate(v, ctx));
}
