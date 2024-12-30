/*
  Finds Pulsar's current version from Pulsar's `package.json` file.
  Takes the existing version, removes the `-dev` build identifier,
  then returns that value to GitHub Actions.

  Arguments:
    * packageLocation: The location of the effected `package.json`
    * envVarOutput: What environment variable to store the resulting version in.
                    Stores in a format similar to `1.122.0`
*/

const fs = require("fs");
const core = require("@actions/core");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String },
    { name: "envVarOutput", type: String }
  ],
  startMsg: "Beginning the search for Pulsar's current Version",
  successMsg: "Successfully found and returned Pulsar's current version",
  failMsg: "Failed to find and return Pulsar's current version",
  run: (opts) => {
    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));

    let version = packageJSON.version;

    version = version.replace("-dev", "");

    core.exportVariable(opts.envVarOutput, version);

    console.log(`Output version '${version}' to '${opts.envVarOutput}' environment variable.`);
  }
});
