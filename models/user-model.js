const mongoose = require('mongoose');
const uniqueValidation = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    name:{type:String , required:true},
    email:{type:String , required:true , unique:true},
    password:{type:String , required:true, minlength:6},
    image:{type:String,required:true},
    name:{type:String , required:true},
    places:[{type:mongoose.SchemaTypes.ObjectId, require :true , ref : 'Place'}]
});

// userSchema.plugin(uniqueValidation);

module.exports = mongoose.model('User',userSchema);