/**
 * Expose `log`
 */

module.exports = function(el) {
  return function(str) {
    var div = document.createElement('div');
    str = ('-' == str[0]) ? str : '• ' + str;
    div.textContent = str;
    el.appendChild(div);
  };
};
