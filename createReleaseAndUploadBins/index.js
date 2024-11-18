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
const publish = require("publish-release");
const wrapper = require("../wrapper");

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
  run: (opts) => {
    const binaryAssets = fs.readdirSync(opts.binLoc);

    console.log(`Publishing release for '${opts.version}' with the below assets:`);
    console.log(binaryAssets);

    publish({
      token: opts.githubAuthToken,
      owner: opts.owner,
      repo: opts.repo,
      name: opts.version,
      notes: opts.notes,
      tag: opts.version,
      draft: false,
      prerelease: false,
      editRelease: true,
      reuseRelease: true,
      skipIfPublished: false,
      assets: binaryAssets
    }, (err, release) => {
      if (err) {
        throw err;
      }

      if (typeof release?.html_url !== "string") {
        console.error("No 'html_url' found on release object!");
        throw new Error(release);
      } else {
        console.log(`Release published successfully: ${release.html_url}`);
      }

    });
  }
});
