const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createFund,
    getFunds,
    updateFund,
    deleteFund,
  } = require("../controllers/fundController");

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createFund
);

router.get(
    "/:societyId",
    protect,
    getFunds
);

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateFund
  );
  
  router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteFund
  );

module.exports = router;