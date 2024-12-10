/*
  WIP: TODO
  Their docs may leave a bit to be desired, requiring some testing to occur
*/

const superagent = require("superagent");
const packageJson = require("../package.json");

module.exports =
async function reddit(opts) {

  let redditBearerToken;

  const form = new FormData();
  form.append("kind", "link");
  form.append("sr", opts.subreddit);
  form.append("title", ""); // Title of Post
  form.append("url", opts.releaseURL);

  return await superagent
    .post("https://oauth.reddit.com/api/submit")
    // Reddits Rules state the exact format of our user-agent.
    .set("User-Agent", `nodejs:dev.pulsar-edit:v${packageJson.version} (by /u/confused_techie)`)
    .set("Authorization", `Bearer ${redditBearerToken}`)
    .send(form);
}
