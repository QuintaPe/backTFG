const express = require("express");
const multer = require('multer');
const { authMiddleware } = require("../utils/middlewares");
const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5mb
    } 
});

const documentCtrl = require("../controllers/document.controller");

router.post("", authMiddleware, upload.single('document'), documentCtrl.createDocument);
router.get("/:id", documentCtrl.downloadDocument);

module.exports = router;
