import type { HookEvent } from "./options.ts";

export const NAME = "smarty-release";
export const OUTPUT_FLAGS = ["o", "output"] as const;
export const LogLevels = {
  default: 0,
  hooks: 1,
  debug: 2,
} as const;
export const HOOKS = {
  BEFORE_INIT: "before:init",
  BEFORE_SELECT_VERSION: "before:selectVersion",
  AFTER_SELECT_VERSION: "after:selectVersion",
  BEFORE_SELECT_TAG: "before:selectTag",
  AFTER_SELECT_TAG: "after:selectTag",
  BEFORE_CHANGELOG: "before:changelog",
  AFTER_CHANGELOG: "after:changelog",
  BEFORE_BUMP: "before:bump",
  AFTER_BUMP: "after:bump",
  BEFORE_GIT: "before:git",
  AFTER_GIT: "after:git",
  BEFORE_GIT_ADD: "before:git.add",
  AFTER_GIT_ADD: "after:git.add",
  BEFORE_GIT_COMMIT: "before:git.commit",
  AFTER_GIT_COMMIT: "after:git.commit",
  BEFORE_GIT_TAG: "before:git.tag",
  AFTER_GIT_TAG: "after:git.tag",
  BEFORE_GIT_PUSH: "before:git.push",
  AFTER_GIT_PUSH: "after:git.push",
  AFTER_RELEASE: "after:release",
} as const satisfies Record<string, HookEvent>;
