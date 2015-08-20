var Dice = require('./Dice.js')

var Gygax4d6 = function(robot) {
  var dice = new Dice();

  var roll4d6 = function() {
    var rolls = dice.rollMultiple(4, 6);
    
    var min = rolls.reduce(function (previous, current) {
      return (previous !== undefined) ? Math.min(previous, current) : current;
    });

    return (dice.sumRoll(rolls) - min);
  }

  var displayModifier = function(value) {
    var modifier = Math.floor((value - 10) / 2);

    return (modifier > 0) ? '+' + modifier : modifier;
  };

  robot.hear(/^\/gygax_4d6\s*$/, function (msg) {
    var rolls = [
      roll4d6(),
      roll4d6(),
      roll4d6(),
      roll4d6(),
      roll4d6(),
      roll4d6(),
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
}

module.exports = Gygax4d6;
