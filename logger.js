/**
 * Expose `log`
 */

module.exports = function(el) {
  return function(header, str) {
    var div = document.createElement('div');
    div.innerHTML = '<strong>' + header + '</strong>: ' + str;
    el.appendChild(div);
  }
};
