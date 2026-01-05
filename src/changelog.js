import { merge } from "lodash-es";
import defaultsConf from "./defaults.js";
import { temporaryFile } from "tempy";
import { writeFile, unlink, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse, stringify } from "smol-toml";
import { runGitCliff } from "git-cliff";

// 当前脚本所在目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 生成变更日志
export async function changelog(config = {}) {
  let { args, template } = merge({}, defaultsConf, config).changelog;
  args = filterArgs(args);

  let tmpConfigFile;

  if (shouldUseTemplate(template)) {
    tmpConfigFile = await resolveTemplateConfig(template);
    args = [...args, "--config", tmpConfigFile];
  }

  await runGitCliff(args, {
    stdio: "ignore",
  });
  tmpConfigFile && (await unlink(tmpConfigFile));
}

function filterArgs(input) {
  return input.filter(
    (arg, i, arr) =>
      arg !== "--config" &&
      arg !== "-c" &&
      !arg.startsWith("--config=") &&
      arr[i - 1] !== "--config" &&
      arr[i - 1] !== "-c"
  );
}

function shouldUseTemplate(template) {
  if (!template) return false;
  if (Array.isArray(template) && template.length === 0) return false;
  return true;
}

async function resolveTemplateConfig(template) {
  const [templateName, userTplOptions = {}] = template;

  const defaultTplPath = path.resolve(
    __dirname,
    "..",
    "templates",
    `${templateName}.toml`
  );

  if (!existsSync(defaultTplPath)) {
    throw new Error(`Default template file not found: ${defaultTplPath}`);
  }

  const defaultTplRaw = await readFile(defaultTplPath, "utf-8");
  const defaultTplConfig = parse(defaultTplRaw);

  const finalConfig = merge({}, defaultTplConfig, userTplOptions);

  const tmpFile = temporaryFile({ extension: "toml" });
  await writeFile(tmpFile, stringify(finalConfig));

  return tmpFile;
}
