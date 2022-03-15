
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title:{ type : String , required:true },
    description :{ type : String , required:true },
    location : {
        lat:{type:Number , required: false},
        lng:{type:Number , required: false}
    },
    address:{type : String , required:true},
    image:{type:String,required:true},
    creator:{type : mongoose.SchemaTypes.ObjectId, required:true , ref: "User"}
    
});

module.exports = mongoose.model('Place',placeSchema);