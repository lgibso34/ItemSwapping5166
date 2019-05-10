var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


var offerSchema = new mongoose.Schema({
    offerID: {type: Number},
    userID: {type: Number, required: true},
    itemCodeOwn: {type: String, required: true},
    itemCodeWant: {type: String, required: true},
    itemStatus: {type: String, required: true}
  }, {collection: 'Offers'});
  
  
  offerSchema.plugin(AutoIncrement, {inc_field: 'offerID'});
  var Offer = mongoose.model('OffersModel', offerSchema);


  module.exports.addOffer = addOffer = function(userID, itemCodeOwn, itemCodeWant, itemStatus){


    let newOffer = new Offer({
        offerID: offerID,
        userID: userID,
        itemCodeOwn: itemCodeOwn,
        itemCodeWant: itemCodeWant,
        itemStatus: itemStatus
        });
        newOffer.save();
        console.log("Offer ADDED: " + data); 
}



    module.exports.updateOffer = updateOffer = function(offerID, itemStatus){
        Offer.findOneAndUpdate({offerID: offerID},
            {$set: {itemStatus: itemStatus}},
        function(err, data){
            if(err){throw err;}
   
         console.log("Offer ADDED: " + data);       
        
        });
    };