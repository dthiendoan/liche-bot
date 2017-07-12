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

  ////////////// STATES //////////////

  const PLAYER_ADDED = 'PLAYER_ADDED';
  const PLAYER_REMOVED = 'PLAYER_REMOVED';
  const PLAYER_ALREADY_IN_SESSION = 'PLAYER_ALREADY_IN_SESSION';
  const PLAYER_DOES_NOT_EXIST = 'PLAYER_DOES_NOT_EXIST';
  const SESSION_CREATED = 'SESSION_CREATED';
  const SESSION_FULL = 'SESSION_FULL';


  ////////////// CLASSES //////////////

  class PlayerState {
    constructor(name) {
      this.name = name;
      this.alive = true;
    }

    getName() {
      return this.name;
    }

    isAlive() {
      return this.alive;
    }

    gotShot() {
      this.alive = false;
    }
  };

  class GameState {
    constructor(maxPlayers) {
      this.players = {};
      this.maxPlayers = maxPlayers;
      this.shotsFired = false;
      this.countdownValue = Math.floor(Math.random() * 2500) + 2500; // Guarantees to never be zero
      this.timer = null;
      this.elapsed = 0;
    }

    playersNeeded() {
      return this.maxPlayers - this.players.length;
    }

    getCurrentPlayers() {
      return this.players;
    }

    getMaxPlayers() {
      return this.maxPlayers;
    }

    getCountDownValue() {
      return this.countdownValue;
    }

    sessionIsFull() {
      return this.players.length === this.maxPlayers;
    }

    incrementTimer() {
      this.elapsed += 2500;
    }

    timeToDraw() {
      return this.elapsed >= this.countDownValue;
    }

    duelIsDone() {
      this.allShotsFired = true;
    }

  };

  class Session {
    constructor(channelId, maxPlayers) {
      this.channelId = channelId;
      this.gameState = new GameState(maxPlayers);
    }

    printDots(msg) {
      msg.reply('...');
      this.gameState.incrementTimer();
    }

    startTimer(msg) {
      this.gameState.timer = setInterval(function() { printDots(msg); }, this.gameState.countdownValue);
    }

    clearTimer() {
      clearInterval(this.gameState.timer);
    }

    printDraw(msg, timer) {
      msg.reply('DRAW!');
      clearTimer();
    }

    addPlayer(person) {
      if (!this.gameState.sessionIsFull()) {
        if (this.gameState.players[person] === undefined) {
          this.gameState.players[person] = new PlayerState(person);
          return PLAYER_ADDED;
        } else {
          return PLAYER_ALREADY_IN_SESSION;
        }
      } else {
        return SESSION_FULL;
      }
    }

    removePlayer(person) {
      if (this.gameState.players[person] !== undefined) {
        delete this.gameState.players[person];
        return PLAYED_REMOVED;
      } else {
        return PLAYER_DOES_NOT_EXIST;
      }
    }

  };

  ////////////// SESSION METHODS //////////////

  var createSession = function (channelId, person, maxPlayers = 2) {
    if (sessionStore[channelId]) {
      return sessionStore[channelId].addPlayer(person);
    } else {
      sessionStore[channelId] = new Session(channelId, maxPlayers);
      sessionStore[channelId].addPlayer(person);
      return SESSION_CREATED;
    }
  };

  var removeSession = function (msg, channelId) {
    var existed = Boolean(sessionStore[channelId]); // check if it exists first prior to deletion
    if (!existed) {
      msg.reply('There was not a session made yet!  Please type &highnoon to start a session.');
    } else {
      delete sessionStore[channelId];
      msg.reply('Session successfully removed from room ' + channelId);
    }
  };

  ////////////// LISTENERS //////////////

  robot.hear(trigger.getTrigger(), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = createSession(channelId, person);

    switch (result) {
      case SESSION_CREATED:
        msg.reply('New session created in room ' + channelId + ', ' + person + ' designated as first player');
        break;
      case PLAYER_ADDED:
        msg.reply('Another player ' + person + ' added to session in room ' + channelId);
        break;
      case PLAYER_ALREADY_IN_SESSION:
        msg.reply('You are already in this session ' + person + '!');
        break;
      case SESSION_FULL:
        msg.reply('Session is already full! Please wait until the current session is finished ' + person + '.');
        break;
      default:
        msg.reply('Sorry, the session is already full. Please try again in a little bit!');
    };
  });

  robot.hear(trigger.getTrigger('removePlayer', '([\\s\\S]+?)'), function (msg) {
    var playerName = msg.match[1];
    var channelId = messageHelper.getChannelId(msg);
    var existed = Boolean(sessionStore[channelId]);
    if (existed) {
      var result = sessionStore[channelId].removePlayer(playerName);
      switch(result) {
        case PLAYER_REMOVED:
          msg.reply('Player ' + playerName + ' has been removed from session ' + channelId);
          break;
        case PLAYER_DOES_NOT_EXIST:
          msg.reply('Player ' + playerName + ' does not exist in the current session! Are you sure you got the right person?');
        default:
          msg.reply('Uh oh! There is something wrong with the code for removePlayer. Please check the code.');
      }
    } else {
      msg.reply('Sorry! A session has not been made yet, please type in &highnoon to start a session.')
    }
  });

  robot.hear(trigger.getTrigger('test'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    if (sessionStore[channelId]) {
      sessionStore[channelId].gameState.elapsed = sessionStore[channelId].gameState.countdownValue;
      if (sessionStore[channelId].gameState.timeToDraw()) {
        msg.reply('Session ready state has been set to true. Players may now proceed to shoot.');
      } else {
        msg.reply('Uh oh! Session\'s ready state cannot be set to true. Please check the code.');
      }
    } else {
      msg.reply('Sorry! A session has not been made yet, please type in &highnoon to start a session.');
    }
  });

  robot.hear(/BANG!/i, function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    // check if a session exists
    if (sessionStore[channelId]) {
      // check if the session already has all the players
      if (sessionStore[channelId].gameState.sessionIsFull()) {
        // check if the person is one of the players and if the duel is ongoing
        if (sessionStore[channelId].gameState.players[person].getName() === person && !sessionStore[channelId].allShotsFired) {
          // check if it is time to draw
          if (sessionStore[channelId].gameState.timeToDraw()) {
            msg.reply(person + ' shot first! Everyone else falls dead. ' + person + ' wins!');
            for (var player in sessionStore[channelId].gameState.players) {
              if (sessionStore[channelId].gameState.players[player].getName() !== person) {
                sessionStore[channelId].gameState.players[player].gotShot();
              }
            }
            sessionStore[channelId].gameState.duelIsDone();
            removeSession(msg, channelId);
          } else {
            msg.reply(person + ' misfired! ' + person + ' is DEAD and out of the duel!');
            sessionStore[channelId].gameState.players[person].gotShot();
          } 
        } else {
          msg.reply('HEY! You\'re not part of this duel! Take a seat son and wait for your turn!');
        }
      } else {
        msg.reply('Please wait for all players to enter the game first before shooting! (Players needed: ' + sessionStore[channelId].gameState.playersNeeded() + ')');
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
      msg.reply('Generated timer for session in room ' + channelId + ' was set to ' + sessionStore[channelId].gameState.getCountdownValue());
    } else {
      msg.reply('Sorry! A session has not been made yet.  Please type in &highnoon to start a session first.');
    }
  });

  ////////////// BELOW IS OLDER IMPLEMENTATION FOR REFERENCE //////////////

  // var Session = function (channelId, firstPlayer) {
  //   this.channelId = channelId;
  //   this.firstPlayer = firstPlayer;
  //   this.secondPlayer = undefined;
  //   this.countdownValue = Math.floor(Math.random() * 2500) + 2500; // Guarantees to never be zero
  //   this.timer = null;
  //   this.elapsed = 0;
  //   this.shotsFired = false;
  //   this.timeToDraw = false;
  //   this.printDots = function (msg) { msg.reply('...'); this.elapsed += 2500; };
  //   this.printDraw = function (msg) { msg.reply('DRAW!'); };
  //   this.startTimer = function (msg) { this.timer = setInterval(printDots(msg)); };
  //   this.clearTimer = function (msg) { clearInterval(this.timer); printDraw(msg); };
  // };

  // var createSession = function (channelId, person, count = 2) {
  //   if (sessionStore[channelId]) {
  //     if (sessionStore[channelId].secondPlayer === undefined) {
  //       sessionStore[channelId].secondPlayer = person;
  //       return 2;  
  //     } else {
  //       return;
  //     }
  //   } else {
  //     sessionStore[channelId] = new Session(channelId, person);
  //     return 1;
  //   }
  // };

  // var removeSession = function (msg, channelId) {
  //   var existed = Boolean(sessionStore[channelId]); // check if it exists first prior to deletion
  //   delete sessionStore[channelId];
  //   if (!existed) {
  //     msg.reply('There was not a session made yet!  Please type &highnoon to start a session.');
  //   } else if (!sessionStore[channelId] && existed) {
  //     msg.reply('Session successfully removed from room ' + channelId);
  //   } else {
  //     msg.reply('Oops! There\'s something wrong with removing session in room ' + channelId + '.  Please chec    k your code.');
  //   }
  // };

  // var getTestMessage = function (person, msg) {
  //   var output = 'IT\'S HIIIIIIGH NOON ' + person;
  //   var room = messageHelper.getChannelId(msg);
  //   msg.reply(output + '\n' + room);
  // };

  // robot.hear(trigger.getTrigger(), function (msg) {
  //   var person = messageHelper.getPerson(msg);
  //   var channelId = messageHelper.getChannelId(msg);
  //   var result = createSession(channelId, person);

  //   switch (result) {
  //     case 1:
  //       msg.reply('New session created in room ' + channelId + ', ' + person + ' designated as first player');
  //       break;
  //     case 2:
  //       msg.reply('Second player ' + person + ' added to session in room ' + channelId);
  //       break;
  //     default:
  //       msg.reply('Sorry, a session already exists in this channel, please try again in a little bit!');
  //   };
  // });

  // robot.hear(trigger.getTrigger('test'), function (msg) {
  //   var channelId = messageHelper.getChannelId(msg);
  //   if (sessionStore[channelId]) {
  //     sessionStore[channelId].timeToDraw = true;
  //     msg.reply('Session ready state has been set to true.  Players may now proceed to shoot.');
  //   } else {
  //     msg.reply('Sorry! A session has not been made yet, please type in &highnoon to start a session.');
  //   }
  // });

  // robot.hear(/BANG!/i, function (msg) {
  //   var person = messageHelper.getPerson(msg);
  //   var channelId = messageHelper.getChannelId(msg);
  //   if (sessionStore[channelId]) {
  //     // if session already has two players
  //     if (sessionStore[channelId].firstPlayer && sessionStore[channelId].secondPlayer) {
  //       // if first player shot first, else if second player shot first
  //       if (sessionStore[channelId].firstPlayer === person && !sessionStore[channelId].shotsFired) {
  //         if (sessionStore[channelId].timeToDraw) {
  //           msg.reply(person + ' shot first! Player one wins!');
  //         } else {
  //           msg.reply(person + ' has misfired! Player two wins!');
  //         }
  //         sessionStore[channelId].shotsFired = true;
  //         removeSession(msg, channelId);
  //       } else if (sessionStore[channelId].secondPlayer === person && !sessionStore[channelId].shotsFired) {
  //         if (sessionStore[channelId].timeToDraw) {
  //           msg.reply(person + ' shot first! Player two wins!');
  //         } else {
  //           msg.reply(person + ' has misfired! Player one wins!');
  //         }
  //         sessionStore[channelId].shotsFired = true;
  //         removeSession(msg, channelId);
  //       } else {
  //         msg.reply('HEY! You\'re not part of this duel! Take a seat son and wait for your turn!');
  //       }
  //     } else {
  //       msg.reply('Please wait for a second player to enter the game first before shooting!');
  //     }
  //   } else {
  //     msg.reply('Sorry! A session has not started yet.  Please type in &highnoon to start a session.');
  //   }
  // });

  // robot.hear(trigger.getTrigger('time'), function (msg) {
  //   var channelId = messageHelper.getChannelId(msg);
  //   if (sessionStore[channelId]) {
  //     msg.reply('Generated timer for session in room ' + channelId + ' was set to ' + sessionStore[channelId].countdownValue);
  //   } else {
  //     msg.reply('Sorry! A session has not been made yet.  Please type in &highnoon to start a session first.');
  //   }
  // });

  // robot.hear(trigger.getTrigger('cancel'), function (msg) {
  //   var channelId = messageHelper.getChannelId(msg);
  //   removeSession(msg, channelId);
  // });

  // robot.hear(trigger.getTrigger('stats'), function (msg) {
  //   getTestMessage(null, msg);
  // });

};

module.exports = Highnoon;
