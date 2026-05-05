import { defineConfig } from "./src/options";

export default defineConfig({
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next"],
  git: {
    requireBranch: "main",
    commitMessage: "release: v${version}",
    tagName: "v${version}",
    changelog: {
      args: "-o --tag ${version}",
      template: "github",
      config: {
        git: {
          // 跳过提交信息为release开头的
          commit_parsers: [{ message: "^release", skip: true }],
        },
      },
    },
  },
  hooks: {
    "after:changelog": "pnpm prettier --write CHANGELOG.md",
    "after:release": "echo 已推送 v${version} ",
  },
});
