export default {
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next"],

  git: {
    requireBranch: false,
    commitMessage: "release: v${version}",
    tagName: "v${version}",
  },

  changelog: {
    disable: false,
    // args: "-vv --latest",
    args: "-o --tag ${version}",
    // args: ["-o", "--tag", "v${version}"],
    // template: [], // 也可以什么都不传递

    template: [
      "github",
      {
        // remote: {
        //   github: {
        //     owner: "ajiho",
        //     repo: "releaset-it-demo",
        //   },
        // },
        changelog: {
          header: "my-keepachangelogaaa",
        },
      },
    ],
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
