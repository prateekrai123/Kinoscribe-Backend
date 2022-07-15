const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");
const serviceRoutes = require("./routes/service");
require("./db.js");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/service", serviceRoutes);

app.listen("4000", () => {
  console.log("Server is running on port 4000");
});
