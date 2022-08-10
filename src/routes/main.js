let express = require("express");
const path = require("path");
let router = express.Router();
let mainController = require("../controllers/mainController")

/*app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./views/index.html"))
});*/

router.get("/", mainController.home);

router.get("/index", mainController.home);

router.get("/home", mainController.home);

router.get("/admin", mainController.admin)

//router.get("/purchase", mainController.purchase);



module.exports=router;