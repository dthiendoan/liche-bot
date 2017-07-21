var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;
var Session = require('./Session.js');
var PlayerState = require('./PlayerState.js');

class UserInterface {
  createSession(session, channelId, person, maxPlayers = 2) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      return session.addPlayer(person);
    } else {
      session = new Session(channelId, maxPlayers);
      session.addPlayer(person);
      return SESSION_CREATED;
    }
  }

  removeSession(session, msg) {
    var existed = Boolean(session); // check if it exists first prior to deletion
    if (!existed) {
      return SESSION_DOES_NOT_EXIST;
    } else {
      delete session;
      return SESSION_REMOVED;
    }
  }

  addPlayer(session, person) {
    if (!session.sessionIsFull()) {
      if (session.players[person] === undefined) {
        session.players[person] = new PlayerState(person);
        return PLAYER_ADDED;
      } else {
        return PLAYER_ALREADY_IN_SESSION;
      }
    } else {
      return SESSION_FULL;
    }
  }

  removePlayer(session, person) {
    var sessionExists = Boolean(session);
    if (sessionExists) {
      if (session.players[person] !== undefined) {
        delete session.players[person];
        return PLAYER_REMOVED;
      } else {
        return PLAYER_DOES_NOT_EXIST;
      }
    } else {
      return SESSION_DOES_NOT_EXIST;
    }
  }
};

module.exports = UserInterface;