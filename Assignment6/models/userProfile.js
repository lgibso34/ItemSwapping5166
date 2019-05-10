var user = require("./user");

module.exports.userProfilesMap = userProfilesMap = new Map();

// counter for userID
var count = 1;

// UserProfile Object
module.exports.UserProfile = UserProfile = function(userID){
    this.userID = userID;
    // const userPromise = await UserDB.getUser(userID);
    // var user1 = JSON.parse(JSON.stringify(userPromise[0]));
    // this.name = user1.fName + " " + user1.lName;
    //this.name = user.getUser(userID).fName + " " + user.getUser(userID).lName;
    this.userItemsArray = [];
    userProfilesMap.set(count, this); 
    count++;
};

UserProfile.prototype.emptyProfile = function(){
    userProfilesMap.delete(this.userID);
    //may need to set some statuses of the items to available upon deletion
}

UserProfile.prototype.removeUserItem = function(item){
    var arr = this.userItemsArray.filter(x => x.itemCode !== item.itemCode);
    return arr;
}

UserProfile.prototype.getUserItems = function(){
    return this.userItemsArray;
}




//returns a userProfile by code (userID) or a string that states it was not found
module.exports.getUserProfile = getUserProfile = function(userID){
    var result = userProfilesMap.get(userID);
    if(result == undefined){
        return "User with that ID not found.";
    }else{
     return result;
    }
}




