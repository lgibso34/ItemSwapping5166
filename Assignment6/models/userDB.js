var item = require("./item");
var user = require("./user");
var userProfile = require("./userProfile");
var ItemDB = require("./ItemDB");
var mongoose = require('mongoose');
var _ = require("underscore");
//var appJS = require('../controller/app');

const AutoIncrement = require('mongoose-sequence')(mongoose);

var crypto = require('crypto');



module.exports.usersMap = usersMap = user.usersMap;
module.exports.itemsMap = itemsMap = item.itemsMap;
//module.exports.userProfileMap = userProfileMap = userProfile.userProfilesMap;

module.exports.populate = populate = function(){

  let user1 = new user.User("Logan", "Gibson", "logan@logan.com", "1111 address lane","", "Harrisburg", "NC", 28075, "United States");
  let user2 = new user.User("Bree", "Calloway", "bree@bree.com", "2222 address lane","", "Harrisburg", "NC", 28075, "United States");
  let user3 = new user.User("Ryan", "Anderson", "ryan@ryan.com", "3333 address lane","", "Harrisburg", "NC", 28075, "United States");
}

//adds cars to the userItems map which is a property of UserProfile
var addCarsForUser = function(userID, itemID){
  userProfile.getUserProfile(userID).userItemsArray.push(itemsMap.get(itemID));
}

//returns every user object that is currently in the usersMap from the user.js file
module.exports.getUsers = getUsers = function(){
    return usersMap;
};

module.exports.getUserProfile = getUserProfile = function(userID){
    return userProfile.getUserProfile(userID);
}

//must populate itemDB too!!!!!!!!!!!!!!!! for testing
//populate();
//itemDB.populate();
//console.log(usersMap);
//console.log(getUsers());
//console.log(userProfile.getUserProfile(3));
//console.log(getUserProfile(3));
//console.log(userProfile.getUserItems(2));
//console.log(user.getUser(1));
// var user1 = user.getUser(1);
// var user1profile = user1.profile;
// console.log(user1profile);
// console.log(user1profile.userItems);

//console.log(userProfile.emptyProfile(2));
//console.log(userProfilesMap);

//--------------------------------------------------------------------------------------------------------------------------------
//mongoDB/mongoose code below


var userSchema = new mongoose.Schema({
  userID: {type: Number},
  pass: {type: String},
  salt: {type: String},
  fName: {type: String, required: true},
  fNameLower: {type: String, required: true},
  lName: {type: String, required: true},
  lNameLower:  {type: String, required: true},
  username: {type: String, required: true},
  address1: {type: String, required: true},
  address2: {type: String},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zip: {type: Number, required: true},
  country: {type: String, required: true},
  Items: {type: Array, "default": [], required: true },
  rating: {ratingCount: Number, ratingTotal: Number}, //rating count is number of times rated, while ratingTotal is the total number of stars added together
}, {collection: 'Users'});

// var userSchema = new mongoose.Schema({},{collection: 'Users'});


//userSchema.plugin(AutoIncrement, {inc_field: 'userID'});



var Users = mongoose.model('UsersModel', userSchema);



// must be ran inside an async function with the await keyword on the variable
// that it is being saved to
module.exports.getAllUsers = getAllUsers = function(){
  return new Promise(function(resolve, reject){
    Users.find({}).then(function(docs){
        resolve(docs);
    });
  });
}

//must use async function and await keyword, then save to another variable with
//var example = JSON.parse(JSON.stringify(AWAITED_VAR NAME[0])); because it returns an array with
// only one item in it
module.exports.getUser = getUser = function(ID){
  return new Promise(function(resolve, reject){
    Users.findOne({userID: ID}).then(function(docs){
        resolve(docs);
    });
  });
}

module.exports.updateRating = updateRating = function(ID, rating){
  return new Promise(function(resolve, reject){
      Users.findOne({userID: ID}).then(async function(user){
        user.rating.ratingCount = user.rating.ratingCount + 1;
        user.rating.ratingTotal = user.rating.ratingTotal + rating;            
          await user.save();
          resolve(user);
      });
    });
}


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

//must use async function and await keyword, then save to another variable with
//var example = JSON.parse(JSON.stringify(AWAITED_VAR NAME[0])); because it returns an array with
// only one item in it
module.exports.getUserByLogin = getUserByLogin = function(username, pass){
  return new Promise(function(resolve, reject){
    //find user by email
    Users.findOne({username: username}).then(function(docs){
      // use the hashing function with the password entered and the salt stored in the user object
      // save it to a variable 
      let calculatedHash = sha512(pass, docs.salt)
      
      if(calculatedHash.passwordHash === docs.pass){
        //password entered was correct
        resolve(docs);
      }else{
        //resolve null because I couldn't figure out how to use reject() properly
        // this is when the user password entered was wrong and calculated an incorrect hash result
        resolve(null);
      }

        
    })
  });
}

//must use async function and await keyword, then save to another variable with
//var example = JSON.parse(JSON.stringify(AWAITED_VAR NAME[0])); because it returns an array with
// only one item in it
module.exports.getUserByUsername = getUserByUsername = function(username){
  return new Promise(function(resolve, reject){
    Users.findOne({username: username}).then(function(docs){
        resolve(docs);
    });
  });
}


module.exports.addUser = addUser = function(fName, fNameLower, lName, lNameLower,
  username, password, salt, address1, address2, city, state, zip, country){
    let newUser = new Users({
        fName: fName,
        fNameLower: fNameLower,
        lName: lName,
        lNameLower: lNameLower,
        username: username,
        pass: password,
        salt: salt,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        zip: zip,
        country: country,
        userID: userIDCounter
        });

    newUser.save();
    userIDCounter++;
}


module.exports.addUserObject = addUserObject = function(userObject){
  let newUser = new Users({
    fName: userObject.fName,
    fNameLower: userObject.fNameLower,
    lName: userObject.lName,
    lNameLower: userObject.lNameLower,
    username: userObject.username,
    pass: userObject.pass,
    salt: userObject.salt,
    address1: userObject.address1,
    address2: userObject.address2,
    city: userObject.city,
    state: userObject.state,
    zip: userObject.zip,
    country: userObject.country,
    userID: userIDCounter
    });

  newUser.save();  

  userIDCounter++;
}

//userItem must be an Integer
module.exports.removeUserItem = removeUserItem = async function(userID, userItem){
  let user = await getUser(userID);
  let item = await ItemDB.getItem(userItem);

  item.userIDofOwner = await 0;
  await item.save();

  user.Items = await user.Items.filter(item => item != userItem);

  await user.save();
  let newUser = await getUser(userID);

  return newUser.Items;
}

//userItem must be an Integer
module.exports.addUserItem = addUserItem = async function(userID, userItem){
  let user = await getUser(userID); //get user that item needs to be added to
  let item = await ItemDB.getItem(userItem);

  item.userIDofOwner = await userID;
  await item.save();
  await user.Items.push(userItem); 
  await user.save();
  let newUser = await getUser(userID);

  return newUser.Items;
}

//must use async function and await keyword
// counts the users in the Users collection
module.exports.countUsers = countUsers = function(){
  return new Promise(function(resolve, reject){
    Users.countDocuments().then(function(count){
      console.log("Number of users: " + count);
        resolve(count);
    });
  });
}

var userIDCounter;
var assignCounter = async function(){
  userIDCounter = await countUsers();
  userIDCounter++;
}
assignCounter();

