const { getServiceByName } = require("../controllers/service");

const router = require("express").Router();

router.get("/getServiceByName", getServiceByName);

module.exports = router;
