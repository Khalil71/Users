const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/user_login_sys');

let db = mongoose.connection;
mongoose.Promise = global.Promise;

//User Schema
let UserSchema = mongoose.Schema({
    username:{
        type: String,
        index: true
    },
    password:{
        type: String, required:true,  bcrypt: true
    },
    email:{
        type: String
    },
    name:{
        type: String
    },
    profileimage:{
        type: String
    }
});

let User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if(err) return callback(err);
        callback(null, isMatch);
    });
}

module.exports.getUserByUsername = function(username, callback){
    let query = {username: username};
    User.findOne(query, callback);
}
module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}


module.exports.createUser = function (newUser, callback) {
    bcrypt.hash(newUser.password, 10, function (err, hash) {
     if(err) throw err;
     //set hashed pass.
        newUser.password = hash;
        //Create User
        newUser.save(callback);
    });
}