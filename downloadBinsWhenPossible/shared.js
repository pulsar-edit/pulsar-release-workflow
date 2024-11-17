const fs = require("fs");
const { performance } = require("node:perf_hooks");

module.exports = {
  // Takes a GitHub link and returns the PR number for it.
  getPrNumber: (prLink) => {
    // https://github.com/owner/repo/pull/<pr-number>

    let parts = prLink.split("/");

    // The last string after `/` will be the PR number
    return parts[parts.length - 1];
  },
  // Takes a directory path string and creates it if it doesn't exist already.
  makeDir: (dirName) => {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
  },
  // Takes a write stream, and total size, to write a progress bar, updating every second.
  asyncWriteStreamProgress: async (stream, size, startTime = performance.now()) => {
    let completed = false;
    let lastBytes = 0;
    const totalBytes = size;
    const delay = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    stream.on("finish", () => {
      completed = true;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("Progress: 100%");
      console.log("\n");
      const completedTime = performance.now();
      console.log(`Download took: '${parseFloat((completedTime - startTime)*1000).toFixed(2)}s'`)
    });

    while(!completed) {
      lastBytes = stream.bytesWritten;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Progress: ${parseFloat((lastBytes/totalBytes)*100).toFixed(2)}%`);
      await delay(1000);
    }
  }
};
