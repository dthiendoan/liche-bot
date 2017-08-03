var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var ALL_PLAYER_SLOTS_FILLED = require('./lib/States.js').ALL_PLAYER_SLOTS_FILLED;
var INVALID_NUMBER_OF_PLAYERS = require('./lib/States.js').INVALID_NUMBER_OF_PLAYERS;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;

var CAUSE_OF_DEATH = [
  'right at the heart! Gae bolg style, bitches.',
  'right at the neck! Blood starts squirting everywhere.',
  'right at the knee! No more adventures for this lad...',
  'right at the family jewels! Ouch...Ramsay Bolton would be proud.',
  'square at the head! OOOOOOH, H-H-H-HEADSHOT! YOU CAN DANCE ALL DAY!',
  'by shooting the bullet at a metal wall... which ricocheted to a metal street sign... which finally ricocheted to the head.',
  'by throwing the gun at the floor, causing the trigger to go off and miraculously hit.',
  'with a crossbow. What???  I thought this was a gun duel... Anyway.',
  'with a spear at the chest. THIS IS MADNESS!',
  'with LOVE ARROW SHOOT!!!',
  'with a smartphone camera.  Then proceeds to shoot with a regular pistol.',
  'with a railgun, creating a large hole in the body.',
  'with a nerf gun...full of gasoline.  Then throws a lit match.',
  'while doing a somersault! WATCH THIS!',
  'with a flamethrower, BURN BABY BURN!!!',
  'with a nail gun!  You can say that was...crafty. *Sunglasses*',
  'with the holy words from \'Fifty Shades of Grey\'!  Ears start bleeding!',
  'with a paper plane laced with ricin poison.',
  'right at the hand with the gun, causing that gun to misfire and explode!',
  'with dysentery!'
];

var SessionInterface = require('./SessionInterface.js');
var SI = new SessionInterface();

var SessionStore = require('./SessionStore.js');

class GameEngine {
  /////////// SETTER METHODS ////////////

  changeTimer(msg, session) {
    msg.reply('...');
    session.elapsed += 2500;
    if (session.elapsed >= session.countdownValue) {
      msg.reply('DRAW!');
      clearInterval(session.timer);
    }
  }

  startTimer(msg, session) {
    var self = this;
    session.timer = setInterval(function() { self.changeTimer(msg, session) }, session.countdownValue);
  }

  /////////// CHECKS METHODS ////////////

  checkSession(msg, result, channelId, person) {
    switch (result) {
      case SESSION_CREATED:
        msg.reply('New session created in room ' + channelId + ', ' + person + ' designated as first player');
        break;
      case SESSION_FULL:
        msg.reply('Session is already full! Please wait until the current session is finished, ' + person + '.');
        break;
      case SESSION_REMOVED:
        msg.reply('Session successfully removed from room ' + channelId);
        break;
      case SESSION_DOES_NOT_EXIST:
        msg.reply('There was not a session made yet!  Please type &highnoon to start a session.');
        break;
      case PLAYER_ADDED:
        msg.reply('Another player, ' + person + ', added to session in room ' + channelId);
        break;
      case ALL_PLAYER_SLOTS_FILLED:
        msg.reply('All player slots filled. It\'s hiiiiigh noon...');
        this.startTimer(msg, SessionStore[channelId]);
        break;
      case INVALID_NUMBER_OF_PLAYERS:
        msg.reply('Sorry! The number of players you\'ve chosen is invalid. Please try a number between 2 and 10.');
        break;
      case PLAYER_REMOVED:
        msg.reply('Player ' + person + ' has been removed from session ' + channelId);
        break;
      case PLAYER_DOES_NOT_EXIST:
        msg.reply('Player ' + person + ' does not exist in the current session! Are you sure you got the right person?');
        break;
      case PLAYER_ALREADY_IN_SESSION:
        msg.reply('You are already in this session ' + person + '!');
        break;
      default:
        msg.reply('Sorry, the session is already full. Please try again in a little bit!');
    };
  }

  checkShot(msg, session, channelId, shooter, victim) {
    var sessionExists = Boolean(session);
    // check if a session exists
    if (sessionExists) {
      // check if the session already has all the players
      if (session.sessionIsFull()) {
        // check if the person is one of the players and if the duel is ongoing
        if (session.players[shooter] !== undefined && session.players[shooter].getName() === shooter && !session.allShotsFired) {
          // check if it is time to draw
          if (session.isTimeToDraw() && !session.onePlayerLeft()) {
            if (session.players[shooter].isAlive()) {
              if (session.players[victim]) {
                if (victim == shooter) {
                  msg.reply('If you really want to shoot yourself ' + shooter + ', please try a Russian roulette instead...');
                } else {
                  if (session.players[victim].isAlive()) {
                    msg.reply(shooter + ' shot ' + victim + ' ' + CAUSE_OF_DEATH[Math.floor(Math.random() * CAUSE_OF_DEATH.length)] + ' ' + victim + ' falls dead.');
                    session.players[victim].gotShot();
                    session.increaseDeathCount();
                  } else {
                    msg.reply(victim + 'is already dead! No need to overkill, ' + shooter + '!');
                  }
                }
              } else {
                msg.reply(shooter + 'shoots in the air and hits...nothing. Huh???');
              }
            } else {
              msg.reply('Sorry ' + shooter + ', you\'re already dead!');
            }
          } else {
            msg.reply(shooter + ' misfired! ' + shooter + ' is DEAD and out of the duel!');
            session.players[shooter].gotShot();
            session.increaseDeathCount();
          }
          // check if there is only one player left after results
          if (session.onePlayerLeft() && !session.allShotsFired) {
            session.duelIsDone();
            clearInterval(session.timer);  // stops countdown if it is still going
            for (var player in session.players) {
              if (session.players[player].isAlive()) {
                msg.reply(player + ' is the last person standing. ' + player + ' wins the duel!');
              }
            }
            SI.removeSession(msg, channelId);
          }
        } else {
          msg.reply('HEY! You\'re not part of this duel! Take a seat son and wait for your turn!');
        }
      } else {
        msg.reply('Please wait for all players to enter the game first before shooting! (Players needed: ' + session.playersNeeded() + ')');
      }
    } else {
      msg.reply('Sorry! A session has not started yet.  Please type in &highnoon to start a session.');
    }
  }

  checkTime(msg, session, channelId) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      msg.reply('Generated timer for session in room ' + channelId + ' was set to ' + session.getCountdownValue());
    } else {
      msg.reply('Sorry! A session has not been made yet.  Please type in &highnoon to start a session first.');
    }
  }

  //////////// TEST METHODS ////////////

  testDuel(msg, session) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      session.elapsed = session.countdownValue;
      if (session.isTimeToDraw()) {
        msg.reply('Session ready state has been set to true. Players may now proceed to shoot.');
      } else {
        msg.reply('Uh oh! Session\'s ready state cannot be set to true. Please check the code.');
      }
    } else {
      msg.reply('Sorry! A session has not been made yet, please type in &highnoon to start a session.');
    }
  }
};

module.exports = GameEngine;