/*
  An async wrapper utility to help keep each step's code concise.
*/

const commandLineArgs = require("command-line-args");

module.exports =
function wrapper(obj) {
  const opts = commandLineArgs(obj.opts);

  console.log(obj.startMsg);

  obj.run(opts).then((res, err) => {
    console.log(obj.successMsg);
    process.exit(0);
  }).catch((err) => {
    console.error(obj.failMsg);
    console.error(err);
    process.exit(1);
  });

}
