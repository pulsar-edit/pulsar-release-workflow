/*
  Create a Pulsar Chocolatey release.
  Via the pre-existing automation over on `pulsar-edit/pulsar-chocolatey`.
  The automation there requires an issue to be created with the new version as it's title.
  Once the issue is created then the `release` label must be added which triggers
  the build. That repo will then take care of all steps needed to create the newest
  release and post it to Chocolatey.

  Arguments:
    * githubAuthToken: GitHub PAT token to access the repo.
    * version: The new Pulsar version. Such as `1.100.0`
  Optional Arguments:
    * owner: The GitHub owner. Default `pulsar-edit`
    * repo: The GitHub repo. Default `pulsar-chocolatey`
    * label: The label added to the issue. Default `release`
    * body: The body of the new issue.
*/

const wrapper = require("../wrapper/async.js");

wrapper({
  opts: [
    { name: "githubAuthToken", type: String },
    { name: "version", type: String },
    { name: "owner", type: String, defaultValue: "pulsar-edit" },
    { name: "repo", type: String, defaultValue: "pulsar-chocolatey" },
    { name: "body", type: String, defaultValue: "Beep. Boop. Done by a bot. Post newest Pulsar release to Chocolatey." },
    { name: "label", type: String, defaultValue: "release" }
  ],
  startMsg: "Begin creating issue on Chocolatey repo.",
  successMsg: "Successfully created issue on Chocolatey repo.",
  failMsg: "Failed to create issue on Chocolatey repo.",
  run: async (opts) => {
    const Octokit = await import("octokit").then(octo => octo.Octokit); // ESM export only
    const octokit = new Octokit({
      auth: opts.githubAuthToken
    });

    const issueCreate = await octokit.request("POST /repos/{owner}/{repo}/issues", {
      owner: opts.owner,
      repo: opts.repo,
      title: opts.version,
      body: opts.body
    });

    const issueUpdate = await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}", {
      owner: opts.owner,
      repo: opts.repo,
      issue_number: issueCreate.data.number,
      labels: [
        opts.label
      ]
    });

  }
});
