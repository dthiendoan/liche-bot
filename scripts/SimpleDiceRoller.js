var Dice = require('./Dice.js')

var SimpleDiceRoller = function(robot) {
  var dice = new Dice();

  var checkParameters = function (nRolls, nFaces) {
    return (
      Number.isInteger(nRolls) &&
      Number.isInteger(nFaces) &&
      nRolls > 0 && nRolls <= 10 &&
      nFaces > 1 && nFaces < 10000
    );
  };

  robot.hear(/^\/dice\s+(\d+)[dD](\d+)(\s+.*)?$/, function (msg) {
    var nRolls = parseInt(msg.match[1]);
    var nFaces = parseInt(msg.match[2]);
    if (!checkParameters(nRolls, nFaces)) {
      msg.reply("Please do not throw 1-10 dice and 1-9999 faces per die.")

      return;
    }

    var rolls = dice.rollMultiple(nRolls, nFaces);
    var reply = msg.match[3] ? msg.match[3].trim() + ': ' : '';

    msg.reply(reply + rolls.join(', ') + " - Total: " + dice.sumRoll(rolls));
  });
};

module.exports = SimpleDiceRoller
