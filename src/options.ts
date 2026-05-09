import type { ConsolaInstance } from "consola";
import type * as v from "valibot";

import type { userConfigSchema } from "./config/configSchema.ts";

export type UserConfig = v.InferInput<typeof userConfigSchema>;

/**
 * 用于 `smarty-release` 配置文件：e.g.`smarty-release.config.*`
 */
export const defineConfig = (config: UserConfig) => config;

/**
 * CLI运行时产生的一些配置
 */
export interface ReleaseContext {
  name: string;
  tag: string;
  latestVersion: string;
  version: string;
  branchName: string;
  git: {
    changelog: string;
    commitMessage: string;
    tagName: string;
  };
  repo: {
    remote: string;
    protocol: string;
    host: string;
    owner: string;
    repository: string;
    project: string;
  };
  logger: ConsolaInstance;
  cancel(message?: string): never;
}
