/*
  Updates the referenced `pulsar-edit/pulsar-edit.github.io/docs/download.md` page.
  Takes the provided new version and replaces all instances of the version in a
  download link with the new one.

  Arguments:
    * fileLoc: The `download.md` file location.
    * version: The new version to replace with.

  Notes:
    The REGEX used to find the right file version is specific to each version.
    The important part is to ensure there is a capturing group of every peice of
    text that is needed for the link, as well as each time a version is specified.

    The regex is used along with the pattern to reuse much of the matched text
    while replacing it with a temporary `newVer` string.

    Once all temporary replacements have been done we then replace the `newVer`
    string with the actual newest version.
*/

const fs = require("fs");
const wrapper = require("../wrapper");

const newVer = "<%NEWEST_VERSION%>";

const REPLACEMENTS = [
  {
    // Linux: x86_64: deb
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Linux\.pulsar_)(\d+\.\d+\.\d+)(_amd64\.deb)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: x86_64: rpm
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Linux\.pulsar-)(\d+\.\d+\.\d+)(\.x86_64\.rpm)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: x86_64: AppImage
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Linux\.Pulsar-)(\d+\.\d+\.\d+)(\.AppImage)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: x86_64: tar.gz
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Linux\.pulsar-)(\d+\.\d+\.\d+)(\.tar\.gz)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: ARM_64: deb
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/ARM\.Linux\.pulsar_)(\d+\.\d+\.\d+)(_arm64\.deb)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: ARM_64: rpm
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/ARM\.Linux\.pulsar-)(\d+\.\d+\.\d+)(.\aarch64\.rpm)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: ARM_64: AppImage
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/ARM\.Linux\.Pulsar-)(\d+\.\d+\.\d+)(-arm64\.AppImage)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Linux: ARM_64: tar.gz
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/ARM\.Linux\.pulsar-)(\d+\.\d+\.\d+)(-arm64\.tar\.gz)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Silicon Mac: DMG
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Silicon\.Mac\.Pulsar-)(\d+\.\d+\.\d+)(-arm64\.dmg)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Silicon Mac: Zip
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Silicon\.Mac\.Pulsar-)(\d+\.\d+\.\d+)(-arm64-mac\.zip)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Intel Mac: DMG
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Intel\.Mac\.Pulsar-)(\d+\.\d+\.\d+)(\.dmg)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Intel Mac: Zip
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Intel\.Mac\.Pulsar-)(\d+\.\d+\.\d+)(-mac\.zip)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Windows: Installer
    regex: /(https\:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Windows\.Pulsar\.Setup\.)(\d+\.\d+\.\d+)(\.exe)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  },
  {
    // Windows: Portable
    regex: /(https:\/\/github\.com\/pulsar-edit\/pulsar\/releases\/download\/v)(\d+\.\d+\.\d+)(\/Windows\.Pulsar-)(\d+\.\d+\.\d+)(-win\.zip)/g,
    pattern: `$1${newVer}$3${newVer}$5`
  }
];

wrapper({
  opts: [
    { name: "fileLoc", type: String },
    { name: "version", type: String }
  ],
  startMsg: "Begin checking the download document.",
  successMsg: "Successfully updated the download document.",
  failMsg: "Failed to replace the version within the download document.",
  run: (opts) => {

    const newVerRegex = new RegExp(newVer, "g");
    let file = fs.readFileSync(opts.fileLoc, { encoding: "utf8" });

    for (const repl of REPLACEMENTS) {
      // Add new version string into every needed instance of the version
      file = file.replace(repl.regex, repl.pattern);
    }

    // Replace all versions at the same time
    file = file.replace(newVerRegex, opts.version);

    // Write out file
    fs.writeFileSync(opts.fileLoc, file, { encoding: "utf8" });

  }
});
