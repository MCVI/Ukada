var format = require('util').format;
var isArray = require('util').isArray;

module.exports = function flash(options) {
  options = options || {};
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;
  
  return function(req, res, next) {
    if (req.flash && safe) { return next(); }
    req.flash = _flash;
    next();
  }
}

function _flash(type, msg) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  var msgs = this.session.flash = this.session.flash || {};
  if (type && msg) {
    // util.format is available in Node.js 0.6+
    if (arguments.length > 2 && format) {
      var args = Array.prototype.slice.call(arguments, 1);
      msg = format.apply(undefined, args);
    } else if (isArray(msg)) {
      msg.forEach(function(val){        
        /**
         * auther xuelanghu
         */
        msgs[type] = val;
      });
      return msgs[type].length;
    }
    /**
     * auther xuelanghu
     */
    return (msgs[type]) = (msg);
  } else if (type) {
    var arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    this.session.flash = {};
    return msgs;
  }
}
