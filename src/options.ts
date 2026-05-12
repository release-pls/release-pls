import type { ConsolaInstance } from "consola";
import type { ReleaseType } from "semver";

import type { MarkPartial, Overwrite } from "./utils/type.ts";

export type ChangelogTemplate =
  | "azure-devops-keepachangelog"
  | "cocogitto"
  | "detailed"
  | "github-keepachangelog"
  | "github"
  | "keepachangelog"
  | "minimal"
  | "scoped"
  | "scopesorted"
  | "statistics"
  | "unconventional"
  | (string & {}); // 任意字符串，兼容远程链接

type RemoteProviderConfig = {
  owner?: string;
  repo?: string;
  token?: string;
};

// commit parser 类型
export interface CommitParser {
  message: string; // 正则或匹配字符串
  group?: string; // 分组
  default_scope?: string;
  skip?: boolean; //默认跳过
}

export interface LinkParsers {
  pattern?: string;
  href?: string;
}

// git 配置
export interface ChangelogGitConfig {
  conventional_commits?: boolean;
  filter_unconventional?: boolean;
  require_conventional?: boolean;
  split_commits?: boolean;
  commit_parsers?: CommitParser[];
  protect_breaking_commits?: false;
  filter_commits?: boolean;
  fail_on_unmatched_commit?: boolean;
  tag_pattern?: string;
  skip_tags?: string;
  ignore_tags?: string;
  topo_order?: boolean;
  topo_order_commits?: boolean;
  sort_commits?: "oldest" | "newest";
  link_parsers?: LinkParsers[];
  limit_commits?: number;
  recurse_submodules?: boolean;
  include_paths?: string[];
  exclude_paths?: string[];
}

// changelog 内容配置
export interface ChangelogContentConfig {
  header?: string;
  body?: string;
  footer?: string;
  trim?: boolean;
}

export interface ChangelogBumpConfig {
  bump_type?: string;
  features_always_bump_minor?: boolean;
  breaking_always_bump_major?: boolean;
  custom_major_increment_regex?: string;
  custom_minor_increment_regex?: string;
  initial_tag?: string;
}

// remote 配置
export interface ChangelogRemoteConfig {
  github?: RemoteProviderConfig;
  azure_devops?: RemoteProviderConfig;
  gitlab?: RemoteProviderConfig;
  gitea?: RemoteProviderConfig;
  bitbucket?: RemoteProviderConfig;
}

export interface ChangelogConfig {
  bump?: ChangelogBumpConfig;
  changelog?: ChangelogContentConfig;
  git?: ChangelogGitConfig;
  remote?: ChangelogRemoteConfig;
}

export type ChangelogOptions = {
  args?: string | string[];
  template?: ChangelogTemplate;
  config?: ChangelogConfig;
};

type DistTag =
  | "latest"
  | "next"
  | "beta"
  | "alpha"
  | "canary"
  | "rc"
  | (string & {}); // 允许自定义

export type HookPrefix = "before" | "after";

type StepName =
  | "selectVersion"
  | "selectTag"
  | "changelog"
  | "bump"
  | "git"
  | "git.add"
  | "git.commit"
  | "git.tag"
  | "git.push";

export type HookEvent =
  | "before:init"
  | `before:${StepName}`
  | `after:${StepName}`
  | `after:release`;

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

export type HookFn = (context: ReleaseContext) => void | Promise<void>;
export type NormalizedHook = (HookFn | string)[];
type Hooks = Partial<Record<HookEvent, HookFn | string | NormalizedHook>>;

/**
 * Options for smarty-release.
 */
export interface UserConfig {
  /**
   * 控制版本号递增类型（符合语义化版本 SemVer）
   *
   * @example
   *  patch → 修复 bug（1.0.0 → 1.0.1）
   *  minor → 新功能（1.0.0 → 1.1.0）
   *  major → 破坏性更新（1.0.0 → 2.0.0）
   */
  increments?: ReleaseType[];

  /**
   * 发布时使用的 npm dist-tag
   */
  tags?: DistTag[];

  /** 控制 Git 操作行为 */
  git?: {
    /** 变更日志是否生成 */
    changelog?: false | ChangelogOptions;
    requireBranch?: string | string[] | RegExp | false;
    commitMessage?: string;
    commitArgs?: string[];
    tagName?: string;
  };

  /** 生命周期钩子 */
  hooks?: Hooks;
}

export interface InlineConfig extends UserConfig {
  config?: string;
  dryRun?: boolean;
  verbose?: boolean[];
  cwd?: string;
}

export type ResolvedChangelogOptions = Overwrite<
  MarkPartial<ChangelogOptions, "config">,
  {
    args: string[];
  }
>;

export type ResolvedGitConfig = Overwrite<
  Required<NonNullable<InlineConfig["git"]>>,
  {
    changelog: false | ResolvedChangelogOptions;
  }
>;

export type ResolvedConfig = Overwrite<
  MarkPartial<InlineConfig, "config">,
  {
    verbose: number;
    hooks?: Partial<Record<HookEvent, NormalizedHook>>;
    git: ResolvedGitConfig;
  }
>;

export interface InternalReleaseContext extends ReleaseContext {
  initialRef: string;
}

export type Task = {
  run: (
    config: ResolvedConfig,
    ctx: InternalReleaseContext,
  ) => void | Promise<void>;
  effect?: string | ((ctx: InternalReleaseContext) => string) | false;
};
