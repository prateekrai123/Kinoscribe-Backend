const { validationResult } = require("express-validator");
const Service = require("../models/service");

module.exports.getServiceByName = (req, res) => {
  const { name } = req.query;
  console.log(req.query);
  console.log(name);
  Service.find({ name: name })
    .then((service) => {
      res.status(200).json(service);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while getting service",
        isError: true,
      });
    });
};

module.exports.addService = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      isError: true,
      errors: errors.array(),
    });
  }

  const { name, price, description, title } = req.body;
  const service = new Service({
    name: name,
    price: price,
    title: title,
    description: description,
  });
  service
    .save()
    .then((service) => {
      res.status(200).json(service);
    })
    .catch((err) => {
      res.status(208).json({
        message: "Error while adding service",
        isError: true,
      });
    });
};
