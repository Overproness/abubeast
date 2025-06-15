// This is a simplified polyfill for asynckit's serial.js

module.exports = function serial(list, iterator, callback) {
  const results = [];
  let index = 0;

  function next() {
    if (index >= list.length) {
      callback && callback(null, results);
      return;
    }

    iterator(list[index], index, function (err, result) {
      if (err) {
        callback && callback(err);
        return;
      }

      results[index] = result;
      index++;
      next();
    });
  }

  if (list.length === 0) {
    callback && callback(null, []);
    return;
  }

  next();
};
