/*
  This workflow is reused several times across different repositories with a standard
  practice method to update a remote repository.

  This workflow creates an issue on the target repository with a specific title and label.
  Once that happens each repository has their own set of automations that consume
  this data and make whatever changes they need to on their end and eventually
  create a PR with all needed changes which can be reviewed and merged by humans.

  Arguments:
    * githubAuthToken: GitHub PAT token to access the repo.
    * version: The new Pulsar version. Such as `1.100.0` (Note the missing 'v' prefix)
    * repo: The GitHub repo.
    * label: The label added to the issue.
  Optional Arguments:
    * owner: The GitHub owner. Default `pulsar-edit`
    * body: The body of the new issue. Default: "Beep. Boop. Done by a bot."
*/

const wrapper = require("../wrapper/async.js");

wrapper({
  opts: [
    { name: "githubAuthToken", type: String },
    { name: "version", type: String },
    { name: "owner", type: String, defaultValue: "pulsar-edit" },
    { name: "repo", type: String },
    { name: "label", type: String },
    { name: "body", type: String, defaultValue: "Beep. Boop. Done by a bot." }
  ],
  startMsg: "Begin creating issue on target repo.",
  successMsg: "Successfully created issue on target repo.",
  failMsg: "Failed to create issue on target repo.",
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
