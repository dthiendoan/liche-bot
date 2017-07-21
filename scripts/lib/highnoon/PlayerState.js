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

  module.exports = PlayerState;