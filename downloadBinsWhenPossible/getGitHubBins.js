const octokit = require("octokit");
const { getPrNumber } = require("./shared.js");

const CONSTANTS = {
  ORG: "pulsar-edit", // Organization Name to search within
  REPO: "pulsar", // Repository Name to search within
  ACTION_NAME: "Build Pulsar Binaries" // The workflow name who will have the built binaries as artifacts
};

module.exports =
async function getGitHubBins(opts) {
  const prNumber = getPrNumber(opts.releasePrLink);

  const prDetails = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner: CONSTANTS.ORG,
    repo: CONSTANTS.REPO,
    pull_number: prNumber
  });

  const headSha = prDetails.data.head.sha; // Last commit on branch

  const workflows = await octokit.request("GET /repos/{owner}/{repo}/actions/runs{?head_sha}", {
    owner: CONSTANTS.ORG,
    repo: CONSTANTS.REPO,
    head_sha: headSha
  });

  let targetWorkflow = null;

  if (workflows.data.total_count === 1) {
    targetWorkflow = workflows.data.workflow_runs[0];
  } else {
    for (let i = 0; i < workflows.data.total_count; i++) {
      let workflow = workflows.data.workflow_runs[i];

      if (workflow.name === CONSTANTS.ACTION_NAME) {
        targetWorkflow = workflow;
      }
    }
  }

  if (targetWorkflow == null) {
    throw new Error("Unable to locate a valid workflow!");
  }

  // Now lets check if this workflow will have the binaries we want
  if (targetWorkflow.status !== "completed" || targetWorkflow.conclusion !== "success") {
    throw new Error("The only valid workflows have not completed or have failed!");
  }

  // Now knowing we have a successful, complete, and correct workflow.
  // Lets find our bins from it
  const artifacts = await octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts", {
    owner: CONSTANTS.ORG,
    repo: CONSTANTS.REPO,
    run_id: targetWorkflow.id
  });

  // TODO - finish this
}
