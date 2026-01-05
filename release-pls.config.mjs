export default {
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next"],

  git: {
    requireBranch: false,
    commitMessage: "release: v${version}",
    tagName: "v${version}",
  },

  hooks: {
    // "before:init": ["npm run test"],
    // "before:selectVersion": ({ logger }) => {
    //   logger.info("Before selecting version");
    // },
    // "after:selectVersion": ({ version, logger }) => {
    //   logger.info(`after selecting version:${version}`);
    // },
    // "after:bump": [
    //   "npm run changelog",
    //   async () => {
    //     console.log("after:bump");
    //   },
    // ],
    // "after:release": "echo 已推送 v${version} ",
  },
};
