/*
  Post socials updates to Lemmy.
  Requires the following OPTS:
    * lemmyUser: The user account we intend to post as.
    * lemmyToken: A password to access that user's account.
*/

const { LemmyHttp, Login } = require("lemmy-js-client");

const CONSTANTS = {
  INSTANCE: "", // Lemmy Instance
};

module.exports =
async function lemmy(opts) {
  // https://join-lemmy.org/api/interfaces/CreatePost.html
  const client = new LemmyHttp(CONSTANTS.INSTANCE);

  const loginForm = {
    username_or_email: opts.lemmyUser,
    password: opts.lemmyToken
  };

  // Login and set the client headers with our jwt
  const { jwt } = await client.login(loginForm);
  client.setHeaders({ Authorization: `Bearer ${jwt}` });

  // Post our update
  await client.CreatePost({
    name: "", // Seemingly title of our post
    body: "", // Seemingly the body of our post
    url: "", // maybe a url for our post?
  });
}
