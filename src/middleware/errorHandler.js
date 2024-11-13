const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(res.statusCode != 200 ? res.statusCode : 500)
    .json({ message: err.message || "Something went wrong" });
};

module.exports = errorHandler;
