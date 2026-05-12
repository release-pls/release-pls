import type { ReleaseType } from "semver";
import * as v from "valibot";

import { NAME } from "../constants.ts";
import type { HookFn, InlineConfig, ResolvedConfig } from "../options.ts";

/**
 * 基础类型
 */
const stringOrStringArray = v.union([v.string(), v.array(v.string())]);

/**
 * Hook
 */

const hookItem = v.union([
  v.string(),
  v.custom<HookFn>((input): input is HookFn => typeof input === "function"),
]);

const hooks = v.optional(
  v.record(
    v.string(),
    v.pipe(
      v.union([hookItem, v.array(hookItem)]),
      v.transform((value) => (Array.isArray(value) ? value : [value])),
    ),
  ),
);

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

/**
 * ChangelogOptions
 */
const changelogOptions = v.object({
  args: v.pipe(
    v.optional(stringOrStringArray, "-o --tag ${version}"),
    v.transform((v) => (Array.isArray(v) ? v : v.trim().split(/\s+/))),
  ),
  template: v.optional(v.string(), "github"),
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

const releaseTypeSchema = v.picklist([
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease",
] satisfies ReleaseType[]);

export const userConfigSchema = v.object({
  increments: v.optional(v.array(releaseTypeSchema), [
    "patch",
    "minor",
    "major",
  ]),
  tags: v.optional(v.array(v.string()), ["latest", "next"]),
  git,
  hooks,
});

export const inlineConfigSchema: v.GenericSchema<InlineConfig, ResolvedConfig> =
  v.intersect([
    userConfigSchema,
    v.object({
      cwd: v.optional(v.string(), process.cwd()),
      config: v.optional(v.string()),
      dryRun: v.optional(v.boolean(), false),
      verbose: v.pipe(
        v.optional(v.array(v.boolean()), []),
        v.transform((value) => value.length),
      ),
    }),
  ]);
