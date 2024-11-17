/*
  Grab bins from the appropriate PR/GitHub Actions.

  Steps:
    - Get Details of PR: Head SHA (Last commit on branch)
    - Get Details of Workflows for that SHA
    - Find a workflow with the following properties:
      * Status: Completed
      * Conclusion: Success
      * Name: Matches `CONSTANTS.ACTION_NAME`
    - Download ZIP bins from workflow
    - Extract those bins into the proper location
*/

const Octokit = require("octokit");
const { getPrNumber } = require("./shared.js");

const CONSTANTS = {
  ORG: "pulsar-edit", // Organization Name to search within
  REPO: "pulsar", // Repository Name to search within
  ACTION_NAME: "Build Pulsar Binaries" // The workflow name who will have the built binaries as artifacts
  ARTIFACTS_TO_DOWNLOAD: [ "macos-12 Binaries", "ubuntu-latest Binaries", "windows-latest Binaries" ],
  // ^^ Names of the Artifacts we want to download
};

module.exports =
async function getGitHubBins(opts) {
  const octokit = new Octokit({
    // TODO authentication
  });

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

  // Now with our list of artifacts, lets iterate them and see which ones we want to download
  for (let i = 0; i < artifacts.data.total_count; i++) {
    if (CONSTANTS.ARTIFACTS_TO_DOWNLOAD.contains(artifacts.data.artifacts[i].name)) {

      // https://github.com/octokit/request.js/issues/240#issuecomment-825070563
      const artifactDownload = await octokit.request(
        "HEAD /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
        {
          owner: CONSTANTS.ORG,
          repo: CONSTANTS.REPO,
          artifact_id: artifacts.data.artifacts[i].id,
          archive_format: "zip",
          request: {
            redirect: "manual"
          }
        }
      );

      const artifactURL = artifactDownload.headers.location;

      // TODO save file to disk
      // TODO extract
    }
  }
}
