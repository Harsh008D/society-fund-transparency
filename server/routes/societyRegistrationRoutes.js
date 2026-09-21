const express = require("express");
const { registerSociety } = require(
  "../controllers/societyRegistrationController"
);

const router = express.Router();

router.post("/register", registerSociety);

module.exports = router;