const { check } = require("express-validator");
const { getServiceByName, addService } = require("../controllers/service");

const router = require("express").Router();

router.get("/getServiceByName", getServiceByName);
router.post(
  "/addService",
  [
    check("name").not().isEmpty(),
    check("price").not().isEmpty(),
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
  ],
  addService
);

module.exports = router;
