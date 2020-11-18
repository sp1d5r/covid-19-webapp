"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var buildQuery = function buildQuery(query, token) {
  var country = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  var no_country = "".concat(base_url).concat(query, ".json?access_token=").concat(token);
  var with_country = "".concat(base_url).concat(query, ".json?country=").concat(country, "&access_token=").concat(token);
  return country ? with_country : no_country;
};

var getResults =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(query, token) {
    var country,
        path,
        testPath,
        queryResults,
        _args = arguments;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            country = _args.length > 2 && _args[2] !== undefined ? _args[2] : undefined;

            if (!(query === "")) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", {
              response: {
                features: []
              }
            });

          case 3:
            _context.prev = 3;
            path = buildQuery(query, token, country); // Mapbox API returns an object which comes
            // with a .json() method which asynchronously
            // executes the query

            _context.next = 7;
            return fetch(path, {
              headers: {
                "Content-Type": "application/json"
              }
            });

          case 7:
            testPath = _context.sent;

            if (testPath.ok) {
              _context.next = 10;
              break;
            }

            throw Error(testPath.statusText);

          case 10:
            _context.next = 12;
            return testPath.json();

          case 12:
            queryResults = _context.sent;
            return _context.abrupt("return", {
              response: queryResults
            });

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", {
              error: _context.t0
            });

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 16]]);
  }));

  return function getResults(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _default = getResults;
exports["default"] = _default;