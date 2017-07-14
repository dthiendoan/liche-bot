import { SESSION_CREATED, SESSION_FULL, SESSION_REMOVED, SESSION_DOES_NOT_EXIST, PLAYER_ADDED, PLAYER_ALREADY_IN_SESSION, PLAYER_REMOVED, PLAYER_DOES_NOT_EXIST } from 'lib/States';
import Session from 'Session';
import PlayerState from 'PlayerState';

export class UserInterface {
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