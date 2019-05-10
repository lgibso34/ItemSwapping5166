var mongoose = require('mongoose');


var feedbackSchema = new mongoose.Schema({
    offerID: {type: Number, required: true},
    userID1: {type: String, required: true},
    userID2: {type: String, required: true},
    rating: {type: String, required: true}
  }, {collection: 'Feedback'});
  
  
  
  var Feedback = mongoose.model('FeedbackModel', feedbackSchema);

//   this method adds a feedback that user with userID1 is giving for user with userID2.
//    Both users have completed a swap. Using the offerID we can verify and link this to an offer.
//    The corresponding database table would use the offerID and userID1 as primary keys.

 //the offerID can just be the value that the key points to for the Swap.Swaps map
  module.exports.addOfferFeedback = addOfferFeedback = function(offerID, userID1, userID2, rating){
    let newFeedback = new Feedback({
        offerID: offerID,
        userID1: userID1,
        userID2: userID2, 
        rating: rating 
    });
    newFeedback.save();
    }

    // this method adds a feedback that user with userID is giving for item with itemCode.
    //  The corresponding database table would use the userID and itemCode as primary keys.
    module.exports.addItemFeedback = addItemFeedback = function(itemCode, userID, rating ){
        let newFeedback = new Feedback({
            itemCode: itemCode,
            userID: userID,
            rating: rating 
        });    
        newFeedback.save();  
    };