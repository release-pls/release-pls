import { confirm } from "@inquirer/prompts";

import type { InternalReleaseContext } from "../options.ts";

export async function confirmChangelog(context: InternalReleaseContext) {
  // 再来一个询问,询问用户变更日志是否正常
  const normal = await confirm({
    message: "Changelog generated. Does it look good?",
    default: true,
  });
  if (normal === false) context.cancel();
}
