const HttpError = require('../models/http-error');
const uuid = require('uuid');

const Place = require('../models/place-model');
const User  = require('../models/user-model');
const  mongoose  = require('mongoose');

const fs = require('fs');


async function getPlaceByUserId (req,res,next) {
    const userId = req.params.userId;

    let places;

    try {
        places = await Place.find({creator:userId});
    } catch (err) {
        const error = new HttpError('Something went wrong ! , couldn\'t not found the place');
        return next(error);
    }

    if(!places || places.length === 0){
        const error = new HttpError('Could\'t not find a place for the provided user id ');
        return next(error);
    }

    res.json({places:places.map(pl => pl.toObject({getters:true}))});
}

async function getPlaceById (req,res,next) {

    let place;

    try {
        place = await Place.findById(req.params.placeId);
    } catch (err) {
        const error = new HttpError('Someything went wrong ! , Please try again',500)
        return next(error)
    }

    if(!place){
        const error = new HttpError('Could\'t not find a place for the provided id ',500)
        return next(error)
    }


    res.json({place:place.toObject({getters:true})});
}

async function addPlace (req,res,next) {

    const { title,description,location,address,creator } = req.body;

    const createdPlace = new Place(
        {
            title,
            description,
            location,
            address,
            creator,
            image:req.file.path
        }
    )

    let user;

    try {
        user = await User.findById(creator)
    } catch (err) {
        const error = new HttpError('Creating place failed , Please try again',500);
        
        return next(error);
        
    }

    if(!user){
        const error = new HttpError('Could not find a user with the provided id',404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction()
        await createdPlace.save({session:sess});
        user.places.push(createdPlace);
        await user.save({session:sess});
        (await sess).commitTransaction();
    } catch (er) {
        console.log(er);
        const error = new HttpError('creating place failed  , please try again',500);
        return next(error);
    }

    res.status(201).json({'place':createdPlace});
}

async function updatePlace(req,res,next) { 

    const { title,description } = req.body;
    
    const placeId = req.params.placeId;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Someything went wrong ! please try again 1',500)
        return next(error)
    }

    if(place.creator.toString() !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',401);
        return next(error);
    }

    place.description = description;
    place.title = title;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Someything went wrong ! please try again',500)
        return next(error)
    }

    res.json({place:place.toObject()})
}

async function deletePlace(req,res,next) {

    let place;

    try {
        place = await Place.findById(req.params.placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong ! please try again ',500);
        return next(error);
    }

    if(!place){
        const error = new HttpError('could not find a place with the provided id',404)
        return next(error);
    }

    if(place.creator.id !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',401);
        return next(error);
    }

    const imageUrl = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session:sess});
        place.creator.places.pull(place);
        await place.creator.save({session:sess});
        await sess.commitTransaction();
        res.json({message:"Place deleted successfully"});

        fs.unlink(imageUrl,err => {
            console.log(err);
        });

    } catch (err) {
        const error = new HttpError('could not delete place, please try again later',500);
        return next(error);
    }
}


exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.addPlace = addPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;