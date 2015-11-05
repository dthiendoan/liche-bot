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

    lastPerson = person;

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
    var result = pullTrigger(msg.message.user.name);
    if (result === true) {
      msg.emote(' - *BANG* YOU LOSE !');
    } else if (result === undefined) {
      msg.reply('are you suicidal ?');
    } else if (result === false) {
      msg.emote(' - *click*');
    }
  });
};

module.exports = Roulette;
