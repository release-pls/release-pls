import { parse } from "valibot";

import { NAME } from "../constants.ts";
import type {
  ChangelogOptions,
  Hook,
  HookEvent,
  Hooks,
  UserConfig,
} from "../options.ts";
import { defu } from "../utils/index.ts";
import { inlineConfigSchema } from "./configSchema.ts";
import defaultsConfig from "./defaults.ts";
import { loadConfig } from "./index.ts";
import type {
  InlineConfig,
  LogLevelName,
  NormalizedHooks,
  ResolvedConfig,
} from "./types.ts";

type Args = NonNullable<ChangelogOptions["args"]>;

export async function resolveConfig(
  inlineConfig: InlineConfig = {},
): Promise<ResolvedConfig> {
  // 加载配置
  const fileConfig = await loadConfig<UserConfig>(NAME, inlineConfig.config);

  // 合并选项
  const merged = defu(inlineConfig, fileConfig, defaultsConfig);

  // 验证参数合法性
  parse(inlineConfigSchema, merged);

  // 参数归一化处理
  const resolved: ResolvedConfig = {
    ...merged,
    git: {
      ...merged.git,
      changelog: normalizeChangelog(merged.git.changelog),
    },
    hooks: normalizeHooks(merged.hooks),
    verbose: normalizeVerbose(merged.verbose),
  };

  return resolved;
}

function normalizeVerbose(v: boolean[]): LogLevelName {
  if (v.length >= 2) return "debug";
  if (v.length === 1) return "verbose";
  return "default";
}

function normalizeHooks(hooks: Hooks = {}) {
  const result: NormalizedHooks = {};

  for (const [event, hook] of Object.entries(hooks) as [HookEvent, Hook][]) {
    result[event] = normalizeHookValue(hook);
  }

  return result;
}

function normalizeHookValue(hook?: Hook) {
  if (!hook) return [];
  return Array.isArray(hook) ? hook : [hook];
}

function normalizeChangelog(changelog: false | Required<ChangelogOptions>) {
  if (changelog === false) return false;

  return {
    ...changelog,
    args: normalizeArgs(changelog.args),
  };
}

function normalizeArgs(args: Args): string[] {
  if (Array.isArray(args)) return args;
  return args.trim().split(/\s+/);
}
