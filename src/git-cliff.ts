import type { SpawnOptions } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { arch as getArch, platform as getPlatform } from "os";
import { parse, stringify } from "smol-toml";
import { x } from "tinyexec";

import type { NormalizedChangelogOptions } from "./config/types.ts";
import { NAME } from "./constants.ts";
import { outputFile, remove } from "./utils/fs.ts";
import { defu } from "./utils/index.ts";

const require = createRequire(import.meta.url);
// 当前脚本所在目录
const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheDir = resolve(process.cwd(), "node_modules", `.${NAME}`);

// 生成变更日志
export async function runGitCliff(
  options: NormalizedChangelogOptions,
  spawnOptions: SpawnOptions = {},
) {
  const args = filterArgs(options.args);

  const tmpConfigFile = await resolveTemplateConfig(options);

  args.push(...["--config", tmpConfigFile]);

  const bin = getExePath();

  const { stdout } = await x(bin, args, {
    nodeOptions: {
      stdio: "pipe",
      ...spawnOptions,
    },
    throwOnError: true,
  });

  await remove(cacheDir);
  return stdout;
}

function filterArgs(args: string[]): string[] {
  const skip = new Set(["--config", "-c"]);

  const result: string[] = [];

  for (const arg of args) {
    if (arg.startsWith("--config=")) continue;

    if (skip.has(arg)) {
      continue;
    }

    result.push(arg);
  }

  return result;
}

async function resolveTemplateConfig(options: NormalizedChangelogOptions) {
  const defaultTplPath = resolve(
    __dirname,
    "..",
    "templates",
    `${options.template}.toml`,
  );

  if (!existsSync(defaultTplPath)) {
    throw new Error(`Default template file not found: ${defaultTplPath}`);
  }

  const defaultTplRaw = await readFile(defaultTplPath, "utf-8");
  const defaultTplConfig = parse(defaultTplRaw);

  const finalConfig = defu(options.config, defaultTplConfig);

  const tmpFile = join(cacheDir, `gitcliff-${randomUUID()}.toml`);

  await outputFile(tmpFile, stringify(finalConfig));

  return tmpFile;
}

function getExePath() {
  const platform = getPlatform();
  const arch = getArch();

  let os = platform as string;
  let extension = "";

  if (platform === "win32" || platform === "cygwin") {
    os = "windows";
    extension = ".exe";
  }

  try {
    return require.resolve(`git-cliff-${os}-${arch}/bin/git-cliff${extension}`);
  } catch (e) {
    throw new Error(
      `Couldn't find git-cliff binary inside node_modules for ${os}-${arch}`,
      { cause: e },
    );
  }
}
