
var express = require("express");
var bodyParser = require("body-parser"); 
var urlencodedParser = bodyParser.urlencoded({extended: false});
var app = express();
var _ = require("underscore");
var item = require("../models/item");
var ItemDB = require("../models/ItemDB");
var UserDB = require("../models/userDB");
var SwapDB = require("../models/SwapDB");
var userItem = require("../models/userItem");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var ProfileController = require("./ProfileController");
var CatalogController = require("./CatalogController");
var signInUpController = require('./signInUpController');
const { check, validationResult } = require('express-validator/check');

// ItemDB.populate();
// userDB.populate();

//for security helmet
// https://expressjs.com/en/advanced/best-practice-security.html
var helmet = require('helmet');
app.use(helmet());
app.disable('x-powered-by'); //this code hides that the app is powered by express


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CarSwap', {useNewUrlParser: true});

var db = mongoose.connection;
mongoose.Promise = Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Mongoose connected");
});

//npm init to create json file
//npm install express -save
//npm install ejs -save
//-save saves it to the json file as a dependency

//set the view engine to render ejs files
app.set("view engine", "ejs");
app.set('views', '../views');

//when localhost:3000/css is visited where should your app look for files from the location that app.js is located? in this case the css folder inside the resources folder
app.use("/css", express.static("../resources/css"));
app.use("/javascript", express.static("../resources/javascript"));
app.use("/images", express.static("../resources/images"));

//used for sessions
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!", resave: false, saveUninitialized: false}));

//Profile controller must load first because it has the sessions and signin status
ProfileController(app); // for /profile
CatalogController(app); // for /categories
signInUpController(app); //for /signIn and /signUp

//checks whether a user is signed out. REQUEST parameter required.
var isSignedIn = function(req){
    return !_.isUndefined(req.session.theUser);
}

//gets the URL that requested the current page, just the word after the last slash
module.exports.getOriginURL = getOriginURL = function(req){
    if(_.isUndefined(req.headers.referer)){
        page = undefined;
    }else{
        //grab the text after localhost:3000/
        var page = req.headers.referer.split("/")[3];
        //if the URL has parameters, remove the parameters
        if(page.includes("?")){
            page = page.split("?")[0];
        }
    }
    return page;
}

var itemID = 0;
var itemCount;
var swapCount;
module.exports.assignSwapCounter = assignSwapCounter = async function(){
    swapCount = await SwapDB.countSwaps();
    if(swapCount == 0 && arguments[0]){
        var req = arguments[0];
        req.session.message = undefined;
    }
}

var assignItemCounter = async function(){
    itemCount = await ItemDB.countItems();
}
assignItemCounter();
assignSwapCounter();


module.exports.mySwapsMap = mySwapsMap= new Map();

module.exports.setMySwapsMap = setMySwapsMap = async function(req){
    if(isSignedIn && swapCount != 0){
        const swapItems = await SwapDB.getSwap(req.session.theUser.userID);
       
        if(swapItems == null){
            mySwapsMap = new Map();
        }else{
            mySwapsMap = swapItems.Swaps;
        }
        console.log("mySwapsMap is: ");
        console.log(mySwapsMap);
    }
}



var verify = function(req, res){
    if(_.isEmpty(req.body) && _.isEmpty(req.query)){
        itemID = req.session.code || 0;
    }else if(_.isEmpty(req.body)){
        //for method="GET"
        //if parseInt throws an error code === 0, || is an or 
        itemID = parseInt(req.query.itemCode) || 0;
    }else if(_.isEmpty(req.query)){
        //for method="POST"
        itemID = parseInt(req.body.itemCode) || 0;
    }

    if(itemID == 0){
             res.send("itemCode not found.");
    }
    
    console.log("The itemID of this item is " + itemID);
                
//    if(Number.isInteger(itemID) && itemID > 0 && itemID <= ItemDB.itemsMap.size){ 

    if(Number.isInteger(itemID) && itemID > 0 && itemID <= itemCount){ 
        return true;
    }else{
        console.log("verify function returned false");
        return false;
    }
}


var status5166 = function(newStatus){
    var itemStatus;
    switch(newStatus){
        case "AVAILABLE":
            itemStatus = "Item is available to swap."
        break;
        case "PENDING":
            itemStatus = "You have a swap offer for this item."
        break;

        case "SWAPPED":
            itemStatus = "You've already swapped this item."
        break;

        }
        return itemStatus;
}




//---------------------------------------------------------------------------------------------------------------------------























app.get("/", function(req, res){
    res.render("index");
});



app.route("/index")
.get(async function(req, res){
    if(_.isUndefined(req.session.message)){   
        res.render("index");        
    }else{
        await setMySwapsMap(req);
        res.render("index", {message: req.session.message});        
    }
});


app.get("/myItems", async function(req, res){
    if(isSignedIn(req)){
        //grabs the users cars from the database        

        let userCars = [];
        for(let item of req.session.theUser.Items){
            userCars.push(await ItemDB.getItem(item));                        
        }
        res.render("myItems", {userCars: userCars});       
    }else{ 
        res.redirect("index");
    }
});


//this code is really nasty, but i made it work
app.get("/mySwaps", async function(req, res){
    if(isSignedIn(req)){
        await setMySwapsMap(req);
        await assignSwapCounter();
        if(_.isUndefined(req.session.message) || //OR
        req.session.message !== "no action parameter, no items to display"){

            //IF THERE IS NO SESSION.MESSAGE DO THE BELOW^^^^^^^^^^^
            if(_.isEmpty(req.session.userItems) || _.isUndefined(req.session.userItems)){ //if session.userItems is empty or undefined
                if(!_.isEmpty(Array.from(mySwapsMap.values()))){ //if the mySwapsMap IS NOT EMPTY do the below, assigned near line 396
                    var userCarsCodes = Array.from(mySwapsMap.keys());  //the map keys are the user's old item(s)              
                    var swapItemsCodes = Array.from(mySwapsMap.values()); //the map values are the user's desired swap(s)
                   
                    var userCars = [];
                    var swapItems = [];

                    for(let item of userCarsCodes){
                        userCars.push(await ItemDB.getItem(parseInt(item)));                        
                    }

                    for(let item of swapItemsCodes){
                        swapItems.push(await ItemDB.getItem(parseInt(item)));
                    }                    

                console.log("top portion of mySwaps executed");
                
                let swapObject = await SwapDB.getSwap(req.session.theUser.userID);
                let initiatorID = swapObject.initiatorID;
                

                    setTimeout(function(){res.render("mySwaps", {userCars: userCars, swapItems: swapItems, initiatorID: initiatorID, userID: req.session.theUser.userID})},100); 
                }else{
                //grabs the users car items from
                //var userCars = Array.from(userMap.values());
                req.session.message = "You have not selected any items to swap.";
                console.log("session.userItems is empty: " + req.session.message);
                res.render("mySwaps", {message: req.session.message});
                }
            }else{
                if(mySwapsMap.size != 0){    
                    var userCarsCodes = Array.from(mySwapsMap.keys()); //the map keys are the user's old item(s)               
                    var swapItemsCodes = Array.from(mySwapsMap.values()); //the map values are the user's desired swap(s)
                    var userCars = [];
                    var swapItems = [];
                    
                    for(let item of userCarsCodes){
                        userCars.push(await ItemDB.getItem(parseInt(item)));
                    }


                    for(let item of swapItemsCodes){
                        swapItems.push(await ItemDB.getItem(parseInt(item)));
                    }
      
                let swapObject = await SwapDB.getSwap(req.session.theUser.userID);
                let initiatorID = swapObject.initiatorID;
                    
                    //must wait to render the page so the items can get pushed to the proper arrays
                    setTimeout(function(){res.render("mySwaps", {userCars: userCars, swapItems: swapItems, initiatorID: initiatorID, userID: req.session.theUser.userID})},100);
                }else{
                    //grabs the users car items from
                    //var userCars = Array.from(userMap.values());
                    req.session.message = "You have not selected any items to swap.";
                    console.log("mySwapsMap is empty: " + req.session.message);
                    res.render("mySwaps", {message: req.session.message}); 
                }     
            }
        
        
        
        }else{
            console.log("HELLO " + req.session.message);
            res.render("mySwaps", {message: req.session.message});        
        }

       }else{
        res.redirect("index");    
       }
});






app.get("/carhistory", function(req, res){
    if(isSignedIn(req)){
        res.render("carHistory");   
    }else{
        res.redirect("index");
    }
});

app.get("/cart", function(req, res){
    if(isSignedIn(req)){
        res.render("cart");   
    }else{    
        res.redirect("index");
    }
});



//-------where categories was----------------------------------------------------------

app.route("/rate").post( urlencodedParser,[
    check('choice').isIn(['YES', 'NO']),
    check('userID').optional().isInt()
],
    function(req, res){
        switch(req.body.choice){
            case 'YES':
            req.session.rateUserID = req.body.userID;
            res.redirect('rateUser');
            break;

            case 'NO':
            res.redirect('myItems');
            break;

            default:
            res.redirect('myItems');
        }
}
);



app.route("/rateItem").get([
    check('itemCode').isInt()
], async function(req, res){
    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log("itemCode was not an integer");
    return res.status(422).json({ errors: errors.array() });
  }

  var itemCar;
  //shows origin of request
  console.log("Origin URL: " + getOriginURL(req));
      
  if(_.isEmpty(req.query)){
      res.render("404");
  } else{        
      //validation that itemCode is between 1 and the size of the DB map
      if(verify(req, res)){
          console.log("The result of verify(req,res) is: " + verify(req,res));
          var code = parseInt(req.query.itemCode);   
          const itemPromise = await ItemDB.getItem(code);
          itemCar = JSON.parse(JSON.stringify(itemPromise));
          //console.log(itemCar);
                        
        res.render("rateItem", {car: itemCar});

          
        }else{
            res.redirect('index');
        }
    }
    
})

.post(urlencodedParser, [
    check('itemCode').isInt(),
    check('rating').isInt()
], function(req, res){
        const errors = validationResult(req);
        console.log("errors: " + errors.array());
        if (!errors.isEmpty()) {
            console.log("itemCode was not an integer");
            return res.status(422).json({ errors: errors.array() });
        }

        ItemDB.updateRating(req.body.itemCode, parseInt(req.body.rating));
        res.redirect('myItems');

});
//------------------------------------------------------------------------------------------------------
app.route("/rateUser").get( async function(req, res){
    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log("userID was not an integer");
    return res.status(422).json({ errors: errors.array() });
  }

  var user;      
       
      //validation that itemCode is between 1 and the size of the DB map
          let userID = parseInt(req.session.rateUserID);
          const userPromise = await UserDB.getUser(userID);
          user = JSON.parse(JSON.stringify(userPromise));
                        
        res.render("rateUser", {user: user});    
})

.post(urlencodedParser, [
    check('userID').isInt(),
    check('rating').isInt()
], function(req, res){
        const errors = validationResult(req);
        console.log("errors: " + errors.array());
        if (!errors.isEmpty()) {
            console.log("userID was not an integer");
            return res.status(422).json({ errors: errors.array() });
        }

        UserDB.updateRating(parseInt(req.body.userID), parseInt(req.body.rating));
        res.redirect('myItems');

});

//---------------------------------------------------------------------------------------









app.route("/item")
.get([
    check('itemCode').isInt()
], async function(req, res){

    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log("itemCode was not an integer");
    return res.status(422).json({ errors: errors.array() });
  }
    
    var itemCar;
    //shows origin of request
    //console.log("Origin URL: " + getOriginURL(req));
        
    if(_.isEmpty(req.query)){
        res.render("404");
    } else{        
        //validation that itemCode is between 1 and the size of the DB map
        if(verify(req, res)){
            console.log("The result of verify(req,res) is: " + verify(req,res));
            var code = parseInt(req.query.itemCode);   
            const testItemPromise = await ItemDB.getItem(code);
            itemCar = JSON.parse(JSON.stringify(testItemPromise));
            //console.log(itemCar);
                
            //5166 requirment for assignment 3            
            var itemStatus;  
            
            if( isSignedIn(req) && getOriginURL(req) === "categories" ){
                
                              
                var temp = itemCar.status;
                //var temp = ItemDB.getItem(code).status;
                //console.log("Car selected status is: " + temp);
                itemStatus = status5166(temp);
                //console.log("Status message sent to view is: " + itemStatus);
            }
            //this will only execute if the itemCode is out of range
            if(_.isUndefined(itemStatus)){
                //if no one is signed in or no theItem parameter display normally
                //console.log("normal item page rendered, user not signed in or not in user inventory");                
                var car = itemCar;
                //var car = ItemDB.getItem(code);               
                res.render("item", {car: car});

            }else{
           
            var car = itemCar;
            //var car = ItemDB.getItem(code);
            
            res.render("item", {car: car, itemStatus: itemStatus});
            }
        }
        else{
            res.redirect("categories");
        }
    }
})

//this will work when using method="POST" in the forms
.post(urlencodedParser,[
    check('itemCode').exists().isInt()
], async function(req, res){

    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log('itemCode was not an integer');
    return res.status(422).json({ errors: errors.array() });
  }
        var itemCar;
        
    if(_.isEmpty(req.body)){
        res.render("404");
    } else{
        //validation that itemCode is between 1 and the size of the DB map
        if(verify(req, res)){     
        var code = req.body.itemCode; 
        const testItemPromise = await ItemDB.getItem(code);
        itemCar = JSON.parse(JSON.stringify(testItemPromise));

        var car = itemCar;  
        //var car = ItemDB.getItem(parseInt(code));
        res.render("item", {car: car});
        }
        else{
            res.redirect("categories");
        }
    }
});


//variable for the car that user wants to potentially swap with
//their inventory
var swapCar;
module.exports.swapCar = swapCar;
app.route("/swap")
.get(async function(req, res){
    await setMySwapsMap(req);
    //?property1=example&property2=example
    //req.query = {property1: "example", property2: "example"}

    //shows what comes after the URL to the console
    //console.log(req.params.itemID);
    var itemCar;

    console.log("Orgin URL: " + req.headers.referer);

    if(isSignedIn(req)){
        
         //the code in the if statement below makes sure that the swap items table is correct on the /swap page        
        //  if(_.isUndefined(req.session.userItems)){
            
        //     if( _.isEmpty(Array.from(mySwapsMap.keys() ) ) ){
        //         req.session.userItems = req.session.userItemsArray; //this is from the database   
        //     }else{
        //         //console.log("keys of map array");
        //         //console.log(Array.from(mySwapsMap.keys()));
        //         req.session.userItems = req.session.userItemsArray;
        //         for(let itemCodeFromKeysArray of Array.from(mySwapsMap.keys())){
        //             req.session.userItems = req.session.userItems.filter(x => x.itemCode !== parseInt(itemCodeFromKeysArray));                    
        //         }
                
        //     }
        // }
        //-----------------------------------------------------------
           
        //var cars = ItemDB.getItems();
        if(_.isUndefined(req.session.code)){  //this is assigned in Profile Controller in the offer section          
            res.render("404");
        } else{
            
            if(verify(req, res)){
            var code = parseInt(req.session.code);
            const testItemPromise = await ItemDB.getItem(code);
            itemCar = JSON.parse(JSON.stringify(testItemPromise));

            var car = itemCar;
            //var car = ItemDB.getItem(req.session.code);
            swapCar = car;

            //5166 requirment for assignment 3            
            var itemStatus;            
            if( isSignedIn(req) ){
                var temp = itemCar.status;
                //var temp = ItemDB.getItem(code).status;
                itemStatus = status5166(temp);
            }

        let userCars = [];
        for(let item of req.session.theUser.Items){
            userCars.push(await ItemDB.getItem(item));                        
        }

        let userSwapObject = await SwapDB.getSwap(req.session.theUser.userID) || 0;
        console.log('----------------------------------');
        console.log(userSwapObject);
        console.log('----------------------------------');
        if(userSwapObject != 0){
            let carsUpForSwap = Array.from(userSwapObject.Swaps.keys()) || 0;
            carsUpForSwap.forEach(function(swapCode){
                userCars = userCars.filter(car => car.itemCode !== parseInt(swapCode)); 
            });
        }
         

            //if(_.isEmpty(req.session.userItems)){
            if(_.isEmpty(userCars)){
                var bool = true;
                res.render("swap", {car: car, bool: bool, itemStatus: itemStatus});
            }else{
                res.render("swap", {car: car, userCars: userCars, itemStatus: itemStatus});
            }

            }           
            else{                
                res.render("404");
            }
        }

    }else{
        res.redirect("index"); 
    }
})

.post(urlencodedParser,[
    check('itemCode').exists().isInt()
], async function(req, res){

    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log("itemCode was not an integer or does not exist");
    return res.status(422).json({ errors: errors.array() });
  }

    var itemCar;
    
    if(_.isEmpty(req.body)){
        console.log("req.body is empty");
        res.render("404");
    } else{
        if(verify(req, res)){
        //itemCode that is POSTed
        var code = parseInt(req.body.itemCode);
        const itemPromise = await ItemDB.getItem(code);
        itemCar = JSON.parse(JSON.stringify(itemPromise));
        //array that contains the users item that they offered the swap for

        var oldItem = itemCar; //the car in the user's inventory that they want to swap
        //var oldItem = ItemDB.getItem(code);

        //5166 requirment for assignment 3            
        var itemStatus;            
        
        //console.log(!Array.from(mySwapsMap.values()).includes(swapCar.itemCode.toString()));
        //if the item already exists
        if(   !Array.from(mySwapsMap.values()).includes(swapCar.itemCode.toString())   ){

            let temp = await ItemDB.getItem(code);
            ItemDB.changeStatus(temp, "PENDING"); //change in the database

            // req.session.userItemsArray.some(function(item){
            //     if(item.itemCode === code){
            //         //item.status = "PENDING";
            //         ItemDB.changeStatus(item, "PENDING"); //change in the database
            //         item.status = "PENDING"; //change for /myItems

            //         return true;
            //     }
            // });
            const swapPromise = await ItemDB.getItem(swapCar.itemCode);
            var swapCarItem = JSON.parse(JSON.stringify(swapPromise));

            
            ItemDB.changeStatus(swapCarItem, "PENDING");
            

            await SwapDB.addSwap(req.session.theUser.userID, swapCarItem.userIDofOwner, oldItem.itemCode, swapCarItem.itemCode,
                 swapCarItem.status, oldItem.itemCode.toString(), swapCar.itemCode.toString());

            //give some time for the addSwap to add the item
            // wait for the two async functions to complete before moving on
            await setTimeout(async function(){
                 await assignSwapCounter();
                 await setMySwapsMap(req);}
                 , 100); //give time for the swap to be added to the database

                 await setMySwapsMap(req);
            //session.userItems holds the cars that have not been swapped!!!!!!!!!!!!!!!!!!!!!!!!NOTE
            
            //this updates the user's Inventory on the /swap page after they swap one item, it will only show their other item
            // req.session.userItems = req.session.userItems.filter(x => x.itemCode !== code);        



        }else{
            var duplicate = true;
        }
        
      
        //var car = ItemDB.getItem(code);
        const swapPromise = await ItemDB.getItem(swapCar.itemCode);
        var swapCarItem = JSON.parse(JSON.stringify(swapPromise));
        var car = swapCarItem;
        //var car = ItemDB.getItem(parseInt(swapCar.itemCode));
        //console.log("Swap POST: value of car at 406: " + car);
        if( isSignedIn(req) ){            
            //var temp = ItemDB.getItem(swapCar.itemCode).status;
            var temp = car.status;
            itemStatus = status5166(temp);
        }
        // console.log(itemStatus);
        // console.log(car.status);

        let userCars = [];
        for(let item of req.session.theUser.Items){
            userCars.push(await ItemDB.getItem(item));                        
        }

        let userSwapObject = await SwapDB.getSwap(req.session.theUser.userID) || 0;
        console.log('----------------------------------');
        console.log(userSwapObject);
        console.log('----------------------------------');
        if(userSwapObject != 0){
            let carsUpForSwap = Array.from(userSwapObject.Swaps.keys()) || 0;
            carsUpForSwap.forEach(function(swapCode){
                userCars = userCars.filter(car => car.itemCode !== parseInt(swapCode)); 
            });
        }
        
        if(_.isEmpty(userCars)){
                var bool = true;
                res.render("swap", {car: car, bool: bool, itemStatus: itemStatus});
            }else{
                
                res.render("swap", {car: car, userCars: userCars, itemStatus: itemStatus,duplicate: duplicate});
            }
        }
        else{
            res.render("404");
        }
    }
});

app.get("/subscribe", function(req, res){   res.render("subscribe");   });

app.get("/about", function(req, res){   res.render("about");   });

app.get("/contact", function(req, res){  res.render("contact");   });

app.get("/404", function(req, res){   res.render("404");   });



app.listen(3000);