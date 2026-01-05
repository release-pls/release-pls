import prompts from "prompts";
import semver from "semver";
import { CancelledError } from "../errors.js";

export async function selectTag(config, ctx) {
  const isPrerelease = !!semver.prerelease(ctx.version);

  const choices = config.tags
    .map((tag) => {
      const disabled = isPrerelease && tag === "latest";

      return {
        tag,
        disabled,
        title: tag,
      };
    })
    // 可用的在前，禁用的在后
    .sort((a, b) => Number(a.disabled) - Number(b.disabled))
    .map(({ tag, disabled, title }) => ({
      title,
      value: tag,
      disabled,
    }));

  const { tag } = await prompts({
    type: "select",
    name: "tag",
    message: "What do you want to tag",
    choices,
  });

  if (!tag) {
    throw new CancelledError();
  }

  ctx.tag = tag;
}
