let express = require("express");
const path = require("path");
let router = express.Router();
let authMiddleware = require("../middelwares/authMiddleware.js");
let userController = require("../controllers/userController.js");


router.get("/", authMiddleware , userController.main);
router.post("/modificardireccion", userController.cambiarDireccion)

module.exports = router;