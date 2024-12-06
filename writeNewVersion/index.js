/*
  Writes the provided version to the provided `package.json` file within the
  `version` key.

  Arguments:
    * packageLocation: The location of the affected `package.json`
    * version: The new version to write.
*/

const fs = require("fs");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String },
    { name: "version", type: String }
  ],
  startMsg: "Beginning the writing of a new version",
  successMsg: "Successfully wrote a new version",
  failMsg: "Failed to write a new version",
  run: (opts) => {
    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));
    packageJSON.version = opts.version;
    fs.writeFileSync(opts.packageLocation, JSON.stringify(packageJSON, null, 2), { encoding: "utf8" });
  }
});
