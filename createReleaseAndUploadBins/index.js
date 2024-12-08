/*
  Creates a release, and uploads all downloaded bins to it.

  Arguments:
    * binLoc: The location of where the bins to upload to the release are.
    * version: The version of Pulsar we are releasing. Like "v1.122.0"
    * githubAuthToken: A GitHub user auth token.
  Optional Arguments:
    * owner:
    * repo:
    * notes:

  Based almost entirely off work here:
    https://github.com/pulsar-edit/pulsar/blob/master/script/rolling-release-scripts/rolling-release-binary-upload.js
*/

const fs = require("fs");
const path = require("path");
const wrapper = require("../wrapper/async.js");

wrapper({
  opts: [
    { name: "binLoc", type: String },
    { name: "version", type: String },
    { name: "githubAuthToken", type: String },
    { name: "owner", type: String, defaultValue: "pulsar-edit" },
    { name: "repo", type: String, defaultValue: "pulsar" },
    { name: "notes", type: String, defaultValue: "Beep. Boop. Done by a bot. Release notes coming soon..." },
  ],
  startMsg: "Starting the release creation and bin upload process...",
  successMsg: "Successfully created the release and added bins.",
  failMsg: "There was an error when creating the release!",
  run: async (opts) => {
    const mime = await import("mime").then(mime => mime.default); // ESM export only
    const Octokit = await import("octokit").then(octo => octo.Octokit); // ESM export only
    const octokit = new Octokit({
      auth: opts.githubAuthToken
    });

    const binaryAssets = fs.readdirSync(opts.binLoc);

    console.log(`Publishing release for '${opts.version}' with the below assets:`);
    console.log(binaryAssets);

    // Ensure that `publish-release` can find the assets we provide, by adding
    // the full path
    for (const idx in binaryAssets) {
      binaryAssets[idx] = path.resolve(path.join(opts.binLoc, binaryAssets[idx]));
    }

    // Create a release
    const releaseCreate = await octokit.request("POST /repos/{owner}/{repo}/releases", {
      owner: opts.owner,
      repo: opts.repo,
      tag_name: opts.version,
      name: opts.version,
      body: opts.notes,
      draft: true,
      prerelease: false,
      generate_release_notes: false
    });

    // Then upload assets
    for (const asset of binaryAssets) {
      const assetName = path.basename(asset);
      const assetStat = fs.statSync(asset);

      console.log(`Attempting to upload asset '${assetName}'`);

      const uploadAsset = await octokit.request({
        method: "POST",
        url: releaseCreate.data.upload_url,
        headers: {
          "Content-Type": mime.getType(assetName),
          "Content-Length": assetStat.size,
          "User-Agent": "pulsar-bot"
        },
        data: fs.createReadStream(asset),
        name: assetName,
      });

      console.log(`The asset '${assetName}' has been '${uploadAsset.data.state}'`);
    }
  }
});
