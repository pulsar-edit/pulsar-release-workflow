/*
  Post socials updates to Mastodon.
  Requires the following OPTS:
    * mastodonToken: A bearer token to access the correct mastodon account.
    * version: The version of Pulsar we are talking about.
*/

const superagent = require("superagent");

const CONSTANTS = {
  INSTANCE: "", // Mastodon Instance
};

module.exports =
async function mastodon(opts) {

  // https://docs.joinmastodon.org/methods/statuses/#form-data-parameters
  const form = new FormData();
  form.append("status", ""); // Text Content of the post
  form.append("visibility", "public");
  form.append("language", "en");

  return await superagent
    .post(`${INSTANCE}/api/v1/status`)
    .set("Authorization", `Bearer ${opts.mastodonToken}`)
    .set("Idempotency-Key", `pulsarStatusUpdate${opts.version}`)
    .send(form);
}
