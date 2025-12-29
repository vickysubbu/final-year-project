const express = require("express");
const router = express.Router();
const { auth, restrictTo } = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

router.get("/", auth, productController.getAllProducts);
router.post("/", auth, restrictTo("farmer"), productController.createProduct);
router.get("/:id", auth, productController.getProductById);
router.get("/my", auth, restrictTo("farmer"), productController.getMyProducts);
router.put("/:id", auth, restrictTo("farmer"), productController.updateProduct);
router.delete("/:id", auth, restrictTo("farmer"), productController.deleteProduct);

module.exports = router;