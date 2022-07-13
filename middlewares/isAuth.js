const jwt = require("jsonwebtoken");

module.exports.isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    console.log("not token");
    return res
      .status(208)
      .json({ isError: true, authError: true, message: "Failed No token" });
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res
      .status(208)
      .json({ isError: true, authError: true, message: "Failed Not good" });
  }

  if (!decodedToken) {
    return res
      .status(208)
      .json({ isError: true, authError: true, message: "Failed Token expire" });
  }
  req.userId = decodedToken.id;
  next();
};
