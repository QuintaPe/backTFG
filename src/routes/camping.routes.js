const express = require("express");
const router = express.Router();

const campingCtrl = require("../controllers/camping.controller");

// CRUD de Usuarios
router.get("/", campingCtrl.getCampings);
router.post("/", campingCtrl.createCamping);
router.get("/:id", campingCtrl.getCamping);
router.put("/:id", campingCtrl.editCamping);
router.delete("/:id", campingCtrl.deleteCamping);

module.exports = router;
