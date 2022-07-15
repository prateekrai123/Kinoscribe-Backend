const { getServiceByName } = require("../controllers/service");

const router = require("express").Router();

router.get("/getServiceByName", getServiceByName);
router.post("/addService", addService);

module.exports = router;
