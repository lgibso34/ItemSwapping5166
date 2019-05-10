var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var swapSchema = new mongoose.Schema({
    offerID: {type: Number},
    userID: {type: Number, required: true},
    initiatorID: {type: Number, required: true},
    userIDofOwner: {type: Number, required: true},
    itemCodeOwn: {type: String, required: true},
    itemCodeWant: {type: String, required: true},
    itemStatus: {type: String, required: true},
    Swaps: {type: Map}
  }, {collection: 'Swaps'});

  swapSchema.plugin(AutoIncrement, {inc_field: 'offerID'});
  
  
  var Swaps = mongoose.model('SwapsModel', swapSchema);


  //oldItemCode and swapCarCode MUST BE STRINGS!! Mongoose maps only allow for keys to be strings
  module.exports.addSwap = addSwap = async function(userID, userIDofOwner, itemCodeOwn, itemCodeWant, itemStatus, oldItemCode, swapCarCode){
    var userSwap = await getSwap(userID); 
    if(userSwap){
        console.log("Signed in user already has some items for swap, adding to their Swaps map under thier User.");
        addtoExisting(userID, oldItemCode, swapCarCode);
        addtoExisting(userIDofOwner, swapCarCode, oldItemCode);
    }else{

        let userSwap = new Swaps({
            userID: userID,
            initiatorID: userID,
            userIDofOwner: userIDofOwner,
            itemCodeOwn: itemCodeOwn,
            itemCodeWant: itemCodeWant,
            itemStatus: itemStatus,
            Swaps: {}
    
            });
    
            
        let otherUserSwap = new Swaps({
            userID: userIDofOwner,
            initiatorID: userID,
            userIDofOwner: userID,
            itemCodeOwn: itemCodeWant,
            itemCodeWant: itemCodeOwn,
            itemStatus: itemStatus,
            Swaps: {}
    
            });
    
            userSwap.Swaps.set(oldItemCode, swapCarCode); 
            otherUserSwap.Swaps.set(swapCarCode, oldItemCode);

            userSwap.save();
            otherUserSwap.save();
    }
}

//must use async function and await keyword
module.exports.getAllSwaps = getAllSwaps = function(){
    return new Promise(function(resolve, reject){
      Swaps.find({}).then(function(docs){
          resolve(docs);
      });
    });
  }

//must use async function and await keyword
module.exports.getSwap = getSwap = function(ID){
    return new Promise(function(resolve, reject){
        Swaps.findOne({userID: ID}).then(function(docs){
            resolve(docs);
        });
    });
}
  

//this function actually returns a number when assigned to 
// const count = await ItemDB.countItems();
//no need to JSON parse it
module.exports.countSwaps = countSwaps = function(){    
    return new Promise(function(resolve, reject){
      Swaps.countDocuments().then(function(count){
        console.log("Number of users with swaps in swaps collection: " + count);
          resolve(count);
      });
    });
  };


// adds a new item to an existing swap document, Swaps is a map for each swap document
// this "sets" a new item to the map
module.exports.addToExisting = addtoExisting = function(ID, oldItemCode, swapCarCode){
    return new Promise(function(resolve, reject){
        Swaps.findOne({userID: ID}).then(async function(docs){
            docs.Swaps.set(oldItemCode, swapCarCode);
            await docs.save();
            resolve(docs);
        });
    });
}


// deletes an item from an existing swap document, Swaps is a map for each swap document
// this "deletes" an item from the map
// module.exports.deleteFromExisting = deleteFromExisting = function(ID, ownedItemCode){
//     return new Promise(function(resolve, reject){
//         Swaps.findOne({userID: ID}).then(async function(docs){
//             docs.Swaps.delete(ownedItemCode);
            
//             if(docs.Swaps.size == 0){
//                 docs.remove();
//             }else{
//                 await docs.save();
//                 resolve(docs);
//             }
//         });
//     });
// }


// deletes an item from an existing swap document, Swaps is a map for each swap document
// this "deletes" an item from the map
//deletes both swap objects from the database if needed
module.exports.deleteFromExisting = deleteFromExisting = function(ID, ownedItemCode){
    return new Promise(function(resolve, reject){
        Swaps.find({initiatorID: ID}).then(async function(docs){
            
            docs.forEach(async function(swap){
                
                if(swap.Swaps.get(ownedItemCode)){ //if the key exists in the map
                    swap.Swaps.delete(ownedItemCode); //delete the entry
                }else{
                    //if the ownedItemCode is not a key, check the values
                    let temp = Array.from(swap.Swaps.keys()); //store keys

                    temp.forEach(function(key){
                        if(swap.Swaps.get(key) == ownedItemCode){ //if the value is equal to ownedItemCode
                            swap.Swaps.delete(key);//delete the entry
                        }else{
                            console.log("value not found in another swap");
                        }
                    });
                }

                if(swap.Swaps.size == 0){ //if the size of the Map is zero remove the swap from the DB
                    swap.remove();
                }else{
                    await swap.save();//otherwise save the new swap to the DB                    
                }
            });
            resolve(docs);           
        });
    });
}
