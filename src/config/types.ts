import type { ReleaseContext, ResolvedConfig } from "../options.ts";
import type { Enabled } from "../utils/type.ts";

export type * from "../options.ts";

export interface InternalReleaseContext extends ReleaseContext {
  initialRef: string;
}

export type ChangelogOptions = Enabled<ResolvedConfig["git"]["changelog"]>;

export type Task = {
  run: (
    config: ResolvedConfig,
    ctx: InternalReleaseContext,
  ) => void | Promise<void>;
  effect?: string | ((ctx: InternalReleaseContext) => string) | false;
};
