var {mongoose} = require('./../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'${VALUE} is not a valid email'
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    tokens:[{
        access:{
            type:String,
            required:true,
        },
        token:{
            type:String,
            required:true,
        }
    }]
});

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObj = user.toObject();
    return _.pick(userObj,['_id','email']);
}

//CONFUSED
UserSchema.methods.generateAuthToken = function(){
    var user = this;//UserSchema
    var access = 'auth';
    var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();
    user.tokens = user.tokens.concat([{access,token}]);
    //return a promise
    return user.save().then(()=>{
        return token;
    });
}

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decode;
    try {
        decode = jwt.verify(token,'abc123');
    } catch (error) {
        return Promise.reject();
    }
    return User.findOne({
        _id : decode._id,
        'tokens.token': token,
        'tokens.access':'auth'
    });//return a Promise
}

//mongo middleware
UserSchema.pre('save',function(next){
    var user = this;
    console.log('userschema pre save');
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                console.log(hash);
                user.password = hash;
                next();
            });
        }); 
    }else{
        next();
    } 
});

//find user by email & password
UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res) resolve(user);
                else reject(err);
            })
        });
    });
};

var User = mongoose.model('User',UserSchema);
module.exports = {User}