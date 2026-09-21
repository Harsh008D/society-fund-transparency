const crypto = require('crypto')
const Invitation = require('../models/Invitation')
const User = require('../models/user')

exports.createInvitation = async (req, res) => {
  try {
    const { expiresInDays = 7, maxUses = 1 } = req.body

    const admin = await User.findById(req.user.userId)

    if (!admin || admin.role !== 'admin' || !admin.society) {
      return res.status(403).json({
        message: 'Admin society not found',
      })
    }

    const societyId = admin.society

    if (!societyId) {
      return res.status(400).json({ message: 'Society ID is required' })
    }

    if (!Number.isInteger(expiresInDays) || expiresInDays < 1 ||
      !Number.isInteger(maxUses) || maxUses < 1) {
      return res.status(400).json({
        message: 'Expiry and usage limit must be positive integers'
      })
    }

    const code = crypto.randomBytes(6).toString('hex').toUpperCase()

    const invitation = await Invitation.create({
      code,
      society: societyId,
      createdBy: req.user.userId,
      expiresAt: new Date(Date.now() + expiresInDays * 86400000),
      maxUses
    })

    res.status(201).json({
      message: 'Invitation created',
      invitation
    })
  } catch (error) {
    console.error('Create invitation error:', error)
    res.status(500).json({ message: 'Failed to create invitation' })
  }
}