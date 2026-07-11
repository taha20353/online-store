const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getProfile, updateProfile, updateProfilePicture,
  changePassword, getAddresses, addAddress,
  deleteAddress, setDefaultAddress
} = require('../controllers/profile');

// ─── All routes protected ───
router.use(verifyToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/picture', upload.single('image'), updateProfilePicture);
router.put('/password', changePassword);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

module.exports = router;