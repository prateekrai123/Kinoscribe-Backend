const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");
const serviceRoutes = require("./routes/service");
const userRoutes = require("./routes/user");
require("./db.js");
require("dotenv").config();

const app = express();

app.use("/profile", express.static("uploads/work"));

app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/service", serviceRoutes);
app.use("/user", userRoutes);

app.listen("4000", () => {
  console.log("Server is running on port 4000");
});
