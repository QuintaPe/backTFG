const Joi = require('joi');
const Camping = require('../models/camping');
const campingController = {}


// Get all campings
campingController.getCampings = async (req, res, next) => {
  const { error } = Joi.object({
    page: Joi.number().integer().min(0).required(),
    size: Joi.number().integer().min(0).required(),
    search: Joi.string().optional().allow(null, ''),
    filters: Joi.object().required(),
    sort: Joi.string().optional().allow(null, ''),
  }).validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return -1;
  }

  const { page, size, search, filters, sort } = req.body;

  if (req.user.role !== 'admin') {
    filters.owner = req.user._id;
  }

  const response = await Camping.search(null, filters, size, page, sort ?? '-createdAt');
  res.json(response);
};

// Get single camping
campingController.getCamping = (req, res, next) => {
  const id = req.params.id;
  Camping.findById(id)
    .then(camping => !camping
        ? res.status(200).json({ camping })
        : res.status(404).json({ message: "Camping not found" })
    ).catch(error => res.status(500).json({ error }) );
};

// Create new camping
campingController.createCamping = (req, res, next) => {
  delete req.body._id;
  delete req.body.owner;
  const camping = new Camping({ ...req.body, owner: req.user._id });
  camping.save().then(result => {
      res.status(201).json({
        message: "Camping created successfully",
        camping: result
      });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

// Update camping
campingController.updateCamping = (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Camping.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Camping updated",
        result: result
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
};

// Delete a Camping
campingController.deleteCamping = async (req, res, next) => {
  try {
    const camping = await Camping.findByIdAndDelete(req.params.campingId);
    if (!camping) {
      return res.status(404).json({ message: 'Camping not found' });
    }
    return res.status(200).json({ message: 'Camping deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = campingController;