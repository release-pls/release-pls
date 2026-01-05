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

// 检查变更日志数据合法性,提升用户体验
function checkChangelogConf(config) {}

// 生成变更日志
export async function changelog(config = {}) {
  let { args, template } = merge({}, defaultsConf, config).changelog;

  console.log(template);

  args = filterArgs(args);
  //  拿到模板名称和用户配置
  const [templateName, userTplOptions] = template;

  // 读取本地templates目录下的默认的toml配置文件
  const defaultTplPath = path.resolve(
    __dirname,
    "templates",
    `${templateName}.toml`
  );

  if (!existsSync(defaultTplPath)) {
    throw new Error(`Default template file not found: ${defaultTplPath}`);
  }

  // 然后利用smol-toml的parse解析该配置项
  const defaultTplRaw = await readFile(defaultTplPath, "utf-8");
  const defaultTplConfig = parse(defaultTplRaw);

  // 然后拿到用户需要覆盖的配置
  const finalConfig = merge({}, defaultTplConfig, userTplOptions);

  // 然后再把该配置使用smol-toml的stringify转成toml,然后写入到一个临时目录得到配置文件的绝对路径
  const tmpFile = temporaryFile({ extension: "toml" });
  // 写入 TOML 内容
  await writeFile(tmpFile, stringify(finalConfig));

  // 然后再把该配置传递给runGitCliff让它指向这个配置

  const finalArgs = [...args, "--config", tmpFile];

  await runGitCliff(finalArgs);

  await unlink(tmpFile);
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
