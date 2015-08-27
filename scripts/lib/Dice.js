var Dice = function () {
  this.rollMultiple = function (nRolls, nFaces) {
    var rolls = [];
    for (var i = 0; i < nRolls; i++) {
      rolls.push(this.rollSingle(nFaces));
    }

    return rolls;
  };
    
  this.rollSingle = function (faces) {
    return Math.floor(Math.random() * faces) + 1;
  };

  this.sumRoll = function (rolls) {
    return rolls.reduce(function (previous, current) {
      return previous + current
    }, 0);
  };
};

module.exports = Dice;
