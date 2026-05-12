import type { UserConfig } from "./options.ts";

export type { ReleaseContext, UserConfig } from "./options.ts";

/**
 * 用于 `smarty-release` 配置文件：e.g.`smarty-release.config.*`
 */
export const defineConfig = (config: UserConfig) => config;
