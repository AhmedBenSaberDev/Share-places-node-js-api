const express = require('express');

const router = express.Router();

const placesController = require('../controllers/places-controller');

const fileUpload = require('../middlewares/file-upload');

const authCheck = require('../middlewares/check-auth');


router.get('/user/:userId',placesController.getPlaceByUserId);

router.get('/:placeId',placesController.getPlaceById);

router.use(authCheck);

router.post('/',fileUpload.single('image'),placesController.addPlace);

router.patch('/:placeId',placesController.updatePlace);

router.delete('/:placeId',placesController.deletePlace);


module.exports = router;