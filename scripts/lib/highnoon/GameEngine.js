var connectionHelper = require('../ConnectionHelper.js');

var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var ALL_PLAYER_SLOTS_FILLED = require('./lib/States.js').ALL_PLAYER_SLOTS_FILLED;
var NOT_ENOUGH_PLAYERS = require('./lib/States.js').NOT_ENOUGH_PLAYERS;
var PLAYER_IS_READY = require('./lib/States.js').PLAYER_IS_READY;
var PLAYER_ALREADY_READY = require('./lib/States.js').PLAYER_ALREADY_READY;
var ALL_PLAYERS_READY = require('./lib/States.js').ALL_PLAYERS_READY;
var GAME_IN_PROGRESS = require('./lib/States.js').GAME_IN_PROGRESS;
var INVALID_NUMBER_OF_PLAYERS = require('./lib/States.js').INVALID_NUMBER_OF_PLAYERS;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;
var PLAYER_DID_NOT_JOIN = require('./lib/States.js').PLAYER_DID_NOT_JOIN;
var FAILED_TO_RECORD_RESULTS = require('./lib/States.js').FAILED_TO_RECORD_RESULTS;
var RESULTS_SUCCESSFULLY_RECORDED = require('./lib/States.js').RESULTS_SUCCESSFULLY_RECORDED;

var CAUSE_OF_DEATH = require('./lib/Causes.js').CAUSE_OF_DEATH;

var COUNTDOWN_INTERVAL = 1500; 

var SessionInterface = require('./SessionInterface.js');
var SI = new SessionInterface();

var SessionStore = require('./SessionStore.js');

class GameEngine {
  /////////// SETTER METHODS ////////////

  changeTimer(msg, session) {
    if (session.elapsed >= session.countdownValue) {
      msg.reply('`DRAW!`');
      clearInterval(session.timer);
    } else {
      msg.reply('...');
      session.elapsed += COUNTDOWN_INTERVAL;
    }
  }

  startTimer(msg, session) {
    var self = this;
    session.timer = setInterval(function() { self.changeTimer(msg, session) }, COUNTDOWN_INTERVAL);
  }

  /////////// DATABASE METHODS ///////////

  recordResults(msg, session, player) {
    var connection = connectionHelper.getConnection();

    var didWin = Number(session.players[player].isAlive());
    var didLose = Number(!session.players[player].isAlive());
    var whereClause = 'WHERE username = "' + player + '"';
    var selectQuery = 'SELECT 1 FROM highnoon ' + whereClause + ' ORDER BY username LIMIT 1';
    var insertQuery = 'INSERT INTO highnoon (username, wins, losses) VALUES ("' + player + '", ' + didWin + ', ' + didLose + ')';
    var updateQuery = 'UPDATE highnoon SET wins = wins + ' + didWin + ', losses = losses + ' + didLose + ' ' + whereClause;

    connection.query(selectQuery, function(err, results, fields) {
      if (err) {
        msg.reply('_*ERROR*: Failed to add/update database with results of ' + player + '. Please check server logs for details._');
        console.log(err);
        return FAILED_TO_RECORD_RESULTS;
      } else {
        var query;
        if (results.length > 0) {
          query = connection.query(updateQuery);
        } else {
          query = connection.query(insertQuery);
        }
        return RESULTS_SUCCESSFULLY_RECORDED;
      }
    });
  }

  showResults(msg) {
    var connection = connectionHelper.getConnection();
    var selectQuery = 'SELECT * FROM highnoon';

    connection.query(selectQuery, function(err, rows) {
      if (err) {
        msg.reply('_*Failed to bring up results!*  Please check the code for showResults._');
        console.log(err);
      } else {
        var resultsString = '\n*=====HIGHNOON STATISTICS=====*\n```';
        for (var index = 0; index < rows.length; index++) {
          resultsString = resultsString + rows[index].username + ' - wins: ' + rows[index].wins + ', losses: ' + rows[index].losses + '\n';
        }
        resultsString += '```';
        msg.reply(resultsString);
      }
    });
  }

  /////////// CHECKS METHODS ////////////

  checkSession(msg, result, channelId, person) {
    switch (result) {
      case SESSION_CREATED:
        msg.reply('_New session created in room *' + channelId + '* of ' + SessionStore[channelId].getMaxPlayers() + ' people, *' + person + '* designated as first player._');
        break;
      case SESSION_FULL:
        msg.reply('_*Session is already full!* Please wait until the current session is finished, *' + person + '.*_');
        break;
      case SESSION_REMOVED:
        msg.reply('_Session successfully removed from room *' + channelId + '.*_');
        break;
      case SESSION_DOES_NOT_EXIST:
        msg.reply('_*There was not a session made yet!*  Please type *&highnoon* to start a session._');
        break;
      case PLAYER_ADDED:
        msg.reply('_Another player, *' + person + '*, added to session in room *' + channelId + '.*_');
        break;
      case ALL_PLAYER_SLOTS_FILLED:
        msg.reply('_*All player slots have been filled.*  Everyone, please type *\'ready\'* to begin the duel._');
        break;
      case NOT_ENOUGH_PLAYERS:
        msg.reply('_Sorry, looks like someone is missing out or just left the duel! *Please invite more people to fill in the session.*_');
        break;
      case PLAYER_IS_READY:
        msg.reply('_You are now *ready*, player *' + person + '.*_');
        break;
      case PLAYER_ALREADY_READY:
        msg.reply('Calm your shit down *' + person + '*!  *You\'re already ready.*  Please wait for the other players to ready up...')
        break;
      case ALL_PLAYERS_READY:
        msg.reply('_All players are now ready.  Game\'s about to begin..._');
        SessionStore[channelId].startGame();
        var intro = '_*Okay ';
        var counter = SessionStore[channelId].getMaxPlayers();
        for (var player in SessionStore[channelId].players) {
          intro = intro + player;
          counter--;
          if (counter !== 0) {
            intro += ', ';
          }
        }
        intro = intro + '!*  This town ain\'t big enough for the ' + SessionStore[channelId].getMaxPlayers() + ' of you._';
        var GE = this;
        setTimeout(function() {
          msg.reply(intro);
          msg.reply('_*It\'s hiiiiigh noon...*_');
          GE.startTimer(msg, SessionStore[channelId]);
        }, 2500);
        break;
      case GAME_IN_PROGRESS:
        msg.reply('_Sorry! *The game is already in progress*, you can\'t run that command!_');
        break;
      case INVALID_NUMBER_OF_PLAYERS:
        msg.reply('_*Sorry! The number of players you\'ve chosen is invalid.* Please try a number *between 2 and 10.*_');
        break;
      case PLAYER_REMOVED:
        msg.reply('Player *' + person + '* has been removed from session ' + channelId);
        break;
      case PLAYER_DOES_NOT_EXIST:
        msg.reply('Player *' + person + '* does not exist in the current session! Are you sure you got the right person?');
        break;
      case PLAYER_DID_NOT_JOIN:
        msg.reply('_Sorry! *You didn\'t join this session yet.* Try typing in \'&highnoon\' to join the game._');
        break;
      case PLAYER_ALREADY_IN_SESSION:
        msg.reply('_You are already in this session *' + person + '*!_');
        break;
      default:
        msg.reply('_*Sorry, the session is already full.* Please try again in a little bit!_');
    };
  }

  checkReady(msg, channelId, player) {
    var sessionExists = Boolean(SessionStore[channelId]);
    var readyCounter = 0;
    if (sessionExists) {
      if (!SessionStore[channelId].players[player]) {
        return PLAYER_DID_NOT_JOIN;
      }
      if (SessionStore[channelId].sessionIsFull()) {
        if (SessionStore[channelId].players[player].isReady()) {
          return PLAYER_ALREADY_READY;
        }
        SessionStore[channelId].players[player].setReady();
        for (var player in SessionStore[channelId].players) {
          if (SessionStore[channelId].players[player].isReady()) {
            readyCounter++;
          }
        }
        return readyCounter === SessionStore[channelId].getMaxPlayers() ? ALL_PLAYERS_READY : PLAYER_IS_READY;
      } else {
        return NOT_ENOUGH_PLAYERS;
      }
    } else {
      return SESSION_DOES_NOT_EXIST;
    }
  }

  checkDodge(msg, session, player, direction) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      if (direction !== 'left' && direction !== 'right') {
        msg.reply('_You cannot move in that direction, please try *\'DODGE! left\'* or *\'DODGE! right\'* instead._');
      } else if (session.sessionIsFull() && session.isTimeToDraw()) {
        session.players[player].setDodge(direction);
        msg.reply(':speedlines: _*' + player + ' dodges ' + direction + '!*_ :speedlines:');
      } else {
        msg.reply('_*The duel has not started yet!*  Please wait for everyone to be ready first before proceeding._');
      }
    } else {
      msg.reply('_Sorry! *A session has not started yet.*  Please type in *&highnoon* to start a session._');
    }
  }

  checkShot(msg, session, channelId, shooter, victim, direction = null) {
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
                  msg.reply('_If you really want to shoot yourself *' + shooter + '*, please try a Russian roulette instead..._');
                } else {
                  if (session.players[victim].isAlive()) {
                    if (session.players[victim].dodgeDirection() !== direction) {
                      msg.reply('_*' + shooter + ', YOU MISSED!*_');
                    } else {
                      msg.reply('_*' + shooter + '* shot *' + victim + '* ' + CAUSE_OF_DEATH[Math.floor(Math.random() * CAUSE_OF_DEATH.length)] + ' *' + victim + '* is *DEAD*!_ :bugcateternalsleep:');
                      session.players[victim].gotShot();
                      session.increaseDeathCount();
                    }
                  } else {
                    msg.reply('*' + victim + '* is already *DEAD*! No need to overkill, *' + shooter + '*!');
                  }
                }
              } else {
                msg.reply('*' + shooter + '* shoots in the air and hits...nothing. *_Huh???_* :bugcatwat: :bugcatwork:');
              }
            } else {
              msg.reply('Sorry *' + shooter + '*, you\'re already *DEAD*! :bugcatfff:');
            }
          } else {
            msg.reply('_*' + shooter + '* misfired! *' + shooter + '* is *DEAD* and out of the duel!_');
            session.players[shooter].gotShot();
            session.increaseDeathCount();
          }
          // check if there is only one player left after results
          if (session.onePlayerLeft() && !session.allShotsFired) {
            session.duelIsDone();
            clearInterval(session.timer);  // stops countdown if it is still going
            var recordResults;
            for (var player in session.players) {
              if (session.players[player].isAlive()) {
                msg.reply(':confetti_ball::confetti_ball::confetti_ball: *' + player + ' is the last person standing. ' + player + ' wins the duel!* :confetti_ball::confetti_ball::confetti_ball:');
              }
              this.recordResults(msg, session, player);
            }
            SI.removeSession(msg, channelId);
          }
        } else {
          msg.reply('_*HEY! You\'re not part of this duel! Take a seat son and wait for your turn!*_');
        }
      } else {
        msg.reply('_Please wait for all players to enter the game first before shooting!_ *(Players needed: ' + session.playersNeeded() + ')*');
      }
    } else {
      msg.reply('_Sorry! *A session has not started yet.*  Please type in *&highnoon* to start a session._');
    }
  }

  checkTime(msg, session, channelId) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      msg.reply('Generated timer for session in room ' + channelId + ' was set to ' + session.getCountdownValue());
    } else {
      msg.reply('Sorry! A session has not been made yet.  Please type in *&highnoon* to start a session first.');
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