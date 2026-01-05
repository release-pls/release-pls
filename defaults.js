export default {
  increments: ["patch", "minor", "major"],
  tags: ["latest", "next"],

  changelog: {
    disable: false,
    args: ["-vv", "--latest"],
    template: [],
  },

  git: {
    requireBranch: false,
    commitMessage: "release: v${version}",
    tagName: "v${version}",
  },

  hooks: {},
};
