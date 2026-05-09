import { parse } from "valibot";

import { NAME } from "../constants.ts";
import type { UserConfig } from "../options.ts";
import { defu } from "../utils/index.ts";
import { inlineConfigSchema } from "./configSchema.ts";
import { loadConfig } from "./index.ts";
import type { InlineConfig, ResolvedConfig } from "./types.ts";

export async function resolveConfig(
  inlineConfig: InlineConfig = {},
): Promise<ResolvedConfig> {
  // 加载配置
  const fileConfig = await loadConfig<UserConfig>(NAME, inlineConfig.config);

  // 合并选项
  const merged = defu(inlineConfig, fileConfig);

  // 验证参数合法性
  return parse(inlineConfigSchema, merged);
}
