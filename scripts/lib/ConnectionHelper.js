var Config = require('../../config/config.js');
var Mysql = require('mysql');

var ConnectionHelper = function() {
  var connection;

  var init = function() {
    connection = Mysql.createConnection(Config.mysql);
  }

  this.getConnection = function() {
    if (!connection || connection.state == 'protocol_error') {
      init();
    }

    if (connection.state == 'disconnected') {
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
