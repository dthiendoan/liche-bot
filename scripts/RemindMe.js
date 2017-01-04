var TriggerHelper = require('./lib/TriggerHelper.js');
var AntiWeasel = require('./lib/AntiWeasel.js');
var help = require('./lib/Help.js');

help.setHelpCategory('remind me', 'sets a reminder', '/remind me <something> in <time> will set a reminder. time will accept minutes, hours or days (e.g. 4 days)');

var RemindMe = function (robot) {
  var trigger = new TriggerHelper('remind me');
  var antiWeasel = new AntiWeasel();
  var timeoutMap;

  var decodeDuration = function(value, durationString) {
    var maxDuration = 432000000;
    var durationMultiplier;

    switch (durationString) {
      case 'minute':
      case 'minutes':
        durationMultiplier = 60000;
        break;
      case 'hour':
      case 'hours':
        durationMultiplier = 3600000;
        break;
      case 'day':
      case 'days':
        durationMultiplier = 86400000;
        break;
      default:
        throw "Cannot recognize the duration";
    }

    var resultDuration = value * durationMultiplier;
    if (resultDuration > maxDuration) {
      throw "Please enter a duration smaller than 5 days."
    }

    return resultDuration;
  }


  robot.hear(trigger.getTrigger('', '(.+?)\\s+in\\s+(\\d+)\\s*([a-zA-Z]+)'), function (msg) {
    try {
      var message = msg.match[1];
      var duration = decodeDuration(parseInt(msg.match[2]), msg.match[3]);    
    } catch (err) {
      msg.reply(err);
      return;
    }

    if (!antiWeasel.check(message)) {
      msg.reply('Don\'t be a weasel');
    } else {
      msg.reply('aye!');
      setTimeout(function() {msg.reply(message);}, duration);
    }
  });
};

module.exports = RemindMe;
