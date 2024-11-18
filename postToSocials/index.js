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

wrapper({
  opts: [],
  startMsg: "",
  successMsg: "",
  failMsg: "",
  run: runner
});

async function runner(opts) {

}
