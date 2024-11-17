/*
  Finds the next Pulsar version from Pulsar's `package.json` file.
  Takes the existing version, removes the `-dev` build identifier, then
  bumps it's minor version.
  Before returning that value to GitHub Actions.

  Arguments:
    * packageLocation: The location of the effected `package.json`
*/

const fs = require("fs");
const semver = require("semver");
const core = require("@actions/core");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String },
    { name: "envVarOutput", type: String }
  ],
  startMsg: "Beginning the search for Pulsar's Next Version",
  successMsg: "Successfully found and returned Pulsar's next version",
  failMsg: "Failed to find and return Pulsar's next version",
  run: (opts) => {

    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));

    let version = packageJSON.version;

    version = version.replace("-dev", "");

    version = semver.inc(version, "minor");

    core.exportVariable(opts.envVarOutput, version);

    console.log(`Output version '${version}' to '${opts.envVarOutput}' environment variable.`);
  }
});
