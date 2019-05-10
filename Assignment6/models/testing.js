var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//let uri = 'mongodb://testuser:test123@ds029821.mlab.com:29821/card_trade';

//mongoose.connect(uri);

//let db = mongoose.connection;

//db.on('error', console.error.bind(console, 'connection error:'));

var Item = new Schema({
  itemID:{
    type: String,
    requireD: true
  },
  itemName:{
    type:String,
    required: true
  },
  itemBio:{
    type: String,
    required: true
  },
  itemRating:{
    type: Number,
    default: 0
  },
  itemIMG:{
    type: String,
    required: true
  },
  status:{
    type: String,
    default: "available"
  },
  swapItem:{
    type: String,
    default: "none"
  },
  swapRating:{
    type: Number,
    default: 0
  },
  genRating:{
    type: Number,
    default: 0
  },
  swapperRating:{
    type: Number,
    default: 0
  },
  userID:{
    type: String,
    default: ""
  }
},
  {collection: 'Items'}
);

//------------------------------------------------------

const Items = mongoose.model('item', Item);
module.exports.Items= ItemData = Items;

//-----------------------------------------------------


module.exports.getItem = getItem = function(itemCode){
    return new Promise((resolve, reject) => {
      Items.findOne({itemCode: itemCode}).then(docs =>{
        console.log("This is inside of the getItem() function: " + docs);
        console.log('----------------------------------------------------');
        resolve(docs);

      }).catch(err => {
        console.log(err);
        return reject(err);
      })
    });
}