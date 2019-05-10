var item = require("./item");
var _ = require("underscore");
var mongoose = require('mongoose');
var UserDB = require("./userDB");
const AutoIncrement = require('mongoose-sequence')(mongoose);
var _ = require("underscore");

//holds an array of items
var itemDB = item.itemsArray;

module.exports.itemsMap = itemsMap = item.itemsMap;
module.exports.userMap = userMap = new Map();
module.exports.populate = populate = function(){

let acura = new item.Item("2019 Acura TLX A-Spec SH-AWD", "Acura", "Luxury sedan sports car", "****", "../images/tlx.jpg");
let acura2 = new item.Item("2019 Acura NSX", "Acura", "Luxury sports car", "******", "../images/nsx.jpg");
let acura3 = new item.Item("2019 Acura RLX SH-AWD", "Acura", "Luxury sedan.", "*****", "../images/rlx.jpg");

let volvo = new item.Item("2019 Volvo S60 AWD", "Volvo", "Luxury sedan", "*****", "../images/s60.jpeg");
let volvo2 = new item.Item("2019 Volvo S90", "Volvo", "Luxury SUV", "*****", "../images/s90.jpg");
let volvo3 = new item.Item("2019 Volvo XC90 T8 Twin Engine Electric-AWD", "Volvo", "Luxury SUV", "*****", "../images/xc90.jpg");

let ferrari = new item.Item("2019 Ferrari 812 Superfast V12", "Ferrari", "this is a ferrari", "*****", "../images/812superfast.webp");
let ferrari2 = new item.Item("2019 Ferrari 488 GTB", "Ferrari", "this is a ferrari", "*****", "../images/488gtb.webp");
let ferrari3 = new item.Item("2019 Ferrari 488 Spider", "Ferrari", "this is a ferrari", "*****", "../images/488spider.webp");

//sets the checked out cars for the current user logged in
//userMap.set(itemsMap.get(6).itemCode, itemsMap.get(6));
//userMap.set(itemsMap.get(2).itemCode, itemsMap.get(2));
//item.changeStatus(itemsMap.get(6), "available");
}

//returns every item object that is currently in the itemsMap from the item.js file
module.exports.getItems = getItems = function(){
    return item.itemsMap;
};

//returns items in a formatted manner
module.exports.getItemsFormatted = getItemsFormatted = function(){
    var str = "";
    for(var i=1; i<itemsMap.size+1; i++){
        var element = getItem(i);
        str += printItem(element.itemCode) + "\n\n";
    };
    return str;
};


//THIS WAS COMMENTED OUT WHEN THE DATABASE GETITEM FUNCTION WAS CREATED
//returns an item by code (itemID) or a string that states it was not found
// module.exports.getItem = getItem = function(itemID){
//     var result = itemsMap.get(itemID);
//     if(result == undefined){
//         return "Element with that ID not found." ;
//     }else{
//      return result;
//     }

// }

module.exports.getItemsByCategory = getItemsByCategory = function(category){
    var result = itemDB.filter(x => x.catalogCategory === category);
    if(result == undefined){
        return "Element with that category not found."
    }
    else{
        return result;
    }
};

//pass the profile object
// creates an array of cars that do not belong to the user signed in
module.exports.getItemsNotOwnedBy = getItemsNotOwnedBy = function(userProfile){
    var result = [];
    var arr = userProfile.userItemsArray;
    //console.log(arr);
    for(var i=0; i<arr.length; i++){
        if(i<1){
        result = itemDB.filter(x => x.itemCode != arr[i].itemCode);
        }else{
            result = result.filter(x => x.itemCode != arr[i].itemCode);
        }
    }

    if(result == undefined){
        return "No other items found."
    }
    else{
        return result;
    }
};


// prints item in a formatted manner by ID
// module.exports.printItem = printItem = function(ID){
//     var e1 = getItem(ID);
//     return "Name: " + e1.itemName + "\nItem ID: " + e1.itemCode + "\nBrand: " + e1.catalogCategory 
//     + "\nDescription: " + e1.description + "\nRating: " + e1.rating;
// };

//console.log("\n");
// returns the array of items in the array

// console.log(getItemsFormatted());
// console.log(getItem(0));
// console.log(item.getItemID(volvo));
// item.changeID(acura, 55);
// console.log(acura.itemCode);
// console.log(printItem(2));
// console.log(itemsMap);
// populate();
// console.log(getItems());
// console.log(getItem(1));

//console.log(getItemsByCategory("Acura"));

//console.log(item.categories);
//console.log("\n");



//---------------------------------------------------------------------------------------------------------------------------------
//database code below





var itemSchema = new mongoose.Schema({
    itemCode: {type: Number, required: true},
    userIDofOwner: {type: Number, required: true }, //if no owner then zero
    itemName: {type: String, required: true},
    yearModel: {type: Number, required: true},
    catalogCategory: {type: String, required: true},
    description:  {type: String, required: true},
    rating: {ratingCount: Number, ratingTotal: Number}, //rating count is number of times rated, while ratingTotal is the total number of stars added together
    imageURL: {type: String, required: true},
    status: {type: String, required: true}
  }, {collection: "Items"});
  

  
//itemSchema.plugin(AutoIncrement, {inc_field: 'itemCode'}); //i don't think this is needed
var Items = mongoose.model('ItemsModel', itemSchema);


//must use async function and await keyword, then save to another variable with
// returns an array
module.exports.getAllItems = getAllItems = function(){
    return new Promise(function(resolve, reject){
        Items.find({}).then(function(items){
            resolve(items);
        });
    });
}

//must use async function and await keyword, then save to another variable with
//var example = JSON.parse(JSON.stringify(AWAITED_VAR NAME[0])); because it returns an array with
// only one item in it
module.exports.getItem = getItem = function(itemID) {
   return new Promise(function(resolve, reject){
    Items.findOne({itemCode: itemID}).then(function(item){
        resolve(item);
    });
});
}

module.exports.updateRating = updateRating = function(itemID, rating){
    return new Promise(function(resolve, reject){
        Items.findOne({itemCode: itemID}).then(async function(item){
            item.rating.ratingCount = item.rating.ratingCount + 1;
            item.rating.ratingTotal = item.rating.ratingTotal + rating;            
            await item.save();
            resolve(item);
        });
      });
}

//must use async function and await keyword
module.exports.getAllItemsByCategory = getAllItemsByCategory = function(brand){
    return new Promise(function(resolve, reject){
        Items.find({catalogCategory: brand}).then(function(items){
            resolve(items);
        });
    });
  }


//returns the items that the current user does not own
module.exports.getItemsNotOwnedByDB = getItemsNotOwnedByDB = async function(userID){
    let userObject = await UserDB.getUser(userID);
    let length = userObject.Items.length;
    let first, second, third;
    switch(length){
        case 1:
        first = userObject.Items[0];
        break;

        case 2:
        first = userObject.Items[0];
        second = userObject.Items[1];
        break;

        case 3:
        first = userObject.Items[0];
        second = userObject.Items[1];
        third = userObject.Items[2];
        break;

        default:
        break;
    }
   
    
    return new Promise(function(resolve, reject){
        Items.find({
            $nor: [
            {itemCode: first} ,{itemCode: second}, {itemCode: third}
        ]
    }, function(err, items){
            resolve(items);
        });
    });
}

//add item to database
module.exports.addItem = addItem = function(itemCode, itemName, yearModel, catalogCategory, description, rating, imageURL){    
    let newItem = new Items({
                itemCode: itemCode,
                itemName: itemName,
                userIDofOwner: 0,
                yearModel: yearModel,
                catalogCategory: catalogCategory,
                description:  description,
                rating: rating,
                imageURL: imageURL,
                status: "AVAILABLE"
    });
    newItem.save();
}



//add item to database by passing an item object
module.exports.addItemObject = addItemObject = function(itemObject){
    let newItem = new Items({
        itemCode: itemObject.itemCode,
        itemName: itemObject.itemName,
        userIDofOwner: itemObject.userIDofOwner,
        yearModel: itemObject.yearModel,
        catalogCategory: itemObject.catalogCategory,
        description:  itemObject.description,
        rating: itemObject.rating,
        imageURL: itemObject.imageURL,
        status: itemObject.status
    });
    newItem.save();
}


//change the status of a database item
module.exports.changeStatus = changeStatus = function(item, newStatus){
    if(typeof newStatus.valueOf() == "string"){
    var stat = newStatus.toUpperCase();    
        if(stat === "AVAILABLE" || stat === "PENDING" || stat === "SWAPPED" ){
            Items.findOneAndUpdate({itemCode: item.itemCode},
                {$set : {status: newStatus}}, function(err,data){
                    if(err){throw err;}
                    console.log("status update");
                });
            //item.status = newStatus;
        }else{console.log("Value was string but not available, pending, or swapped.");}
    }else{
        console.log("New status not set, value was not a string.");
    }
}

//counts the number of items in the Items collection
module.exports.countItems = countItems = function(){
    //this function actually returns a number when assigned to 
    // const count = await ItemDB.countItems();
    //no need to JSON parse it
    return new Promise(function(resolve, reject){
      Items.countDocuments().then(function(count){
        //console.log("Number of items in database: " + count);
          resolve(count);
      });
    });
  }


