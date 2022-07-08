const { validationResult } = require("express-validator");
const Order = require("../models/Order");

module.exports.placeOrder = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Error while placing order",
      isError: true,
      errors: errors.array(),
    });
  }

  const { userId, serviceId, wordCount, price } = req.body;
  Order.create({
    user: userId,
    service: serviceId,
    date: new Date(),
    time: Date.prototype.getTime(),
    wordCount: wordCount,
    price: price,
  })
    .then((order) => {
      res.status(200).json(order);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while placing order",
        isError: true,
      });
    });
};

module.exports.getOrdersByUserId = (req, res) => {
  const { userId } = req.params;
  Order.findAll({
    where: {
      user: userId,
    },
  })
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

module.exports.pendingOrders = (req, res) => {
  Order.findAll({ isPending: true })
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

module.exports.declinedOrders = (req, res) => {
  Order.findAll({ isDeclined: true })
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

module.exports.completedOrders = (req, res) => {
  Order.findAll({ isCompleted: true })
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

module.exports.markCompleted = (req, res) => {
  const { orderId } = req.body;
  Order.findOneAndUpdate({ _id: orderId }, { $set: { isCompleted: true } })
    .then((order) => {
      res.status(200).json(order);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while getting orders",
        isError: true,
      });
    });
};
