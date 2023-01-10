const Camping = require("../models/camping");
const campingCtrl = {};

campingCtrl.getCampings = async (req, res, next) => {
    const camping = await Camping.find();
    res.json(camping);
};

campingCtrl.createCamping = async (req, res, next) => {
    const camping = new Camping({
        name: req.body.name,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        price: req.body.price,
        images: req.body.images,
    });
    await camping.save();
    res.json({ status: "Camping created" });
};

campingCtrl.getCamping = async (req, res, next) => {
    const { id } = req.params;    
    const camping = await Camping.findById(id);
    res.json(camping);
};

campingCtrl.editCamping = async (req, res, next) => {
    await Camping.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
    res.json({ status: "Camping Updated" });
};


campingCtrl.deleteCamping = async (req, res, next) => {
    await Camping.findByIdAndRemove(req.params.id);
    res.json({ status: "Camping Deleted" });
};



module.exports = campingCtrl;