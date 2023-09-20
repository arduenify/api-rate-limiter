// Gets a single wrapped result row as a promise
const getAsync = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, function (err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
module.exports = getAsync;
