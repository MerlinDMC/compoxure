'use strict';

var _ = require('lodash');

var _RX_TIME_EXT_P = new RegExp('[^0-9]+$');
function timeToMillis(timeString) {
  var matched = _RX_TIME_EXT_P.exec(timeString),
      num = timeString,
      period = 'ms';

  if (matched !== null) {
    num = timeString.substr(0, timeString.length - matched[0].length);
    period = matched[0];
  }

  switch (period) {
  case 's':
    return Number(num) * 1000;
  case 'm':
    return Number(num) * 1000 * 60;
  case 'h':
    return Number(num) * 1000 * 60 * 60;
  case 'd':
    return Number(num) * 1000 * 60 * 60 * 24;
  default:
    return Number(num);
  }
}

var _RX_KEY_STATSD = new RegExp('[\.:\/-]', 'g');
function cacheKeytoStatsd(key) {
  return key.replace(_RX_KEY_STATSD, '_');
}

function urlToCacheKey(url) {
  url = url.replace('http://', '');
  return cacheKeytoStatsd(url);
}

function updateTemplateVariables(templateVars, variables) {

  _.each(_.filter(_.keys(variables), function (key) {
    return key.startsWith('x-') || key.startsWith('cx-');
  }), function (cxKey) {

    var variable = variables[cxKey],
        strippedKey = cxKey.substr(cxKey.indexOf('-') + 1),
        pipeIdx = strippedKey.indexOf('|'),
        variableKey = strippedKey.substr(0, pipeIdx),
        variableName = strippedKey.substr(pipeIdx + 1);

    templateVars[variableKey + ':' + variableName] = variable;
    templateVars[variableKey + ':' + variableName + ':encoded'] = encodeURI(variable);
  });
  return templateVars;
}

function filterCookies(whitelist, cookies) {
  return _.reduce(cookies, function (result, value, key) {
    if (whitelist.length === 0 || _.contains(whitelist, key)) {
      result += result ? '; ' : '';
      result += key + '=' + value;
    }
    return result;
  }, '');
}

module.exports = {
  timeToMillis: timeToMillis,
  urlToCacheKey: urlToCacheKey,
  cacheKeytoStatsd: cacheKeytoStatsd,
  render: require('parxer').render,
  updateTemplateVariables: updateTemplateVariables,
  filterCookies: filterCookies
};
