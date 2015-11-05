var Roulette = function (robot) {
  var shot;

  var spinBarrel = function () {
    shot = Math.floor(Math.random() * 6);
  }

  var pullTrigger = function () {
    if (shot == 0) {
      spinBarrel();
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
