/*
  Adds the `-dev` build identifier to the version field in a `package.json`.

  Arguments:
    * packageLocation: The location of the affected `package.json`
*/

const fs = require("fs");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String }
  ],
  startMsg: "Starting the re-version process...",
  successMsg: "Changed Version and Saved File.",
  failMsg: "There was an error when attempting to change the version!",
  run: (opts) => {

    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));

    const originalVersion = packageJSON.version;

    packageJSON.version = originalVersion + "-dev",

    fs.writeFileSync(opts.packageLocation, JSON.stringify(packageJSON, null, 2), { encoding: "utf8" });

    console.log(`Changed Version from '${originalVersion}' to '${packageJSON.version}'`);
  }
});
