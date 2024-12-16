/*
  Downloads the Pulsar bins from various sources as soon as possible.

  Arguments:
    * saveLoc: The location to save all bins to
    * releasePrLink: The URL of the release PR
    * githubAuthToken: A GitHub Auth Token for repository access
    * tag: The tag string used on GitHub for this release
  Optional Arguments:
    * retryCount:
    * retryTimeMs:
    * githubOrg:
    * githubRepo:
    * githubActionName:
    * githubArtifactsToDownload:
    * cirrusRepoID:
*/

const wrapper = require("../wrapper/async.js");
const getGitHubBins = require("./getGitHubBins.js");
const getCirrusCiBins = require("./getCirrusCiBins.js");

const DEFAULTS = {
  // === Index defaults
  retryCount: 10, // The total number of times we will retry per service to download bins
  retryTimeMs: 900000, // The time in ms between each retry (15 minutes)
  // === GitHub Bins defaults
  githubOrg: "pulsar-edit", // Organization Name to search for bins within
  githubRepo: "pulsar", // Repository Name to search for bins within
  githubActionName: "Build Pulsar Binaries", // The workflow name who will have
  // the built binaries as artifacts in GitHub
  githubArtifactsToDownload: [
    "macos-13 Binaries",
    "ubuntu-latest Binaries",
    "windows-latest Binaries"
  ], // ^^ Names of the Artifacts we want to download from GitHub
  // === CirrusCI Bins defaults
  cirrusRepoID: "6483909499158528", // The repository ID on Cirrus. 'pulsar-edit/pulsar' by default
};

wrapper({
  opts: [
    { name: "saveLoc", type: String },
    { name: "releasePrLink", type: String },
    { name: "githubAuthToken", type: String },
    { name: "tag", type: String },
    { name: "retryCount", type: Number, defaultValue: DEFAULTS.retryCount },
    { name: "retryTimeMs", type: Number, defaultValue: DEFAULTS.retryTimeMs },
    { name: "githubOrg", type: String, defaultValue: DEFAULTS.githubOrg },
    { name: "githubRepo", type: String, defaultValue: DEFAULTS.githubRepo },
    { name: "githubActionName", type: String, defaultValue: DEFAULTS.githubActionName },
    { name: "githubArtifactsToDownload", type: String, multiple: true, defaultValue: DEFAULTS.githubArtifactsToDownload },
    { name: "cirrusRepoID", type: String, defaultValue: DEFAULTS.cirrusRepoID },
  ],
  startMsg: "Begin searching for bins...",
  successMsg: "Successfully saved all bins.",
  failMsg: "There was an error when attempting to download all available bins!",
  run: controller
});

async function controller(opts) {
  // This is in charge of orchestrating all aspects of this download process
  //  - Download bins from GitHub Actions
  //  - Download bins from CirrusCI
  // - Place all downloaded bins into the provided folder
  // - During all of this properly rechecking over and over as needed

  // Lets first attempt getting GitHub Bins

  await retryOnFailure(
    async () => {
      // This is the function that will be retried over and over
      // Providing a function here so we can pass our opts
      return await getGitHubBins(opts);
    },
    opts.retryCount,
    opts.retryTimeMs
  );

  // Then lets grab CirrusCI Bins
  await retryOnFailure(
    async () => {
      // This is the function to retry over and over
      // Providing a function here so we can pass our opts
      return await getCirrusCiBins(opts);
    },
    opts.retryCount,
    opts.retryTimeMs
  );

  // After these steps we should ideally have a directory (saveLoc) with the following data:
  /*
    - arm_linux
      * ARM.Linux.pulsar_1.122.0_arm64.deb
      * ARM.Linux.Pulsar-1.122.0-arm64.AppImage
      * ARM.Linux.pulsar-1.122.0-arm64.tag.gz
      * ARM.Linux.pulsar-1.122.0.aarch64.rpm
    - macos12
      * Pulsar-1.122.0-mac.zip
      * Pulsar-1.122.0-mac.zip.blockmap
      * Pulsar-1.122.0.dmg
      * Pulsar-1.122.0.dmg.blockmap
    - silicon_mac
      * Silicon.Mac.Pulsar-1.122.0-arm64.zip
      * Silicon.Mac.Pulsar-1.122.0-arm64-mac.zip.blockmap
      * Silicon.Mac.Pulsar-1.122.0-arm64.dmg
      * Silicon.Mac.Pulsar-1.122.0-arm64.dmg.blockmap
    - ubuntulatest
      * pulsar_1.122.0_amd64.deb
      * Pulsar-1.122.0.AppImage
      * pulsar-1.122.0.tar.gz
      * pulsar-1.122.0.x86_64.rpm
    - windowslatest
      * Windows.Pulsar-1.122.0-win.zip
      * Windows.Pulsar.Setup.1.122.0.exe
  */

}

async function retryOnFailure(retryFn, retryCount, retryTimeMs) {
  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const retry = async (fn, retries, delayMs) => {
    let attempt = 0;

    while(true) {
      try {
        console.log(`Attempting to trigger bin download. Attempt ${attempt + 1}/${retries}...`);
        return await fn();
      } catch(err) {
        console.log(`Attempt ${attempt + 1}/${retries} failed. Retrying in ${delayMs}...`);

        if (attempt++ < retries) {
          console.error(err);
          await delay(delayMs);
        } else {
          console.error("Unable to download bins!");
          console.error(err);
          process.exit(1);
        }
      }
    }
  };

  return await retry(retryFn, retryCount, retryTimeMs);
}
