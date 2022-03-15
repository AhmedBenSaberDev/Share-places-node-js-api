const HttpError = require('../models/http-error');

const {validationResult} = require('express-validator'); 
const User = require('../models/user-model');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function signUp(req,res,next) {

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(422).json(errors.array({onlyFirstError: false} ))
    }

    const { name , email , password } = req.body;
    let existingUser

    try {
        existingUser = await User.findOne({email:email});
    } catch (err) {
        const error = new HttpError('An error occured please try again',500);
        return next(error);
    }

    if(existingUser){
        const error = new HttpError('This user already exists',422);
        return next(error); 
    }

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password,12);    
    } catch (err) {
        const error =  new HttpError('An error ecoorured please try again later',500);
        return next(error);
    }

    let createdUser = new User({
        name:name,
        password:hashedPassword,
        email:email,
        image:req.file.path,
        places:[]
    });

    try {
        await createdUser.save();

    } catch (err) {
        const error = new HttpError('An error occured please try again 1',500);
        return next(error); 
    }

    res.json({user:createdUser.toObject({getters:true})});
}

async function logIn(req,res,next) {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(422).json({message:errors.array({onlyFirstError:false})});
    }

    const {email , password } = req.body;
    let user;

    try {
        user = await User.findOne({email:email})
    } catch (err) {
        const error = new HttpError('Invalid credentials , please try again',404);
        return next(error);
    }
    if(!user){
        const error = new HttpError('Invalid credentials , please try again',404);
        return next(error);
    }

    let passwordIsValid = false;


    try {
        passwordIsValid = await bcrypt.compare(password,user.password);
    } catch (err) {
        const error = new HttpError('Invalid credentials , please try again',404);
        return next(error); 
    }
   
    if(!passwordIsValid){
        const error = new HttpError('Invalid credentials , please try again',404);
        return next(error);
    }

    let token;

    try {
        token = await jwt.sign({
            userId:user.id,
            email:user.email
        },
        'supersecret')
    } catch (err) {
        const error = new HttpError('Log in failed , please try again',500);
        return next(error);
    }

    res.json({userId:user.id,email:user.email,token:token})
}

async function getUsers(req,res,next) {
    
    let users;

    try {
        users = await User.find({},'email name places image');
    } catch (err) {
        const error = new HttpError('An error occured please try again',500);
        return next(error);
    }

    res.json({users:users.map(user => user.toObject())});
}

exports.signUp = signUp;
exports.logIn = logIn;
exports.getUsers = getUsers;