// This is a simplified polyfill for asynckit's parallel.js

module.exports = function parallel(list, limit, iterator, callback) {
  if (typeof limit !== "number") {
    callback = iterator;
    iterator = limit;
    limit = Infinity;
  }

  const results = [];
  let running = 0;
  let completed = 0;
  let index = 0;
  let ended = false;

  function next() {
    if (ended) return;
    while (running < limit && index < list.length) {
      const i = index++;
      running++;
      iterator(list[i], i, function (err, result) {
        if (ended) return;
        running--;
        completed++;
        results[i] = result;
        if (err) {
          ended = true;
          callback && callback(err);
          return;
        }
        if (completed === list.length) {
          ended = true;
          callback && callback(null, results);
          return;
        }
        next();
      });
    }
  }

  if (list.length === 0) {
    callback && callback(null, []);
    return;
  }

  next();
};
