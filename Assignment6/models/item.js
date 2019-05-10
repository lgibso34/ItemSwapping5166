// holds all items
module.exports.itemsArray = itemsArray = [];

module.exports.categories = categories = [];

module.exports.itemsMap = itemsMap = new Map();



// counter for itemCode
var count = 1;

// item Object
module.exports.Item = Item = function(name, category, description, rating, imageURL){
    this.itemName = name;
    this.itemCode = count;
    this.catalogCategory = category;
    this.description = description;
    this.rating = rating;
    this.imageURL = imageURL;
    //available, pending(offer made), swapped(offer accepted)
    this.status = "AVAILABLE";

    //add this item to the itemsArray  
    addItem(this);
    addCatagory(this);
    itemsMap.set(count, this);
    count++;

    //disables editing of properties without a method
    //immutable(this);
};

// adds item to the array
var addItem = function(item){
    itemsArray.push(item);
};

//adds each brand to the categories array so we know what categories exist
var addCatagory = function(item){
    if(!categories.includes(item.catalogCategory)){
        categories.push(item.catalogCategory);
    }
}


Item.prototype.changeRating = function(newRating){
    this.rating = newRating;
};

Item.prototype.changeStatus = function(newStatus){
    if(typeof newStatus.valueOf() == "string"){
    var stat = newStatus.toUpperCase();    
        if(stat === "AVAILABLE" || stat === "PENDING" || stat === "SWAPPED" ){
            this.status = newStatus;
        }else{console.log("Value was string but not available, pending, or swapped.");}
    }else{
        console.log("New status not set, value was not a string.");
    }
};


/* this function allows the properties to stay constant unless the change method is called
example: item.itemCode = 66; would not work, it wont return an error but it wont do anything
*/
var immutable = function(item){    
    Object.defineProperties(item, {
        'itemName': {
            writable: false
        },
        'itemCode': {
            writable: false
        },
        'catalogCategory': {
            writable: false
        },
        'description': {
            writable: false
        },
        'rating': {
            writable: false
        },
        'imageURL': {
            writable: false
        }
    });
    
    /*
    Object.defineProperty(item, 'itemCode', {
        writable: false
    });
    */
};



