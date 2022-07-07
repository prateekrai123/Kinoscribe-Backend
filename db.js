const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/kinoscribe", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});
