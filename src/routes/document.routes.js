const express = require("express");
const multer = require('multer');
const { authMiddleware } = require("../utils/middlewares");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req.body?.public, `uploads${req.body?.public ? '/public' : ''}`);
        cb(null, `uploads${req.body?.public ? '/public' : ''}`)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

const documentCtrl = require("../controllers/document.controller");

router.post("", authMiddleware, upload.single('document'), documentCtrl.createDocument);
router.get("/public/:id/:filename", documentCtrl.downloadDocument);

module.exports = router;
