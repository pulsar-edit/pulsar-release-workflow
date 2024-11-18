/*
  Grab bins from the appropriate PR/GitHub Actions.

  Steps:
    - Get Details of PR: Head SHA (Last commit on branch)
    - Get Details of Workflows for that SHA
    - Find a workflow with the following properties:
      * Status: Completed
      * Conclusion: Success
      * Name: Matches `opts.githubActionName`
    - Download ZIP bins from workflow
    - Extract those bins into the location provided.
*/

const fs = require("fs");
const { performance } = require("node:perf_hooks");
const superagent = require("superagent");
const zl = require("zip-lib");
const { getPrNumber, makeDir, asyncWriteStreamProgress } = require("./shared.js");

module.exports =
async function getGitHubBins(opts) {
  console.log("Beginning the download of GitHub Bins");

  const Octokit = await import("octokit").then(octo => octo.Octokit); // ESM export only

  const octokit = new Octokit({
    auth: opts.githubAuthToken
  });

  const prNumber = getPrNumber(opts.releasePrLink);

  console.log(`PR Number: '${prNumber}'`);

  const prDetails = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner: opts.githubOrg,
    repo: opts.githubRepo,
    pull_number: prNumber
  });

  const headSha = prDetails.data.head.sha; // Last commit on branch
  console.log(`Head SHA: '${headSha}'`);

  const workflows = await octokit.request("GET /repos/{owner}/{repo}/actions/runs{?head_sha}", {
    owner: opts.githubOrg,
    repo: opts.githubRepo,
    head_sha: headSha
  });

  let targetWorkflow = null;

  if (workflows.data.total_count === 1) {
    targetWorkflow = workflows.data.workflow_runs[0];
  } else {
    for (let i = 0; i < workflows.data.total_count; i++) {
      let workflow = workflows.data.workflow_runs[i];

      if (workflow.name === opts.githubActionName) {
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
    owner: opts.githubOrg,
    repo: opts.githubRepo,
    run_id: targetWorkflow.id
  });

  // Now with our list of artifacts, lets iterate them and see which ones we want to download
  for (let i = 0; i < artifacts.data.total_count; i++) {
    if (opts.githubArtifactsToDownload.includes(artifacts.data.artifacts[i].name)) {
      console.log(`Downloading: '${artifacts.data.artifacts[i].name}'`);

      // https://github.com/octokit/request.js/issues/240#issuecomment-825070563
      const artifactDownload = await octokit.request(
        "HEAD /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
        {
          owner: opts.githubOrg,
          repo: opts.githubRepo,
          artifact_id: artifacts.data.artifacts[i].id,
          archive_format: "zip",
          request: {
            redirect: "manual"
          }
        }
      );

      const artifactURL = artifactDownload.headers.location;

      // Now we need to save to the disk
      makeDir("./temp");
      const startDownloadTime = performance.now();
      const stream = fs.createWriteStream(`./temp/${artifactNameToFileName(artifacts.data.artifacts[i].name)}.zip`);
      const req = superagent.get(artifactURL);
      req.pipe(stream);
      // Wait for the data to be completed
      await asyncWriteStreamProgress(stream, artifacts.data.artifacts[i].size_in_bytes, startDownloadTime);
      console.log(`Stream finished writing '${artifactNameToFileName(artifacts.data.artifacts[i].name)}.zip'`);

      // With the response being piped to disk
      await zl.extract(
        `./temp/${artifactNameToFileName(artifacts.data.artifacts[i].name)}.zip`,
        `${opts.saveLoc}/${artifactNameToFileName(artifacts.data.artifacts[i].name)}`
      );
    }
  }
}

function artifactNameToFileName(name) {
  let newName = name.replace(/\W/g, "");
  newName = newName.replace("Binaries", "");

  // Should result in just platform/version name
  return newName;
}
