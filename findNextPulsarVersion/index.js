/*
  Finds the next Pulsar version from Pulsar's `package.json` file.
  Takes the existing version, removes the `-dev` build identifier, then
  bumps it's minor version.
  Before returning that value to GitHub Actions.

  Arguments:
    * packageLocation: The location of the effected `package.json`
    * envVarOutput: What environment variable to store the resulting version in.
                    Stores in a format similar to `1.122.0`
  Optional Arguments:
    * bumpType: What kind of bump we are preforming. e.g. "minor"
*/

const fs = require("fs");
const semver = require("semver");
const core = require("@actions/core");
const wrapper = require("../wrapper");

wrapper({
  opts: [
    { name: "packageLocation", type: String },
    { name: "envVarOutput", type: String },
    { name: "bumpType", type: String, defaultValue: "minor" },
  ],
  startMsg: "Beginning the search for Pulsar's Next Version",
  successMsg: "Successfully found and returned Pulsar's next version",
  failMsg: "Failed to find and return Pulsar's next version",
  run: (opts) => {

    const packageJSON = JSON.parse(fs.readFileSync(opts.packageLocation, { encoding: "utf8" }));

    let version = packageJSON.version;
    console.debug(`package.json: ${version}`);

    version = version.replace("-dev", "");
    console.debug(`replace: ${version}`);

    version = semver.inc(version, opts.bumpType);
    console.debug(`semver.inc(): ${version}`);

    core.exportVariable(opts.envVarOutput, version);

    console.log(`Output version '${version}' to '${opts.envVarOutput}' environment variable.`);
    process.exit(1); // debug fail
  }
});
