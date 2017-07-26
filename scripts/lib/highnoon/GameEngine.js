var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;

var SessionInterface = require('./SessionInterface.js');
var SI = new SessionInterface();

class GameEngine {
  /////////// SETTER METHODS ////////////

  incrementTimer(msg, session) {
    msg.reply('...');
    session.elapsed += 2500;
  }

  startTimer(msg, session) {
    session.timer = setInterval(function() { incrementTimer(msg); }, session.countdownValue);
  }

  endTimer(msg, session) {
    msg.reply('DRAW!');
    clearInterval(session.timer);
  }

  duelIsDone(session) {
    session.allShotsFired = true;
  }

  /////////// CHECKS METHODS ////////////

  checkSession(msg, result, channelId, person) {
    switch (result) {
      case SESSION_CREATED:
        msg.reply('New session created in room ' + channelId + ', ' + person + ' designated as first player');
        break;
      case SESSION_FULL:
        msg.reply('Session is already full! Please wait until the current session is finished ' + person + '.');
        break;
      case SESSION_REMOVED:
        msg.reply('Session successfully removed from room ' + channelId);
        break;
      case SESSION_DOES_NOT_EXIST:
        msg.reply('There was not a session made yet!  Please type &highnoon to start a session.');
        break;
      case PLAYER_ADDED:
        msg.reply('Another player ' + person + ' added to session in room ' + channelId);
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

  checkShot(msg, session, channelId, shooter) {
    var sessionExists = Boolean(session);
    // check if a session exists
    if (sessionExists) {
      // check if the session already has all the players
      if (session.sessionIsFull()) {
        // check if the person is one of the players and if the duel is ongoing
        if (session.players[shooter].getName() === shooter && !session.allShotsFired) {
          // check if it is time to draw
          if (session.isTimeToDraw()) {
            msg.reply(shooter + ' shot first! Everyone else falls dead. ' + shooter + ' wins!');
            for (var player in session.players) {
              if (session.players[player].getName() !== shooter) {
                session.players[player].gotShot();
              }
            }
            duelIsDone(session);
            SI.removeSession(msg, channelId);
          } else {
            msg.reply(shooter + ' misfired! ' + shooter + ' is DEAD and out of the duel!');
            session.players[shooter].gotShot();
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