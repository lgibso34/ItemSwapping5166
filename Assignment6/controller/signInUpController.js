var express = require("express");
var router = express.Router();
var _ = require("underscore");
var session = require('express-session');
var UserDB = require("../models/userDB");

const { check, validationResult } = require('express-validator/check');

//for method="POST"
var bodyParser = require("body-parser"); 
var urlencodedParser = bodyParser.urlencoded({extended: false});
//----------------------------------------------------------------------------------------------------------------------

var crypto = require('crypto');

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
  };

var saltHashPassword = function(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
    // console.log('UserPassword = '+userpassword);
    // console.log('Passwordhash = '+passwordData.passwordHash);
    // console.log('nSalt = '+passwordData.salt);

    return {salt: passwordData.salt, hash: passwordData.passwordHash}
}

//checks whether a user is signed out. REQUEST parameter required.
var isSignedIn = function(req){
    return !_.isUndefined(req.session.theUser);
}





module.exports = function(app){

    app.route("/login").get(function(req, res){
        res.render("login", {message: req.session.message});
    });





    app.route("/signUp").get(function(req, res){
        res.render("signUp");
    })

    // /signUp POST

    .post(urlencodedParser, [
        // check('username').isEmail().normalizeEmail(),
        check("username", "Email already exists").trim()
        .custom(async function(value){
            let user = await UserDB.getUserByUsername(value);
            if (!_.isEmpty(user)) {
                return false;
            }
        }),

        check('password', 'Password must contain 4-16 signs (numbers and letters)')
        .isLength({ min: 4 })
        .matches(/^[0-9a-zA-Z]{4,16}/),

        check('passConfirm', 'password does not match').custom(function(value, { req }){
            // console.log(value);
            // console.log(req.body.password);
            // console.log(value === req.body.password);
            return value === req.body.password                    
        }),
        check('firstName').isAlpha(),
        check('lastName').isAlpha(),
        check('address').matches(/^[0-9a-zA-Z\s]*/).trim()
        .withMessage("there are spaces in the address"),
        check('city').matches(/^[0-9a-zA-Z\s]*/).trim(),
        check('state').matches(/^[0-9a-zA-Z\s]*/).trim(),
        check('zip').isInt(),
        check('country').matches(/^[0-9a-zA-Z\s]*/).trim()
    ], function(req, res){

    const errors = validationResult(req);
    if(!_.isEmpty(errors.array())){
        console.log("errors: " + errors.array());
    }

     if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }else{
        var fLower = req.body.firstName.toLowerCase();
        var lLower = req.body.lastName.toLowerCase();


        var saltedPassword = saltHashPassword(req.body.password);
        //console.log(saltedPassword);


        UserDB.addUser(
        req.body.firstName, fLower,
        req.body.lastName, lLower,
        req.body.username,
        saltedPassword.hash,
        saltedPassword.salt,
        req.body.address,
        "", //address 2
        req.body.city,
        req.body.state,
        req.body.zip,
        req.body.country
        );





        res.redirect('login');
    }
        
        
    });

}