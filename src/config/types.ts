import type { MergeDeep, OverrideProperties, RequiredDeep } from "type-fest";

import type {
  ChangelogOptions,
  Hook,
  HookEvent,
  ReleaseContext,
  UserConfig,
} from "../options.ts";

export interface InternalReleaseContext extends ReleaseContext {
  initialRef: string;
}

export interface InlineConfig extends UserConfig {
  config?: string;
  dryRun?: boolean;
  cwd?: string;
}

export type HookItems = Extract<Hook, unknown[]>;
export type NormalizedHooks = Partial<Record<HookEvent, HookItems>>;

export type NormalizedChangelogOptions = Required<
  OverrideProperties<
    ChangelogOptions,
    {
      args: string[];
    }
  >
>;

export type ResolvedConfig = MergeDeep<
  RequiredDeep<InlineConfig>,
  {
    git: {
      changelog: false | NormalizedChangelogOptions;
    };
    hooks: NormalizedHooks;
    config?: string;
  }
>;

export type Task = {
  run: (config: ResolvedConfig, ctx: InternalReleaseContext) => Promise<void>;
  effect?: string | ((ctx: InternalReleaseContext) => string) | false;
};
