module.exports.getServiceByName = (req, res) => {
  const { name } = req.query;
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
