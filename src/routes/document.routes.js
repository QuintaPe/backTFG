import express from 'express';
import multer from 'multer';
import documentCtrl from '../controllers/document.controller.js';
import { authMiddleware } from '../middlewares/middlewares.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
});

export const documentRouter = express.Router();
documentRouter.post("", authMiddleware, upload.single('document'), documentCtrl.createDocument);
documentRouter.get("/:id", documentCtrl.downloadDocument);