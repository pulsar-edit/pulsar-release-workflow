/*
  Downloads the Pulsar bins from various sources as soon as possible.

  Arguments:
    * saveLoc: The location to save all bins to
    * releasePrLink: The URL of the release PR
    * githubAuthToken: A GitHub Auth Token for repository access
*/

const wrapper = require("../wrapper/async.js");
const getGitHubBins = require("./getGitHubBins.js");

const CONSTANTS = {
  RETRY_COUNT: 10, // The total number of times we will retry per service to download bins
  RETRY_TIME_MS: 900000, // The time in ms between each retry (15 minutes)
};

wrapper({
  opts: [
    { name: "saveLoc", type: String },
    { name: "releasePrLink", type: String },
    { name: "githubAuthToken", type: String }
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
    CONSTANTS.RETRY_COUNT,
    CONSTANTS.RETRY_TIME_MS
  );

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
