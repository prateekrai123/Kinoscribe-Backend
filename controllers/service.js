module.exports.getServiceById = (req, res) => {
  const { id } = req.query;
  Service.findById(id)
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
