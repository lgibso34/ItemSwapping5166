var userProfile = require("./userProfile");

// holds all users
module.exports.usersArray = usersArray = [];
module.exports.usersMap = usersMap = new Map();

// counter for userID
var count = 1;

// User Object
module.exports.User = User = function(fName, lName, email, address1, address2,
     city, state, zip, country, itemArray){
    this.userID = count;
    this.fName = fName;
    this.lName = lName;
    this.email = email;
    this.address1 = address1;
    this.address2 = address2;    
    this.city = city;
    this.state = state;
    this.zip = zip;  
    this.country = country;
    this.Items = itemArray;

    //add this user to the usersArray
    //addUser(this);
    usersMap.set(count, this);
    this.profile = new userProfile.UserProfile(count);
    
    count++;
};

// adds user to the array
var addUser = function(item){
    usersArray.push(item);
};

//returns a user by code (userID) or a string that states it was not found
// module.exports.getUser = getUser = function(userID){
//     var result = usersMap.get(userID);
//     if(result == undefined){
//         return "User with that ID not found." ;
//     }else{
//      return result;
//     }

// }