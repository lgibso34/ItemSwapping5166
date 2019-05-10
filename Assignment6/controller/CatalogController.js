//setup express to use for routing
const { check, validationResult } = require('express-validator/check');

var ItemDB = require("../models/ItemDB");
var item = require("../models/item");
var _ = require("underscore");
var appJS = require('./app');
var UserDB = require("../models/userDB");

//for method="POST"
var bodyParser = require("body-parser"); 
var urlencodedParser = bodyParser.urlencoded({extended: false});


module.exports = function(app){


    app.route("/categories")
    .get([
        check('catalogCategory').optional().isIn(['Acura', 'Volvo', 'Ferrari'])
    ], async function(req, res){

    const errors = validationResult(req);
    if(!_.isEmpty(errors.array())){
        console.log("errors: " + errors.array());
    }
      if (!errors.isEmpty()) {
          console.log("catlogCategory does not match a valid category");
        return res.status(422).json({ errors: errors.array() });
      }


        if(_.isUndefined(req.session.theUser)){ 
            console.log("No user is signed in, displaying all cars.");     
        
        //grabs all cars in DB
        //var cars = ItemDB.getItems();
        //grab brand from FORM
        var brand = req.query.catalogCategory;

        //if no category is specified in the URL 
        if(_.isEmpty(req.query)){
            //res.render("categories", {cars: cars});
            //ItemDB.getAllItems(res, "categories", "cars");
            const allItems = await ItemDB.getAllItems();
            res.render("categories", {cars: allItems});
        } else if(brand){
            //return only the items with the specified category
            //var filtered = ItemDB.getItemsByCategory(brand);
            //res.render("categories", {cars: filtered});

            //ItemDB.getAllItemsByCategory(res, "categories", "cars", brand);
            const categoryItems = await ItemDB.getAllItemsByCategory(brand);
        
            res.render("categories", {cars: categoryItems});
        } else{
            res.render("404");
        }
        }else{
            
            //if a user is signed in these statements will execute
            console.log("User is signed in, displaying cars not belonging to " + req.email + ".");
            //get the items that the signed in user doesn't own, stores an array
            // var notUserCars = ItemDB.getItemsNotOwnedBy(req.session.currentProfile);
            let carsNotOwnedBy = await ItemDB.getItemsNotOwnedByDB(parseInt(req.session.theUser.userID));
            //bool is used to tell the ejs page that the user is signed in
            let bool = true;

            res.render("categories", {cars: carsNotOwnedBy, bool: bool});
            //var cars = {};
            //ItemDB.findAllItems(res, "categories", "cars", "bool");
            
            //UserDB.getAllUsers(res, "categories", "cars"); //OLD WAY IS COMMENTED OUT
            //const allUsers = await UserDB.getAllUsers();



            //res.render("categories", {cars: notUserCars, bool: bool});
        }
        
    });

    //POST IS NOT USED AT ALL ON THE CATEGORIES PAGE
    
    //used for showing categories when a user is not signed in
    //this will work when using method="POST" in the forms for sorting
    // .post(urlencodedParser, async function(req, res){
    //     //grabs all cars in DB
    //     //var cars = ItemDB.getItems();
    //     //grab brand from FORM
    //     var brand = req.body.catalogCategory;
    //     //if no category is specified in the URL 
    //     if(_.isEmpty(req.body)){
                    
    //         //res.render("categories", {cars: cars});
    //         //ItemDB.getAllItems(res, "categories", "cars"); //old way is commented out

    //         const allItems = await ItemDB.getAllItems();
    //         res.render("categories", {cars: allItems});
    //     } else{
    //         //return only the items with the specified category
    //         //var filtered = ItemDB.getItemsByCategory(brand);
    //         //res.render("categories", {cars: filtered});
    //         //ItemDB.findAllItemsByCategory(res, "categories", "cars", brand);// old DB way commented out
    //         const categoryItems = await ItemDB.getAllItemsByCategory(brand);
    //         res.render("categories", {cars: categoryItems});
    //     }
    // });




}