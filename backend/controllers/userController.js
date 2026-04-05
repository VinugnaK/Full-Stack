const UserModel = require('../models/UserModel')

const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    await UserModel.update(req.user.id, req.body)
    const user = await UserModel.findById(req.user.id)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile }
