const express = require('express')
const router = express.Router()

const { createInvitation } =
  require('../controllers/invitationController')

const { protect, authorizeRoles } =
  require('../middleware/authMiddleware')

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  createInvitation
)

module.exports = router