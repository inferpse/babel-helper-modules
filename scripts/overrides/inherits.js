"use strict";

exports.__esModule = true;

var checkSuper = function(superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass));
  }
}

if (typeof Object.create === 'function') {
  // ES5
  exports["default"] = function(subClass, superClass) {
    checkSuper(superClass);
    subClass.prototype = Object.create(superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // ES3
  exports["default"] = function(subClass, superClass) {
    checkSuper(superClass);
    var F = function () {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
  }
}
