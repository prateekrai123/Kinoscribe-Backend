const { default: mongoose } = require("mongoose");

const OrderSchema = new mongoose.Schema({
  /*user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },*/
  date: {
    type: Date,
    required: true,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isPending: {
    type: Boolean,
    default: true,
  },
  isDeclined: {
    type: Boolean,
    default: false,
  },
  wordCount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  expectedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
  file: {
    type: String,
  },
  paymentDetails: {
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
    },
  },
});

module.exports = mongoose.model("Order", OrderSchema);
