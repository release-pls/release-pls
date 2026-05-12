import { resolveConfig } from "./config/resolve.ts";
import type { InlineConfig, ResolvedConfig } from "./options.ts";
import { checkGitRepoStatus } from "./steps/checkGitRepoStatus.ts";
import { createContext, runTasks, steps } from "./steps/index.ts";
import { effect, gitReset } from "./utils/index.ts";
import { withTimer } from "./utils/timer.ts";

export async function release(inlineConfig: InlineConfig = {}) {
  // 处理参数
  const config: ResolvedConfig = await resolveConfig(inlineConfig);
  // 验证git仓库状态
  await checkGitRepoStatus(config);
  const context = await createContext(config);

  try {
    await withTimer(async () => {
      await runTasks(steps, config, context);
    });
  } catch (err) {
    await effect(config, `run git reset`, async () => {
      await gitReset(context); // 回滚
    });
    throw err;
  }
}
