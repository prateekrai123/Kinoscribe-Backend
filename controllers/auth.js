const { validationResult } = require("express-validator");
const User = require("../models/user");
const mail = require("../utils/mail");
const jwt = require("jsonwebtoken");
const verifyToken = require("../models/verifyToken");
const bcrypt = require("bcrypt");

module.exports.signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(208).json({
      errors: errors.array(),
      isError: true,
    });
  }
  const { name, email, password, phone } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return res.status(208).json({
        message: "Internal Server Error",
        isError: true,
      });
    }
    if (user) {
      return res.status(208).json({
        message: "User already exists",
        isError: true,
      });
    }
  });

  const verificationCode = Math.floor(Math.random() * 1000000);
  const encryptedPassword = bcrypt.hashSync(password, 10);
  const user = new User({
    name: name,
    email: email,
    password: encryptedPassword,
    phone: phone,
    verificationCode: verificationCode,
    verified: false,
  });

  try {
    const token = crypto.randomBytes(64).toString("hex");
    const verifyToken = verifyToken({
      token: token,
      email: req.body.email,
    });

    verifyToken.save((err, token) => {
      if (err) {
        console.log(err);
      }
      console.log(token);
    });

    const uri = `https://api.kinoscribe.com/verifyUser/${token}`;

    mail.sendMail({
      to: req.body.email,
      subject: "Verification Email",
      html: `<h3>Click on the link to verify your email: <br></h3>
      <p><a href=${uri}>Click here</a></p>`,
    });
  } catch (err) {
    return res.status(208).json({
      err: err,
      message: "Mail sending failed",
      isError: true,
    });
  }

  user.save((err, user) => {
    if (err) {
      return res.status(208).json({
        message: "Internal Server Error",
        isError: true,
      });
    }
    return res.status(200).json({
      message: "User created successfully",
      body: user,
      isError: false,
    });
  });
};

module.exports.signIn = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      errors: errors.array(),
      isError: true,
    });
  }
  const { email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return res.status(208).json({
        message: "Internal Server Error",
        isError: true,
      });
    }
    if (!user) {
      return res.status(208).json({
        message: "User does not exist",
        isError: true,
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(208).json({
        message: "Invalid password",
        isError: true,
      });
    }
    if (!user.verified) {
      return res.status(208).json({
        message: "User not verified",
        isError: true,
      });
    } else {
      const token = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
      res.cookie("token", token);
      return res.status(200).json({
        token: token,
        userId: user._id,
        isError: false,
        message: "Signed In successfully",
      });
    }
  });
};

module.exports.forgotPassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      errors: errors.array(),
      isError: true,
    });
  }
  const { email } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return res.status(208).json({
        message: "Internal Server Error",
        isError: true,
      });
    }
    if (!user) {
      return res.status(208).json({
        message: "User does not exist",
        isError: true,
      });
    }
    const verificationCode = Math.floor(Math.random() * 1000000);
    user.verificationCode = verificationCode;
    user.save((err, user) => {
      if (err) {
        return res.status(208).json({
          message: "Internal Server Error",
          isError: true,
        });
      }
      return res.status(200).json({
        message: "Verification code sent to your email",
        isError: false,
      });
    });
  });
};

exports.verify = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(
      failAction({
        error: errors.array[0].msg,
      })
    );
  }

  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err || !user) {
      return res.status(400).json(failAction("The user is not registered"));
    }
    try {
      const token = crypto.randomBytes(32).toString("hex");

      await verifyToken({
        token: token,
        email: req.body.email,
      }).save();

      const uri = `http://api.techfestsliet.com/verifyUser/${token}`;

      mail.sendMail({
        to: req.body.email,
        subject: "Verification Email",
        html: `<h3>Click on the link to verify your email: <br></h3>
        <p><a href=${uri}>Click here</a></p>`,
      });

      res
        .status(200)
        .json(successAction("The verification email is successfully sent"));
    } catch (err) {
      return res.status(400).json(failAction(err));
    }
  });
};

module.exports.verifyUser = async (req, res) => {
  const token = await req.params.token;
  if (token) {
    const verify = await verifyToken.findOne({ token: token });
    if (verify) {
      let user = await User.findOne({ email: verify.email });
      user.verified = true;
      await user.save();
      await verifyToken.findOneAndDelete({ token: token });

      // return res.render("verifyuser", {
      //   isError: false,
      //   message: "The user is verified successfully!",
      // });
      return res.status(200).json(successAction("The user is verified"));
    } else {
      // return res.render("verifyuser", {
      //   isError: true,
      //   message: "The token is expired!",
      // });
      return res.status(404).json(failAction("The token is expired"));
    }
  } else {
    // return res.render("verifyuser", {
    //   isError: true,
    //   message: "Cannot get token",
    // });
    return res.status(404).json(failAction("Cannot get token"));
  }
};

module.exports.resetPassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array()[0].msg);
    return res
      .status(208)
      .json({ title: "Error", message: errors.array()[0].msg });
  }

  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err || !user) {
      return res
        .status(208)
        .json({ title: "Error", message: "User not found" });
    } else {
      try {
        const condition = await bcrypt.compare(
          req.body.oldPassword,
          user.password
        );
        if (condition) {
          const encryptedPassword = (
            await bcrypt.hash(req.body.oldPassword, 10)
          ).toString();
          User.findOneAndUpdate(
            { user: user.userId },
            { $set: { password: encryptedPassword } },
            (err, user) => {
              if (err && !user) {
                console.log(err);
                return res
                  .status(208)
                  .json({ title: "Error", message: "Cannot update password" });
              } else {
                return res
                  .status(200)
                  .json({ title: "Success", message: "Password is changed" });
              }
            }
          );
        } else {
          return res
            .status(208)
            .json({ title: "Error", message: "The email is not registered" });
        }
      } catch (err) {
        return res.status(208).json(failAction("Cannot update password"));
      }
    }
  });
};

module.exports.signOut = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json(successAction("Signed Out successfully"));
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array);
    return res.status(200).json({
      isError: true,
      title: "Error",
      message: "Email is required",
    });
  }

  const { email } = await req.body;

  User.findOne({ email: email }, async (err, user) => {
    if (err || !user) {
      return res.status(200).json({
        isError: true,
        title: "Error",
        message: "The email is not registered",
      });
    }
    try {
      await verifyToken.findOneAndDelete({ email: email });

      const token = crypto.randomBytes(32).toString("hex");

      await verifyToken({
        token: token,
        email: req.body.email,
      }).save();

      const uri = `https://api.techfestsliet.com/forget-password-token/${token}`;

      mail.sendMail({
        to: req.body.email,
        subject: "Forgot Password Email",
        html: `<h3>Click on the link to verify your email: <br></h3>
        <p><a href=${uri}>Click here</a></p>`,
      });

      res.status(200).json({
        title: "Error",
        message: "The verification email is successfully sent",
      });
    } catch (err) {
      return res.status(200).json({
        isError: true,
        title: "Error",
        message: err,
      });
    }
  });
};

exports.changeForgotPassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  const token = req.params.token;

  verifyToken.findOne({ token: token }, async (err, token) => {
    if (err || !token) {
      return res
        .status(401)
        .json(failAction("Token not found or token expired"));
    }

    try {
      res.render("forgotPassword.ejs", { email: token.email });
    } catch (err) {
      return res.status(404).json("Some error occured" + err);
    }
  });
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  console.log(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    console.log(body);
    return res.status(400).json(failAction(errors));
  }

  const { email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);

  try {
    User.findOneAndUpdate(
      { email: email },
      { $set: { password: encryptedPassword } },
      (err, user) => {
        if (err && !user) {
          console.log(err);
          return res.status(404).json({ message: "Cannot update password" });
        }
        return res.status(200).json({ message: "Password is changed" });
      }
    );
  } catch (err) {
    return res.status(201).json({ message: err });
  }
};
