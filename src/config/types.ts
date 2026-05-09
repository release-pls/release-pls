import type * as v from "valibot";

import type { ReleaseContext } from "../options.ts";
import type { Enabled } from "../utils/type.ts";
import type {
  hookEvent,
  HookValueSchema,
  inlineConfigSchema,
} from "./configSchema.ts";

export interface InternalReleaseContext extends ReleaseContext {
  initialRef: string;
}

export type InlineConfig = v.InferInput<typeof inlineConfigSchema>;

export type ResolvedConfig = v.InferOutput<typeof inlineConfigSchema>;

export type ChangelogOptions = Enabled<ResolvedConfig["git"]["changelog"]>;

export type HookFn = (context: ReleaseContext) => void | Promise<void>;
export type HookEvent = v.InferInput<typeof hookEvent>;
export type HookEventValue = v.InferOutput<typeof HookValueSchema>;

export type Task = {
  run: (
    config: ResolvedConfig,
    ctx: InternalReleaseContext,
  ) => void | Promise<void>;
  effect?: string | ((ctx: InternalReleaseContext) => string) | false;
};
