import { Storage } from '@google-cloud/storage';
import Document from '../models/document.js';
const documentController = {};

const storage = new Storage({
  projectId: 'hale-equator-382816',
  keyFilename: 'googleCloudKey.json',
});

const bucket = storage.bucket('scoutcamp-bucket');

// Create document
documentController.createDocument = async (req, res, next) => {
  if (req.file) {
    try {
      const path = `${req.body.public ? 'public/' : ''}${Date.now()}-${
        req.file.originalname
      }`;
      const blob = bucket.file(path);
      const blobStream = blob.createWriteStream();

      blobStream.on('finish', async () => {
        const document = new Document({
          name: req.body?.name || req.file.originalname,
          description: req.body?.description || '',
          public: req.body?.public || false,
          type: req.file.mimetype,
          size: req.file.size,
          path,
          owner: req.user._id,
        });

        const response = await document.save();
        res.json(response);
      });

      blobStream.end(req.file.buffer);
    } catch (error) {
      next(error);
    }
  }
};

documentController.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    const file = bucket.file(document.path);
    const exists = await file.exists();

    if (!exists[0]) {
      throw new Error('El archivo no existe.');
    }

    res.set('Content-Type', document.type);
    file.createReadStream().pipe(res);
  } catch (error) {
    next(error);
  }
};

export default documentController;
