var config = require('../../config/config.js');

var TriggerHelper = function (category) {
  var trigger_category = category;

  this.getTrigger = function(action, args)  {
    console.log('^' + config.trigger + trigger_category + (action ? '\\s+' + action : '') + (args ? '\\s+' + args : '') + '\\s*$')
    return new RegExp('^' + config.trigger + trigger_category + (action ? '\\s+' + action : '') + (args ? '\\s+' + args : '') + '\\s*$');
  }
}

module.exports = TriggerHelper;
