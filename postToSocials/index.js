/*
  Handles all posts to our social channels.
  Handing off the appropriate data to the following:
    - reddit
    - lemmy
    - mastodon

  Arguments:
    *
*/

const wrapper = require("../wrapper/async.js");
const reddit = require("./reddit.js");

const DEFAULTS = {
  // === Reddit Defaults
  subreddit: "pulsar-edit",
};

wrapper({
  opts: [
    { name: "subreddit", type: String, defaultValue: DEFAULTS.subreddit }
  ],
  startMsg: "",
  successMsg: "",
  failMsg: "",
  run: runner
});

async function runner(opts) {
  await reddit(opts);
}
