var Dice = require('./lib/Dice.js');
var help = require('./lib/Help.js');

help.setHelpCategory('gygax', 'rolls a D&D character attributes', '/gygax rolls a D&D character with 3d6 score attributes');

var Gygax = function(robot) {
  var dice = new Dice();
  
  var displayModifier = function(value) {
    var modifier = Math.floor((value - 10) / 2);

    return (modifier > 0) ? '+' + modifier : modifier;
  };

  robot.hear(/^\/gygax\s*$/, function (msg) {
    var rolls = [
      dice.sumRoll(dice.rollMultiple(3, 6)),
      dice.sumRoll(dice.rollMultiple(3, 6)),
      dice.sumRoll(dice.rollMultiple(3, 6)),
      dice.sumRoll(dice.rollMultiple(3, 6)),
      dice.sumRoll(dice.rollMultiple(3, 6)),
      dice.sumRoll(dice.rollMultiple(3, 6)),
    ];

    var modifiers = [
      displayModifier(rolls[0]),
      displayModifier(rolls[1]),
      displayModifier(rolls[2]),
      displayModifier(rolls[3]),
      displayModifier(rolls[4]),
      displayModifier(rolls[5]),
    ];

    var result = 
      'Str: ' + rolls[0] + ' (' + modifiers[0] + ') - ' +
      'Dex: ' + rolls[1] + ' (' + modifiers[1] + ') - ' +
      'Con: ' + rolls[2] + ' (' + modifiers[2] + ') - ' +
      'Int: ' + rolls[3] + ' (' + modifiers[3] + ') - ' +
      'Wis: ' + rolls[4] + ' (' + modifiers[4] + ') - ' +
      'Cha: ' + rolls[5] + ' (' + modifiers[5] + ')';

    msg.reply(result);
  });
};

module.exports = Gygax;
