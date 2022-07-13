const User = require("../models/User");

module.exports.isAdmin = (req, res, next) => {
  const userId = req.userId;

  User.findOne({ _id: userId })
    .then((user) => {
      if (user.isAdmin) {
        next();
      } else {
        res.status(208).json({
          isError: true,
          message: "You are not admin",
        });
      }
    })
    .catch((err) => {
      res.status(208).json({
        isError: true,
        message: "You are not admin",
      });
    });
};
