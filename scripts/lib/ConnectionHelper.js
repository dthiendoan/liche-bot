var Config = require('../../config/config.js');
var Mysql = require('mysql');

var ConnectionHelper = function() {
  var connection;

  var init = function() {
    var config = new Config();
    connection = Mysql.createConnection(config.mysql);
  }

  this.getConnection = function() {
    if (!connection) {
      init();
    }

    if (connection.state === 'disconnected' || connection.state === 'protocol_error') {
      connection.connect();
    }

    return connection;
  }

}

ConnectionHelper.instance = null;

ConnectionHelper.getInstance = function() {
  if(this.instance === null){
      this.instance = new ConnectionHelper();
  }

  return this.instance;
}


module.exports = ConnectionHelper.getInstance();
