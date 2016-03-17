/**
 * starts process of initialising a repo
 */
"use strict";

var git = require("../../daemon/git");
var MainProcess = require("../MainProcess");
var path = require("path");
var log = require("../../common/log");

module.exports = exports = run;

// TODO if adding another similar command, refactor this and open to a common helper

function run(yargs) {

  var chosen = yargs.argv._[1];
  var inspect =  chosen ? path.resolve(process.cwd(), chosen) : process.cwd();

  git.findRootGitRepo(inspect)
  .then(function(repo) {
    return MainProcess.acquire({
      error: failure,
    })
    .call({
      timeout: 5000,
    }, "intent", {
      type: "addRepository",
      path: repo,
    });
  })
  .then(function() {
    process.exit(0);
  })
  .catch(git.NotAGitRepo, function(err) {
    console.error("sidekick works with git repositories - not in a git repo!");
    process.exit(1);
  })
  .catch(function(err) {
    if(err.code === "ENOENT") {
      console.error("no such file or directory: " + inspect);
      process.exit(1);
    } else {
      failure(err);
    }
  });

  function failure(err) {
    log.error("failed to open unexpectedly: " + err.stack);
    console.error(err.message + " trying to open GUI at " + inspect);
    process.exit(1);
  }
}
