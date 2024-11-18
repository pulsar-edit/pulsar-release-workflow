/*
  Adds the provided (default "-dev") build identifier to the version field in a `package.json`.

  Arguments:
    * packageLocation: The location of the affected `package.json`
  Optional Arguments:
    * buildID: ("-dev") The build identifier to add.
*/

const fs = require("fs");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String },
    { name: "buildID", type: String, defaultValue: "-dev" },
  ],
  startMsg: "Starting the re-version process...",
  successMsg: "Changed Version and Saved File.",
  failMsg: "There was an error when attempting to change the version!",
  run: (opts) => {

    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));

    const originalVersion = packageJSON.version;

    packageJSON.version = originalVersion + opts.buildID,

    fs.writeFileSync(opts.packageLocation, JSON.stringify(packageJSON, null, 2), { encoding: "utf8" });

    console.log(`Changed Version from '${originalVersion}' to '${packageJSON.version}'`);
  }
});
