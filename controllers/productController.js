const Product = require("../models/Product");

const cityCoords = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Tirunelveli: { lat: 8.7139, lng: 77.7567 },
  Vellore: { lat: 12.9165, lng: 79.1325 },
  Erode: { lat: 11.341, lng: 77.7172 },
  Thoothukudi: { lat: 8.7642, lng: 78.1348 },
  Dindigul: { lat: 10.3673, lng: 77.9803 },
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

exports.getAllProducts = async (req, res) => {
  try {
    const userLocation = req.query.location || "Chennai";
    const userCoords = cityCoords[userLocation] || cityCoords.Chennai;

    const products = await Product.find().populate("farmer", "username location");

    const filtered = products.filter(p => p.location && cityCoords[p.location.trim()]);

    filtered.forEach((p) => {
      const fCoords = cityCoords[p.location.trim()];
      p.distance = haversine(userCoords.lat, userCoords.lng, fCoords.lat, fCoords.lng);
    });

    filtered.sort((a, b) => a.distance - b.distance);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      farmer: req.user._id,
      farmerName: req.user.username,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("farmer", "username");
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.farmer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ msg: "Product not found or unauthorized" });
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.farmer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ msg: "Product not found or unauthorized" });
    }
    await product.deleteOne();
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};