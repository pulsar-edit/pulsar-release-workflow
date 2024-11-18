/*
  Grab bins from CirrusCI for the appropriate branch.

*/

const path = require("path");
const fs = require("fs");
const { performance } = require("node:perf_hooks");
const superagent = require("superagent");
const { makeDir, asyncWriteStreamProgress } = require("./shared.js");

const CONSTANTS = {
  CIRRUS_REPO_ID: "6483909499158528", // The repository ID on Cirrus. 'pulsar-edit/pulsar' by default
};

module.exports =
async function getCirrusCiBins(opts) {
  console.log("Beginning the download of CirrusCI Bins");

  // Now we can use the tag provided in opts to find the right builds

  const repositoryQuery = `
    query GetRepositoryBuildStatuses {
      repository(id: ${CONSTANTS.CIRRUS_REPO_ID}) {
        builds(last: 13, status: COMPLETED) {
          edges {
            node {
              id
              status
              tag
            }
          }
        }
      }
    }
  `;

  console.log(`Getting Build Statuses for the Repository '${CONSTANTS.CIRRUS_REPO_ID}'`);
  const repositoryGraph = await cirrusRequest(repositoryQuery);

  let buildID = undefined; // The CirrusCI Build ID we care about

  for (const edge of repositoryGraph.body.data.repository.builds.edges) {
    if (edge.node.status === "COMPLETED" && edge.node.tag === opts.tag) {
      buildID = edge.node.id;
      break;
    }
  }

  if (buildID === undefined) {
    throw new Error("Unable to locate a build for the provided tag that's complete!");
  }

  const buildQuery = `
    query GetTasksFromBuild {
      build(id: "${buildID}") {
        tasks {
          name
          id
          status
        }
      }
    }
  `;

  console.log(`Getting Tasks for the build '${buildID}'`);
  const buildGraph = await cirrusRequest(buildQuery);

  // Now we want to grab binaries from every successful task we've been given
  for (let i = 0; i < buildGraph.body.data.build.tasks.length; i++) {
    const task = buildGraph.body.data.build.tasks[i];

    if (task.status !== "COMPLETED") {
      // This task didn't complete, we will assume we have another task in the list
      // for the same task name that's completed successfully
      continue;
    }

    const taskQuery = `
      query GetTaskDetails {
        task(id: ${task.id}) {
          artifacts {
            files {
              path
              size
            }
          }
        }
      }
    `;

    console.log(`Getting Details for the task '${task.id}' ('${task.name}')`);
    const taskGraph = await cirrusRequest(taskQuery);

    // The response contains an array of different artifacts.
    // Only one contains the multiple files we want. The rest are files that do
    // not apply to this use case.
    // WARNING: Generally the first item of this array contains bin artifacts
    const binArtifacts = taskGraph.body.data.task.artifacts[0].files;

    // We now have an array of objects with a `path` key pointing to where our artifacts are
    // Lets iterate and download each one.
    for (const bin of binArtifacts) {
      console.log(`Downloading: '${artifactPathToFilename(bin.path)}'`);
      makeDir(`${opts.saveLoc}/${task.name}`);
      const startDownloadTime = performance.now();
      const stream = fs.createWriteStream(`${opts.saveLoc}/${task.name}/${artifactPathToFilename(bin.path)}`);
      const req = superagent.get(
        `https://api.cirrus-ci.com/v1/artifact/task/${task.id}/binary/${bin.path}`
      );
      req.pipe(stream);
      // Wait for the data download to be completed
      await asyncWriteStreamProgress(stream, bin.size, startDownloadTime);
      console.log(`Stream finished writing '${artifactPathToFilename(bin.path)}'`);
    }
  }

}

async function cirrusRequest(queryString) {
  const dataToSend = JSON.stringify({ query: queryString });

  return await superagent
    .post("https://api.cirrus-ci.com/graphql")
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Content-Length", dataToSend.length)
    .send(dataToSend);
}

function artifactPathToFilename(name) {
  // CirrusCI Artifact Paths look like:
  // `binaries/ARM.Linux.pulsar-1.122.0-arm64.tar.gz`
  // This converts them to just the end filename.
  return path.basename(name);
}
