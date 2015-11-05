var Roulette = function (robot) {
  var shot;
  var lastPerson;

  var spinBarrel = function () {
    shot = Math.floor(Math.random() * 6);
  }

  var pullTrigger = function (person) {
    if (person == lastPerson) {

      return;
    }

    if (shot == 0) {
      spinBarrel();
      lastPerson = null;
      return true;
    } else {
      shot--;
      return false;
    }
  }

  spinBarrel();

  robot.hear(/^\/roulette\s*$/, function (msg) {
    if (pullTrigger()) {
      msg.reply('*BANG* YOU LOSE !');
    } else {
      msg.reply('*click*');
    }
  });
};

module.exports = Roulette;
