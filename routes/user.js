const {
  getPendingOrders,
  getCompletedOrders,
  getUser,
} = require("../controllers/user");
const { isAuth } = require("../middlewares/isAuth");

const router = require("express").Router();

router.get("/getPendingOrders", isAuth, getPendingOrders);

router.get("/getCompletedOrders", isAuth, getCompletedOrders);

router.get("/user", isAuth, getUser);

module.exports = router;
