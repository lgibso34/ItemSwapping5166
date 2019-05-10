
// counter for userID
var count = 1;
module.exports.swapItems = swapItems = new Map();
module.exports.swapItemsArray = swapItemsArray = [];

// UserSwap Object
module.exports.UserItem = UserItem = function(userItem, swapItem, swapItemRating, swapperRating){
    this.userItem = userItem;
    //grab the item from the database
    this.rating = userItem.rating;
    //available, pending(offer made), swapped(offer accepted)
    this.status = userItem.status;

    if(this.status === "AVAILABLE"){
    //the item swapped for this item
    this.swapItem = undefined;
    this.swapItemRating = undefined;
    //the swappers rating for the item
    this.swapperRating = undefined; 
    swapItemsArray.push(this);   
    }else if(this.status === "PENDING"){
    //the item swapped for this item
    this.swapItem = swapItem;
    this.swapItemRating = undefined;
    //the swappers rating for the item
    this.swapperRating = undefined;  
    swapItemsArray.push(this);  
    }else{
    //the item swapped for this item
    this.swapItem = swapItem;
    this.swapItemRating = swapItemRating;
    //the swappers rating for the item
    this.swapperRating = swapperRating; 
    
    swapItemsArray.push(this);
    }



    //add this user to the usersArray
    //addUser(this);
    swapItems.set(count, this);
    count++;
};

