const Joi = require('joi');
const Document = require('../models/document');
const fs = require('fs');
const documentController = {};

// Create document
documentController.createDocument = async (req, res, next) => {
  const { error } = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    public: Joi.boolean(),
  }).validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return -1;
  }
  if (req.file) {
    const document = new Document({
      name: req.body?.name || req.file.originalname,
      description: req.body?.description || '',
      public: req.body?.public || false,
      type: req.file.mimetype,
      size: req.file.size,
      path: `${req.body.public ? 'public/' : ''}${req.file.filename}`,
      owner: req.user._id 
    });
  
    let response = await document.save();
    response.path = `${response.public ? 'public/' : ''}${response._id}/${req.file.filename}`
    response = await document.save();
    res.json(response);
  }
};

documentController.downloadDocument = async (req, res, next) => {
  try {
    const { id, filename } = req.params;
    const document = await Document.findById(id);    
    console.log(document);
    res.setHeader('Content-Disposition', `attachment: filename="${document.name}"`);
    fs.createReadStream(`uploads/${document.public ? 'public/' : ''}${filename}`).pipe(res);
  } catch (error) {
    console.log(error)
    res.status(500).send('Error');
  }
};

module.exports = documentController;