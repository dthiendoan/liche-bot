var help = require("./lib/Help.js")

var Info = function(robot) {
  robot.respond(/help\s*$/, function (msg) {
    msg.reply(help.getGlobalHelp());
  });

  robot.respond(/help\s+(\S+)\s*$/, function (msg) {
    msg.reply(help.getDetailedHelp(msg.match[1]));
  });
};

module.exports = Info;
