var TriggerHelper = require('./lib/TriggerHelper.js');
var connectionHelper = require('./lib/ConnectionHelper.js');
var help = require('./lib/Help.js');
var messageHelper = require('./lib/MessageHelper.js');

help.setHelpCategory(
  'highnoon',
  'mcree\'s favorite time of the day',
  '/highnoon test - hello world message\n' +
  '/highnoon - use mcree\'s ultimate\n' +
  '/highnoon spin - spins the barrel\n' +
  '/highnoon stats - display the game scores'
);

var Highnoon = function (robot) {
  var trigger = new TriggerHelper('highnoon');
  var sessionStore = {};

  var Session = function (channelId, firstPlayer) {
    this.channelId = channelId;
    this.firstPlayer = firstPlayer;
    this.secondPlayer = undefined;
    this.countdownValue = Math.floor(Math.random() * 2500) + 2500; // Guarantees to never be zero
    this.timer = null;
    this.elapsed = 0;
    this.shotsFired = false;
    this.timeToDraw = false;
    this.printDots = function (msg) { msg.reply('...'); this.elapsed += 2500; };
    this.printDraw = function (msg) { msg.reply('DRAW!'); };
    this.startTimer = function (msg) { this.timer = setInterval(printDots(msg)); };
    this.clearTimer = function (msg) { clearInterval(this.timer); printDraw(msg); };
  };

  var createSession = function (channelId, person) {
    if (sessionStore[channelId]) {
      if (sessionStore[channelId].secondPlayer === undefined) {
        sessionStore[channelId].secondPlayer = person;
        return 2;  
      } else {
        return;
      }
    } else {
      sessionStore[channelId] = new Session(channelId, person);
      return 1;
    }
  };

  var removeSession = function (msg, channelId) {
    var existed = Boolean(sessionStore[channelId]); // check if it exists first prior to deletion
    delete sessionStore[channelId];
    if (!existed) {
      msg.reply('There was not a session made yet!  Please type &highnoon to start a session.');
    } else if (!sessionStore[channelId] && existed) {
      msg.reply('Session successfully removed from room ' + channelId);
    } else {
      msg.reply('Oops! There\'s something wrong with removing session in room ' + channelId + '.  Please chec    k your code.');
    }
  };

  var getTestMessage = function (person, msg) {
    var output = 'IT\'S HIIIIIIGH NOON' + person;
    var room = messageHelper.getChannelId(msg);
    msg.reply(output + '\n' + room);
  };

  robot.hear(trigger.getTrigger(), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = createSession(channelId, person);

    switch (result) {
      case 1:
        msg.reply('New session created in room ' + channelId + ', ' + person + ' designated as first player');
        break;
      case 2:
        msg.reply('Second player ' + person + ' added to session in room ' + channelId);
        break;
      default:
        msg.reply('Sorry, a session already exists in this channel, please try again in a little bit!');
    };
  });

  robot.hear(trigger.getTrigger('test'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    if (sessionStore[channelId]) {
      sessionStore[channelId].timeToDraw = true;
      msg.reply('Session ready state has been set to true.  Players may now proceed to shoot.');
    } else {
      msg.reply('Sorry! A session has not been made yet, please type in &highnoon to start a session.');
    }
  });

  robot.hear(/BANG!/i, function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    if (sessionStore[channelId]) {
      // if session already has two players
      if (sessionStore[channelId].firstPlayer && sessionStore[channelId].secondPlayer) {
        // if first player shot first, else if second player shot first
        if (sessionStore[channelId].firstPlayer === person && !sessionStore[channelId].shotsFired) {
          if (sessionStore[channelId].timeToDraw) {
            msg.reply(person + ' shot first! Player one wins!');
          } else {
            msg.reply(person + ' has misfired! Player two wins!');
          }
          sessionStore[channelId].shotsFired = true;
        } else if (sessionStore[channelId].secondPlayer === person && !sessionStore[channelId].shotsFired) {
          if (sessionStore[channelId].timeToDraw) {
            msg.reply(person + ' shot first! Player two wins!');
          } else {
            msg.reply(person + ' has misfired! Player one wins!');
          }
          sessionStore[channelId].shotsFired = true;
        }
        removeSession(msg, channelId);
      } else {
        msg.reply('Please wait for a second player to enter the game first before shooting!');
      }
    } else {
      msg.reply('Sorry! A session has not started yet.  Please type in &highnoon to start a session.');
    }
  });

  robot.hear(trigger.getTrigger('cancel'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    removeSession(msg, channelId);
  });

  robot.hear(trigger.getTrigger('time'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    if (sessionStore[channelId]) {
      msg.reply('Generated timer for session in room ' + channelId + ' was set to ' + sessionStore[channelId].countdownValue);
    } else {
      msg.reply('Sorry! A session has not been made yet.  Please type in &highnoon to start a session first.');
    }
  });

  robot.hear(trigger.getTrigger('stats'), function (msg) {
    getTestMessage(null, msg);
  });

};

module.exports = Highnoon;
