class PlayerState {
    constructor(name) {
      this.name = name;
      this.alive = true;
      this.ready = false;
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

    isReady() {
      return this.ready;
    }

    setReady() {
      this.ready = true;
    }

    unReady() {
      this.ready = false;
    }
  };

  module.exports = PlayerState;