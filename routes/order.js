const { placeOrder, getOrdersByUserId } = require("../controllers/order");

const router = require("express").Router();

//userId, serviceId, wordCount, price

router.post(
  "/placeOrder",
  [
    check("userId").isNumeric(),
    check("serviceId").isNumeric(),
    check("wordCount").isNumeric(),
    check("price").isNumeric(),
  ],
  placeOrder
);

router.get("/getOrdersByUserId/:userId", getOrdersByUserId);

router.get();

module.exports = router;
