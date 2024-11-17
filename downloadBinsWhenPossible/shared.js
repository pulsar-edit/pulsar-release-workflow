
module.exports = {
  getPrNumber: (prLink) => {
    // https://github.com/owner/repo/pull/<pr-number>

    let parts = prLink.split("/");

    // The last string after `/` will be the PR number
    return parts[parts.length - 1];
  }
};
