import prompts from "prompts";
import { CancelledError } from "../errors.js";
import { getChangeset } from "../utils/index.js";

export async function summary(config, ctx) {
  await getChangeset();

  const { ok } = await prompts(
    {
      type: "confirm",
      name: "ok",
      message: "Push to remote?",
      initial: true,
    },
    {
      // 当用户按 Ctrl+C 或 ESC 时触发
      onCancel() {
        throw new CancelledError();
      },
    }
  );

  if (ok === false) {
    // 用户选择 No
    console.log("You chose NO. Executing no-logic...");
    // 在这里执行你的 no 逻辑
    throw new CancelledError();
  }
}
