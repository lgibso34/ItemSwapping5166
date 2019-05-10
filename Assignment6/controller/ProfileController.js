//setup express to use for routing
var express = require("express");
var router = express.Router();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var ItemDB = require("../models/ItemDB");
var User = require("../models/user");
var UserDB = require("../models/userDB");
var _ = require("underscore");
var UserItem = require("../models/userItem");
var appController = require("./app");
var SwapDB = require("../models/SwapDB");
const { check, validationResult } = require('express-validator/check');



//for method="POST"
var bodyParser = require("body-parser"); 
var urlencodedParser = bodyParser.urlencoded({extended: false});

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

//checks whether a user is signed out. REQUEST parameter required.
var isSignedIn = function(req){
    return !_.isUndefined(req.session.theUser);
}


//verifies item codes
var code = 0;
var userItem;
var SwapUserItem; //used for swap offer
var itemCount;
var assignUserItem = async function(req){
    code = parseInt(req.query.theItem) || 0;
    // const testItemPromise = await ItemDB.getItem(code);
    // userItem = JSON.parse(JSON.stringify(testItemPromise));
    userItem = await ItemDB.getItem(code);
    console.log(userItem);
    console.log(code);
}
var assignItemCounter = async function(){
    itemCount = await ItemDB.countItems();
}
assignItemCounter();

var verify = function(req, res){
    //if parseInt throws an error code === 0, || is an or 
    //code = parseInt(req.query.theItem) || 0;
    
    //userItem = ItemDB.getItem(code);
    //used for a swapOffer
    //SwapUserItem = new UserItem.UserItem(userItem.itemCode);
    if(code == 0){
             res.send("Item Code not found.");
        }
                
    if(Number.isInteger(code) && code > 0 && code <= itemCount){ 
        return true;
    }else{
        console.log("verify function returned false");
        return false;
    }
}





//export of this whole file. Pass the app as a parameter
module.exports = function(app){




//middleware for sign in status
router.use(function(req, res, next){
    var userEmail = "";
    if(_.isUndefined(req.session.theUser)){
        userEmail = "Not signed in."
    }else{
        userEmail = req.session.theUser.username;
    }   
     
    //console.log("THIS IS SOME MIDDLEWARE SENT TO EACH PAGE....");

    //saves the email to req.email and sends all pages without needing to pass it
    // in res.render as an object
    req.email = userEmail;
    res.locals.email = req.email;
   

    if(!_.isUndefined(req.session.theUser)){
        req.itemCount = req.session.theUser.Items.length;
        res.locals.itemCount = req.itemCount;
        //console.log(req.session.theUser.Items.length);
        console.log(res.locals.email + "'s item count: " + res.locals.itemCount);
    }

    
    next();
});

// activate middleware
app.use("/", router);






//-------------------------------------------------------------------------------------------------------------------------------------------------------------------

//this variable is global so the profileItems can be passed if /profile is accessed more than once
// per session
var profileItems;
var currentProfile;
app.route("/profile")
.get([
    check('action').isIn(['update', 'accept', 'reject', 'withdraw', 'offer', 'delete']),
    check('theItem').isInt(),
    check('withdrawItem').optional().isInt(),
    check('decline').optional().isIn(['decline'])
],async function(req, res){
    
    var itemCar;
    req.session.message = undefined;
       
    // check if a user is signed in
    if(isSignedIn(req)){



        if(_.isUndefined(req.query.action)){
            
            req.session.message = "no action parameter, no items to display";
                        
            console.log("action was not defined, displaying message too");
            // after signing in go to localhost:3000/profile
            res.redirect("mySwaps");
            
        }else{
        //save the action value if it is defined
        var action = req.query.action;     

        //if a user is signed in do look for the parameter "action" and handle
        // it accordingly. otherwise the default case occurs. Also check that
        // theItem is a parameter and is defined.
        if(!_.isUndefined(req.query.theItem)){
        userItem = await ItemDB.getItem(req.query.theItem);
        code = parseInt(req.query.theItem) || 0;
        // console.log('userItem = ');
        // console.log(userItem);           
            let withdrawItem; //used for withdraw and DELETE
            switch(action){
                case "update":
                
                //shows origin of request
                console.log("origin request was from: " + getOriginURL(req));
                //if the origin URL is mySwaps then the item passed must be
                // a candidate for the rest of the function, and belongs to the user
                if(getOriginURL(req) === "myItems"){

                        if(verify(req, res)){  
                            //console.log(userItem);
                            //mySwaps.ejs is the user items page
                            //myItems.ejs is the PROFILE view
                            //userItem is a global vairable used in the verify function
                            if(userItem.status === "PENDING"){
                                //to allow the user to accept/reject/withdraw)
                                res.redirect("mySwaps");
                            }else if(userItem.status === "AVAILABLE" || userItem.status === "SWAPPED"){
                                res.render("swap", {car: userItem, userCars: profileItems});
                            }else
                            {
                                // dispatch to the profile view if the item does not validate
                                // or does not exist in the user's items
                                res.redirect("myItems");
                            }
                        }
                }

                break;



                //trying to use fall through to my benefit  
                case "accept":   
                //http://localhost:3000/profile?theItem=1&action=accept             
                case "reject":                
                case "withdraw":
                if(getOriginURL(req) === "mySwaps"){
                    
                    
                    var acceptedItem;//needs to be declared out her for use with action === "accept"
                        if(verify(req, res)){  
                            if(action === "withdraw" || action === "reject"){
                                //userItem.changeStatus("AVAILABLE");
                                ItemDB.changeStatus(userItem, "AVAILABLE"); //database
                                
                                //userItem = await ItemDB.getItem(code); //don't think i need this
                              
                                //delete the item from the session which would store
                                // swap offers



                                if(action === "withdraw"){

                                    withdrawItem = await ItemDB.getItem(req.query.withdrawItem); //grab the item that the offer was FOR
                                    var ownedItem = await ItemDB.getItem(code); //grabs the item under the header "Your Vehicle"
                                    
                                    if(req.query.decline){ //if a user is declining
                                        SwapDB.deleteFromExisting(withdrawItem.userIDofOwner, withdrawItem.itemCode.toString());
                                    }else{
                                        SwapDB.deleteFromExisting(req.session.theUser.userID, code.toString()); //deletes swap from swap database
                                    }
                                    
                                    //SwapDB.deleteFromExisting(withdrawItem.userIDofOwner, withdrawItem.itemCode.toString()); //deletes swap from swap database
                                    


                                    //req.session.userItems.push(ItemDB.getItem(code));
                                    //this needs to happen for /swap to show the correct amount of items for swap in the user inventory

                                    ItemDB.changeStatus(ownedItem, "AVAILABLE"); //set status for ownedItem back to available in the database
                                    
                                    // req.session.userItemsArray.some(function(item){
                                    //     if(item.itemCode === code || item.itemCode === parseInt(withdrawItem.itemCode)){
                                    //         //item.status = "PENDING";
                                    //         //ItemDB.changeStatus(item, "AVAILABLE"); //change in the database
                                    //         item.status = "AVAILABLE"; //change for /myItems                        
                                    //         return true;
                                    //     }
                                    // });
                                    ItemDB.changeStatus(withdrawItem, "AVAILABLE"); //set status for withdrawItem back to available

                                    ownedItem = await ItemDB.getItem(code); //grabs the item under the header "Your Vehicle"
                                    //req.session.userItems.push(ownedItem);

                                    await appController.setMySwapsMap(req); //set the mySwapsMap variable in app.js
                                    await appController.assignSwapCounter(req); //sets the swapCounter variable in app.js
                                }
                            }else{
                                //for action="accept"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                
                                //ItemDB.changeStatus(userItem, "SWAPPED"); //database
                                //userItem = await ItemDB.getItem(code);
                                console.log("action was accept!!!!!!!!!!");
                                
                                
                          
                               acceptedItem = await ItemDB.getItem(req.query.withdrawItem); //grab the item that the offer was FOR
                               var ownedItem = await ItemDB.getItem(code); //grabs the item under the header "Your Vehicle"
                               
                               await SwapDB.deleteFromExisting(req.session.theUser.userID, code.toString()); //deletes swap from swap database
                               
                               //SwapDB.deleteFromExisting(acceptedItem.userIDofOwner, acceptedItem.itemCode.toString()); //deletes swap from swap database
                               await appController.setMySwapsMap(req); //set the mySwapsMap variable in app.js
                               await appController.assignSwapCounter(req); //sets the swapCounter variable in app.js

                               await UserDB.removeUserItem(req.session.theUser.userID, code);
                               await UserDB.removeUserItem(acceptedItem.userIDofOwner, acceptedItem.itemCode);
                                
                               await UserDB.addUserItem(req.session.theUser.userID, acceptedItem.itemCode);
                               await UserDB.addUserItem(acceptedItem.userIDofOwner, code);


                               ItemDB.changeStatus(ownedItem, "AVAILABLE"); //set status for ownedItem back to available in the database
                                    
                               ItemDB.changeStatus(acceptedItem, "AVAILABLE"); //set status for acceptedItem back to available

                               ownedItem = await ItemDB.getItem(code); //grabs the item under the header "Your Vehicle"
                               //req.session.userItems.push(ownedItem); //used on POST of /swap


                            let user1 = await UserDB.getUser(req.session.theUser.userID);
                            req.session.theUser = user1;
                            
                            var carsOfUser = [];
                            for(let item of user1.Items){
                                carsOfUser.push(await ItemDB.getItem(item));                        
                            }
                            
                            currentProfile.userItemsArray = carsOfUser;

                            currentProfile = carsOfUser; // users saved items
                            req.session.userItemsArray = profileItems = currentProfile;

                        
                            // var check = await SwapDB.getSwap(user1.userID);
                            // if(check){
                            //     req.session.userItems = req.session.userItemsArray;
                            //     for(let swapCode of Array.from(check.Swaps.keys()) ){
                            //         req.session.userItems = req.session.userItems.filter(x => x.itemCode !== parseInt(swapCode));
                            //     }
                            // }else{
                            //     req.session.userItems = undefined; //used in app.js  /swap POST
                            // }


//-----------------------------------------------------------------------------------------------

                            }// end of the else for "accept"                            

                            //update the session array
                        
                            req.session.userItemsArray = currentProfile;

                             if(action === "accept"){
                                 
                                let user = await UserDB.getUser(acceptedItem.userIDofOwner);
                                res.render('rateUserQuestion', {user: user});
                             }else{
                                res.redirect("myItems");             
                             }
                        }else{
                            res.redirect("myItems");
                        }
                }else{
                    //when the originURL is not mySwaps
                    res.redirect("index");
                }
                break;



                case "offer":

                // THIS CODE IS TRULY HANDLED IN /swap POST 
                // THE BELOW IS NEVER RAN
                
                //offer action should come from the swap.ejs or item.ejs
                if(verify(req, res)){
                    var availableItems = [];
                    //profileItems.array.forEach(function(item){
                    profileItems.forEach(function(item){//CHANGE THIS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        if(item.status === "AVAILABLE"){
                            availableItems.push(item);
                        }                        
                    });
                    req.session.code = parseInt(req.query.theItem);
                    if(_.isEmpty(availableItems)){
                        req.session.message = "Sorry, you do not have any available items for swapping."
                        + " Please add more items to start swapping again!";
                        // const testItemPromise = await ItemDB.getItem(code);
                        // itemCar = JSON.parse(JSON.stringify(testItemPromise));
                        itemCar = await ItemDB.getItem(code);
                        var car = itemCar;
                        //var car = ItemDB.getItem(parseInt(req.query.theItem));
                        
                        res.render("item", {car: car, message: req.session.message});
                    }else{
                        res.redirect("swap");
                       //res.render("swap", {car: userItem, userCars: profileItems})
                    }
                }
                break;



                case "delete":
                // deletes theItem from the usersItems and then saves the new
                // profile to the session
                //http://localhost:3000/profile?theItem=9&action=delete
                if(verify(req, res)){
                    //removes the item and returns the array not containing that item
                    //var newProfileArray = currentProfile.removeUserItem(userItem);
                    let usr = req.session.theUser;
                    let codeOfItem = parseInt(req.query.theItem);
                    var newProfileArray = await UserDB.removeUserItem(usr.userID, codeOfItem);
                    SwapDB.deleteFromExisting(req.session.theUser.userID, codeOfItem.toString()); //deletes swap from swap database


                    var ownedItem = await ItemDB.getItem(code); //grabs the item under the header "Your Vehicle"
                    ItemDB.changeStatus(ownedItem, "AVAILABLE"); //set status for ownedItem back to available in the database

                               
                    //SwapDB.deleteFromExisting(withdrawItem.userIDofOwner, withdrawItem.itemCode.toString()); //deletes swap from swap database
                              

                    let carsOfUser = [];
                    for(let item of newProfileArray){
                        carsOfUser.push(await ItemDB.getItem(item));                        
                    }

                    
                    
                    currentProfile.userItemsArray = carsOfUser;
                    req.session.userItemsArray = currentProfile.userItemsArray;

                    let updatedUser = await UserDB.getUser(usr.userID);
                    req.session.theUser = updatedUser;

                    await appController.setMySwapsMap(req); //set the mySwapsMap variable in app.js
                    await appController.assignSwapCounter(req); //sets the swapCounter variable in app.js
                    
                    res.redirect("myItems"); 
                }else{
                    res.redirect("myItems");
                }
                break;

                default:
                //if no case matches just show the profile view
                //make a profile.ejs page????
                res.redirect("myItems");
            }           
            
        }else{
            //when the user is signed in and action parameter exits but not theItem parameter
            console.log("no theItem paramter");
            res.send("no theItem parameter");
        }
    }
}else{
    console.log("If you are not signed in, you can't access /profile");
    res.redirect("index");
}
        
    
})

//METHOD="POST"
.post(urlencodedParser, [
    check('action').isIn(['signin']),
    check('username').isEmail().normalizeEmail(),
    //shouldnt really need to escape the line below because when a user signs up
    // the password should not be allowed to contain certain characters like:
    // <, >, &, ', ", and /
    //I HAVE NOT IMPLEMENTED THIS BECAUSE WE HAVE YET TO CREATE THE SIGNUP PAGE 
    check('pass').isLength({min: 3}).escape()
], async function(req, res){

    const errors = validationResult(req);
    if(!_.isEmpty(errors.array())){
        console.log("errors: " + errors.array());
    }

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  

    //console.log("Entered the POST of profileController.");

    if(_.isUndefined(req.body.action)){

        res.send("no action paramter, no items to display");
    }else{       
        var action = req.body.action;     
        
        //get user or NULL
        const user1 = await UserDB.getUserByLogin(req.body.username, req.body.pass);


        //if no user is signed in pick the first user in your DB
        //SETS ALL SESSION VARIABLES!!!!!!!!!!!!!!!
        if( !isSignedIn(req) && action == "signin"){

            if(user1){

            //if the user name is not null!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if(user1){
                    var carsOfUser = [];
                    for(let item of user1.Items){
                        carsOfUser.push(await ItemDB.getItem(item));                        
                    }

                    currentProfile = carsOfUser; // users saved items
                    req.session.theUser = user1;  //used in app.js
                    // req.session.userItemsArray = profileItems = currentProfile.userItemsArray;
                    req.session.userItemsArray = profileItems = currentProfile;


                
                    //var check = await SwapDB.getSwap(user1.userID);
                    // if(check){
                    //     req.session.userItems = req.session.userItemsArray;
                    //     for(let swapCode of Array.from(check.Swaps.keys()) ){
                    //         req.session.userItems = req.session.userItems.filter(x => x.itemCode !== parseInt(swapCode));
                    //     }
                    // }else{
                    //     req.session.userItems = undefined; //used in app.js  
                    // }

                    req.session.message = "You have signed in.";
                    //req.session.itemsUpForSwap = []; //don't think I ever used this?????????????
                    console.log("Sign in success.");
                
                    
                    res.redirect("myItems");    
            }else{
                console.log("line 446");
                req.session.message = "***Username or password incorrect***";
                res.redirect('login');
            }

            }else{//if no username or password is entered
                console.log("line 452");
                req.session.message = "***Username or password incorrect***";
                res.redirect('login')
            }
        }
    }




});

//SIGN OUT action
app.post('/signOut', urlencodedParser,[
    check('action').exists().isIn(['signout'])
], function(req, res){

    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log('action was not signout');
    return res.status(422).json({ errors: errors.array() });
  }

    //save the action value if it is defined
    var action = req.body.action;  
    console.log(action);
    
    if( isSignedIn(req) && action == "signout"){
        
        req.session.destroy();
        res.redirect("index");
    }else{
        res.render('404');
    }
});





//add item to inventory action
app.post('/addItem', urlencodedParser,[
    check('theItem').isInt(),
    check('action').isIn(['add'])
], async function(req, res){

    const errors = validationResult(req);
    console.log("errors: " + errors.array());
  if (!errors.isEmpty()) {
      console.log('theItem was not an integer');
    return res.status(422).json({ errors: errors.array() });
  }

    //save the action value if it is defined
    var action = req.body.action;  
    //console.log(action);
    
    if( isSignedIn(req) && action == "add"){
        let usr = req.session.theUser;
        let codeOfItem = parseInt(req.body.theItem);
       
       let newProfileArray = await addUserItem(usr.userID, codeOfItem);

       console.log(newProfileArray);

        let carsOfUser = [];
        for(let item of newProfileArray){
            carsOfUser.push(await ItemDB.getItem(item));                        
        }

        currentProfile.userItemsArray = carsOfUser;
        req.session.userItemsArray = req.session.userItems = currentProfile.userItemsArray;

        let updatedUser = await UserDB.getUser(usr.userID);
        req.session.theUser = updatedUser;
        res.redirect("myItems");
    }else{
        res.render('404');
    }
});


}//end of module exports
