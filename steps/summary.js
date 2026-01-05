import prompts from "prompts";
import { CancelledError } from "../errors.js";
import { getChangeset } from "../utils/index.js";

export async function summary(config, ctx) {
  await getChangeset();

  const { ok } = await prompts({
    type: "confirm",
    name: "ok",
    message: "Push to remote?",
    initial: true,
  });

  if (!ok) {
    throw new CancelledError();
  }
}
