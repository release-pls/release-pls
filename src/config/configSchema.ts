import type { ReleaseType } from "semver";
import * as v from "valibot";

import { NAME } from "../constants.ts";
import type { HookFn } from "./types.ts";

/**
 * 基础类型
 */
const stringOrStringArray = v.union([v.string(), v.array(v.string())]);

/**
 * HookEvent
 */
export const hookEvent = v.union([
  v.literal("before:init"),
  v.literal("before:selectVersion"),
  v.literal("after:selectVersion"),
  v.literal("after:bump"),
  v.literal("after:release"),
  v.literal("before:selectTag"),
  v.literal("after:selectTag"),
  v.literal("before:changelog"),
  v.literal("after:changelog"),
  v.literal("before:bump"),
  v.literal("before:git"),
  v.literal("before:git.add"),
  v.literal("after:git.add"),
  v.literal("before:git.commit"),
  v.literal("after:git.commit"),
  v.literal("before:git.tag"),
  v.literal("after:git.tag"),
  v.literal("before:git.push"),
  v.literal("after:git.push"),
  v.literal("after:git"),
]);

/**
 * Hook
 */

// 运行时仅校验类型
const HookItemSchema = v.custom<string | HookFn>(
  (input) => typeof input === "string" || typeof input === "function",
);

export const HookValueSchema = v.pipe(
  v.union([HookItemSchema, v.array(HookItemSchema)]),
  v.transform((value) => (Array.isArray(value) ? value : [value])),
);

const hooks = v.optional(v.record(hookEvent, HookValueSchema), {});

/**
 * RemoteProviderConfig
 */
const remoteProviderConfig = v.object({
  owner: v.optional(v.string()),
  repo: v.optional(v.string()),
  token: v.optional(v.string()),
});

/**
 * Remote
 */
const remote = v.optional(
  v.object({
    github: v.optional(remoteProviderConfig),
    gitlab: v.optional(remoteProviderConfig),
    gitea: v.optional(remoteProviderConfig),
    bitbucket: v.optional(remoteProviderConfig),
    azure_devops: v.optional(remoteProviderConfig),
  }),
);

/**
 * Commit parser
 */
const commitParser = v.object({
  message: v.string(),
  group: v.optional(v.string()),
  default_scope: v.optional(v.string()),
  skip: v.optional(v.boolean()),
});

/**
 * Git changelog config
 */
const changelogGitConfig = v.object({
  conventional_commits: v.optional(v.boolean()),
  filter_unconventional: v.optional(v.boolean()),
  require_conventional: v.optional(v.boolean()),
  split_commits: v.optional(v.boolean()),
  commit_parsers: v.optional(v.array(commitParser)),
  protect_breaking_commits: v.optional(v.literal(false)),
  filter_commits: v.optional(v.boolean()),
  fail_on_unmatched_commit: v.optional(v.boolean()),
  tag_pattern: v.optional(v.string()),
  skip_tags: v.optional(v.string()),
  ignore_tags: v.optional(v.string()),
  topo_order: v.optional(v.boolean()),
  topo_order_commits: v.optional(v.boolean()),
  sort_commits: v.optional(v.union([v.literal("oldest"), v.literal("newest")])),
  link_parsers: v.optional(
    v.array(
      v.object({
        pattern: v.optional(v.string()),
        href: v.optional(v.string()),
      }),
    ),
  ),
  limit_commits: v.optional(v.number()),
  recurse_submodules: v.optional(v.boolean()),
  include_paths: v.optional(v.array(v.string())),
  exclude_paths: v.optional(v.array(v.string())),
});

/**
 * ChangelogConfig
 */
const changelogConfig = v.object({
  bump: v.optional(
    v.object({
      bump_type: v.optional(v.string()),
      features_always_bump_minor: v.optional(v.boolean()),
      breaking_always_bump_major: v.optional(v.boolean()),
      custom_major_increment_regex: v.optional(v.string()),
      custom_minor_increment_regex: v.optional(v.string()),
      initial_tag: v.optional(v.string()),
    }),
  ),
  changelog: v.optional(
    v.object({
      header: v.optional(v.string()),
      body: v.optional(v.string()),
      footer: v.optional(v.string(), `<!-- powered by ${NAME} -->`),
      trim: v.optional(v.boolean()),
    }),
    {},
  ),
  git: v.optional(changelogGitConfig),
  remote,
});

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

/**
 * ChangelogOptions
 */
const changelogOptions = v.object({
  args: v.pipe(
    v.optional(stringOrStringArray, "-o --tag ${version}"),
    v.transform((v) => (Array.isArray(v) ? v : v.trim().split(/\s+/))),
  ),
  template: v.optional(
    v.custom<ChangelogTemplate>((input) => typeof input === "string"),
    "github",
  ),
  config: v.optional(changelogConfig, {}),
});

/**
 * Git config（外层）
 */
const git = v.optional(
  v.object({
    changelog: v.optional(v.union([v.literal(false), changelogOptions]), {}),
    requireBranch: v.optional(
      v.union([
        v.string(),
        v.array(v.string()),
        v.instance(RegExp),
        v.literal(false),
      ]),
      false,
    ),
    commitMessage: v.optional(v.string(), "release: v${version}"),
    commitArgs: v.optional(v.array(v.string()), ["--no-verify", "-s"]),
    tagName: v.optional(v.string(), "v${version}"),
  }),
  {},
);

const IncrementSchema = v.custom<ReleaseType>(
  (input) => typeof input === "string",
);

type DistTag =
  | "latest"
  | "next"
  | "beta"
  | "alpha"
  | "canary"
  | "rc"
  | (string & {});

const DistTagSchema = v.custom<DistTag>((input) => typeof input === "string");

export const userConfigSchema = v.object({
  increments: v.optional(v.array(IncrementSchema), ["patch", "minor", "major"]),
  tags: v.optional(v.array(DistTagSchema), ["latest", "next"]),
  git,
  hooks,
});

/**
 * InlineConfig（最终）
 */
export const inlineConfigSchema = v.intersect([
  userConfigSchema,
  v.object({
    cwd: v.optional(v.string()),
    config: v.optional(v.string()),
    dryRun: v.optional(v.boolean(), false),
    verbose: v.pipe(
      v.optional(v.array(v.boolean()), []),
      v.transform((value) => value.length),
    ),
  }),
]);
