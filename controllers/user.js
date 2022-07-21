const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/user");

module.exports.getPendingOrders = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while getting orders",
      isError: true,
    });
  }

  Order.find({ isCompleted: false, userId: req.userId })
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while getting orders",
        isError: true,
      });
    });
};

module.exports.getCompletedOrders = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while getting orders",
      isError: true,
    });
  }

  Order.find({ isCompleted: true, userId: req.userId })
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while getting orders",
        isError: true,
      });
    });
};

module.exports.getUser = (req, res) => {
  User.findOne({ _id: req.userId })
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(208).json({
        isError: true,
        message: "Error while getting user",
      });
    });
};
