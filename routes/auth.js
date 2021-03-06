const express = require("express");
const { check } = require("express-validator");
const { signUp, signIn, verifyUser } = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signUp",
  [
    check("name", "Name is required"),
    check("password", "password is required"),
    check("email", "email is required"),
    check("phone", "phone is required"),
  ],
  signUp
);

router.post(
  "/signIn",
  [
    check("password", "password is required"),
    check("email", "email is required"),
  ],
  signIn
);

router.post(
  "/verify",
  [
    check("verificationCode", "code is required"),
    check("email", "email is required"),
  ],
  verifyUser
);

module.exports = router;
