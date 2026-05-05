import { resolveConfig } from "./config/resolve.ts";
import type { InlineConfig, ResolvedConfig } from "./config/types.ts";
import { runGitCliff } from "./git-cliff.ts";
import { logger } from "./utils/index.ts";

export async function changelog(
  inlineConfig: InlineConfig = {},
  args: string[],
) {
  // 处理参数
  const config: ResolvedConfig = await resolveConfig(inlineConfig);

  if (config.git.changelog === false) {
    logger.warn("Changelog generation is disabled.");
    return;
  }

  config.git.changelog.args = args;

  // 开始调用git-cliff,并直接把git-cliff的信息打印在终端上
  await runGitCliff(config.git.changelog, {
    stdio: "inherit",
  });
}
