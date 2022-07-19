const { check } = require("express-validator");
const {
  placeOrder,
  getOrdersByUserId,
  upload,
  getAllOrders,
  payForOrder,
  successPay,
  updateOrder,
  pendingOrders,
  getOrderById,
} = require("../controllers/order");
const { isAdmin } = require("../middlewares/isAdmin");
const { isAuth } = require("../middlewares/isAuth");

const router = require("express").Router();

router.post(
  "/placeOrder",
  upload.single("file"),
  [
    check("serviceId", "ServiceId is required").not().isEmpty(),
    check("wordCount", "Word count is required"),
    check("price", "Price is required"),
    check("title", "Title is required"),
    check("description", "Description is required"),
  ],
  isAuth,
  placeOrder
);

router.get("/getOrdersByUserId/:userId", isAuth, getOrdersByUserId);

router.get("/allOrders", isAuth, isAdmin, getAllOrders);

router.post("/orderById", isAuth, isAdmin, getOrderById);

router.get("/allPendingOrders", isAuth, isAdmin, pendingOrders);

router.post(
  "/pay",
  check("orderId", "orderId is required"),
  isAuth,
  payForOrder
);

router.get("/success", successPay);

router.post(
  "/updateOrder",
  upload.single("file"),
  [
    check("orderId", "orderId is required"),
    check("price", "price is required"),
  ],
  isAdmin,
  updateOrder
);

module.exports = router;
