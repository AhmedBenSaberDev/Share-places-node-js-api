const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();
const cors = require("cors");
const fs = require('fs');
const path = require('path');

app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(bodyParser.json());

app.use('/uploads/images',express.static(path.join('uploads','images')))

app.use('/places',placesRoutes);

app.use('/users',usersRoutes);

app.use((req,res,next) => {
    const error = new HttpError("Coult not find this route",404);
    throw error
});

app.use((error,req,res,next) => {
    if(req.file){
        fs.unlink(req.file.path, err => {
            console.log(err);
        })
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message:error.message || "An unknown error occured" })
})

mongoose.connect("mongodb+srv://rooot:root@cluster0.009z0.mongodb.net/places?retryWrites=true&w=majority")
.then (() => {
    app.listen(5000)
})
.catch(err => { console.log(err)});
