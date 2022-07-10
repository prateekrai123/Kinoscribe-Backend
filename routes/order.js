const { check } = require("express-validator");
const {
  placeOrder,
  getOrdersByUserId,
  upload,
  getAllOrders,
  payForOrder,
  successPay,
  updatePrice,
} = require("../controllers/order");

const router = require("express").Router();

//userId, serviceId, wordCount, price

router.post(
  "/placeOrder",
  upload.single("file"),
  [
    check("userId", "UserId is required").not().isEmpty(),
    check("serviceId", "ServiceId is required").not().isEmpty(),
    check("wordCount", "Word count is required"),
    check("price", "Price is required"),
  ],
  placeOrder
);

router.get("/getOrdersByUserId/:userId", getOrdersByUserId);

router.get("/allOrders", getAllOrders);

router.post("/pay", check("orderId", "orderId is required"), payForOrder);

router.get("/success", successPay);

router.post(
  "/updatePrice",
  [
    check("orderId", "orderId is required"),
    check("price", "price is required"),
  ],
  updatePrice
);

module.exports = router;
