const express = require("express");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const { default: Stripe } = require("stripe");
const stripe = new Stripe(process.env.TEST_STRIPE_SEC_KEY);
const Order = require("../models/Order");
var path = require("path");

exports.upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/work");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

module.exports.placeOrder = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while placing order",
      isError: true,
      errors: errors.array(),
    });
  }

  const { serviceId, wordCount, price, title, description } = req.body;
  const userId = req.userId;
  const file = req.file;

  if (!file) {
    console.log("No file");
    return res.status(208).json({
      message: "Error while placing order",
      isError: true,
      errors: [{ msg: "No file provided" }],
    });
  }

  Order.create({
    user: mongoose.Types.ObjectId(req.userId),
    service: mongoose.Types.ObjectId(serviceId),
    date: new Date(),
    title: title,
    description: description,
    wordCount: wordCount,
    price: price,
    file: file.filename,
  })
    .then((order) => {
      res.status(200).json(order);
    })
    .catch((err) => {
      console.log(err);
      return res.status(208).json({
        err: err,
        message: "Error while placing order",
        isError: true,
      });
    });
};

module.exports.getOrderById = (req, res) => {
  const id = req.body.id;
  console.log(id);
  Order.findOne({ _id: id })
    .then((res1) => {
      return res.status(200).json({
        order: res1,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(208).json({
        message: "Error while getting order",
        isError: true,
      });
    });
  // console.log(order);
};

module.exports.getOrdersByUserId = (req, res) => {
  const { userId } = req.params;
  Order.find({
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
  Order.find({ isCompleted: false })
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
  Order.find({ isDeclined: true })
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
  Order.find({ isCompleted: true })
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while marking order as completed",
      isError: true,
      errors: errors.array(),
    });
  }

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

module.exports.deliverWork = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while delivering work",
      isError: true,
      errors: errors.array(),
    });
  }

  const { orderId } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(208).json({
      message: "Error while delivering work",
      isError: true,
      errors: [{ msg: "No file provided" }],
    });
  }

  Order.findOneAndUpdate(
    { _id: orderId },
    { $set: { isCompleted: true, file: file.path } }
  )
    .then((order) => {
      return res.status(200).json(order);
    })
    .catch((err) => {
      return res.status(208).json({
        message: "Error while delivering work",
        isError: true,
      });
    });
};

module.exports.getAllOrders = (req, res) => {
  Order.find()
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

module.exports.payForOrder = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while paying for order",
      isError: true,
      errors: errors.array(),
    });
  }

  const { orderId } = req.body;

  console.log(orderId);

  Order.findOne({ _id: orderId })
    .then((order) => {
      console.log(order);
      const product = stripe.products
        .create({
          name: order.title,
        })
        .then((product) => {
          console.log(product);
          stripe.prices
            .create({
              unit_amount: order.price,
              currency: "usd",
              tax_behavior: "inclusive",
              product: product.id,
            })
            .then((price) => {
              console.log(price);
              stripe.checkout.sessions
                .create({
                  payment_method_types: ["card"],
                  mode: "payment",
                  line_items: [
                    {
                      price: price.id,
                      quantity: 1,
                    },
                  ],
                  success_url: "http://localhost:3000/order/success",
                  cancel_url: "http://localhost:3000/order/cancel",
                  metadata: {
                    order_id: product.id,
                  },
                })
                .then((session) => {
                  console.log(session);
                  Order.findOneAndUpdate(
                    { _id: orderId },
                    {
                      $set: {
                        paymentDetails: {
                          paymentId: session.id,
                          paymentStatus: "ongoing",
                        },
                      },
                    }
                  );
                  window.location.href = session.url;
                })
                .catch((err) => {
                  console.log(err);
                  res.status(208).json({
                    message: "Error while creating session",
                    isError: true,
                  });
                });
            })
            .catch((err) => {
              return res.status(208).json({
                isError: true,
                message: "Error while creating price",
              });
            });
        })
        .catch((err) => {
          return res.status(208).json({
            isError: true,
            message: "Error while creating product",
          });
        });
    })
    .catch((err) => {
      return res.status(208).json({
        isError: true,
        message: "Error while getting order",
      });
    });
};

// module.exports.payOrder = (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(208).json({
//       isError: true,
//       message: "Please provide order Id",
//     });
//   }

//   const { orderId } = req.body;
//   let order;
// Order.findOne({ _id: orderId })
//   .then((order) => {
//     order = order;
//   })
//   .catch((err) => {
//     return res.status(208).json({
//       isError: true,
//       message: "Error while getting order",
//     });
//   });
// const product = stripe.products.create({
//   name: order.title,
// });

//   const price = stripe.prices.create({
//     unit_amount: order.price,
//     currency: "usd",
//     product: product.id,
//     tax_behavior: "inclusive",
//   });

//   const paymentLint = stripe.paymentLinks.create({
//     line_items: [
//       {
//         price: price.id,
//         quantity: 1,
//       },
//     ],
//     after_completion: {
//       type: "redirect",
//       redirect: "http://localhost:3000",
//     },
//   });

//   stripe.checkout.sessions.create()
// };

module.exports.successPay = (req, res) => {
  const oid = req.query.order_id;

  const paymentId = Order.findOne({ _id: oid });

  stripe.checkout.sessions
    .retrieve(paymentId)
    .then((session) => {
      if (session.payment_status === "succeeded") {
        Order.findOneAndUpdate(
          { _id: oid },
          {
            $set: {
              paymentDetails: {
                paymentId: session.id,
                paymentStatus: succeeded,
              },
            },
          }
        );
      } else {
        Order.findOneAndUpdate(
          { _id: oid },
          {
            $set: {
              paymentDetails: {
                paymentId: session.id,
                paymentStatus: failed,
              },
            },
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });

  res.redirect("https://kinoscribe.com");
};

module.exports.updateOrder = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      message: "Error while updating price",
      isError: true,
      errors: errors.array(),
    });
  }

  const { orderId, price } = req.body;

  const file = req.file;

  Order.findOneAndUpdate(
    { _id: orderId },
    { $set: { price: price, delieveredFile: file.filename, isCompleted: true } }
  )
    .then((order) => {
      return res.status(200).json(order);
    })
    .catch((err) => {
      return res.status(208).json({
        message: "Error while updating price",
        isError: true,
      });
    });
};
