var Dice = require('./lib/Dice.js');
var TriggerHelper = require('./lib/TriggerHelper.js');
var AntiWeasel = require('./lib/AntiWeasel.js');
var help = require('./lib/Help.js');

help.setHelpCategory('dice', 'roll one or multiple dice', '/dice XdY rolls X dice with Y faces.')

var SimpleDiceRoller = function(robot) {
  var dice = new Dice();
  var trigger = new TriggerHelper('dice');
  var antiWeasel = new AntiWeasel();

  var checkParameters = function (nRolls, nFaces) {
    return (
      Number.isInteger(nRolls) &&
      Number.isInteger(nFaces) &&
      nRolls > 0 && nRolls <= 10 &&
      nFaces > 1 && nFaces < 10000
    );
  };

  robot.hear(trigger.getTrigger('', '(\\d+)[dD](\\d+)([\\+-]\\d+)?(\\s+.*)?'), function (msg) {
    var nRolls = parseInt(msg.match[1]);
    var nFaces = parseInt(msg.match[2]);
    var constant = msg.match[3] !== undefined ? parseInt(msg.match[3]) : 0;
    var comment = msg.match[4] !== undefined ? msg.match[4].trim() : '';
    if (!antiWeasel.check(comment)) {
      msg.reply('Don\'t be a weasel');

      return;
    }

    if (!checkParameters(nRolls, nFaces)) {
      msg.reply("Please do not throw 1-10 dice and 1-9999 faces per die.")

      return;
    }

    var rolls = dice.rollMultiple(nRolls, nFaces);
    var reply = comment ? comment + ': ' : '';
    var total = dice.sumRoll(rolls) + constant;

    msg.reply(reply + rolls.join(', ') + " - Total: " + total);
  });
};

module.exports = SimpleDiceRoller
