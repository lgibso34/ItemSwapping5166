var express = require("express");
var app = express();
var bodyParser = require("body-parser"); 
var urlencodedParser = bodyParser.urlencoded({extended: false});
const { check, validationResult } = require('express-validator/check');

var ItemDB = require("./models/ItemDB");
var UserDB = require("./models/userDB");
var SwapDB = require("./models/SwapDB");
var Item = require("./models/item.js");
var User = require("./models/user");

var testing = require("./models/testing");

app.set("view engine", "ejs");

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/testDatabase', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/CarSwap', {useNewUrlParser: true});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Mongoose connected");
});

var doNothing = function(){};

app.get('/', async function(req, res, next) { 
  
  // const item = await ItemDB.getItem(2); 
  // //const test = await UserDB.getUser(1);
  // console.log(item);
  // console.log(item[0].itemCode);
  //var test;
  // ItemDB.addItem(10, "Civic Type-R", 2019, "Honda", "cool car", "*****", "none").then(function(item){
  //     data = item;
    
  //   res.render("test", {test: data});
  // });

  //var honda2 = new Item.Item("Honda Accord Sport", "Honda", "this is a Honda", "*****", "none");
  // honda2["yearModel"] = 2019;
  // honda2["itemCode"] = 11;

  // console.log(honda2);
  //ItemDB.addItemObject(honda2);
  //ItemDB.addItem(10, "Civic Type-R", 2019, "Honda", "cool car", "*****", "none");
  //const item = await ItemDB.getItem(11);
  // var item1 = await ItemDB.getItem(1);
  // var item2 = await ItemDB.getItem(2);

  // //console.log(item1);


  //  var itemArray = [item1, item2];

  
  //  var user4 = new User.User("Tom", "Hanks", "tom@tom.com", "4444 address lane","",
  //  "Harrisburg", "NC", 28075, "United States", itemArray);
  //  user4["fNameLower"] = "tom";
  //  user4["lNameLower"] = "hanks";
  //  UserDB.addUserObject(user4);
  // const count = await ItemDB.countItems();
  // console.log(count);
  // console.log(typeof count);

  
  // const user = await UserDB.getUser(1);
  // //console.log(item);
  // test = JSON.parse(JSON.stringify(user[0]));
  // var testArray = test.Items;
  // const item = await ItemDB.getItem(5); 
  // testArray.push(item[0]);
  // console.log(testArray);




  // const allUsers = await UserDB.getAllUsersTEST();
  // var userArray = JSON.parse(JSON.stringify(allUsers));
  // console.log(userArray[0].email);
  // console.log(allUsers[0].email);
  // var item1 = await ItemDB.getItem(1);
  // var item2 = await ItemDB.getItem(2);


  // var itemArray = [item1, item2];
  // UserDB.addUser("Tom", "tom", "Hanks", "hanks", "tom@tom.com", "4444 address lane","",
  //  "Harrisburg", "NC", 28075, "United States", itemArray);
  //console.log(itemArray);
  //console.log(await UserDB.getAllUsers());
// var userCarsCodes = ['2'];
//   var userCars = [];
//     var swapItems = [];


//   async function addToUserCars() {

//     for(let item of userCarsCodes){
//       console.log("item is: "+item);
//       var tempTest = await (ItemDB.getItem(parseInt(item)));
//       //console.log(tempTest);
//       await userCars.push(tempTest);
//     }
  // userCarsCodes.forEach(function(item){
  //   console.log("item is: "+item);
  //   var tempTest = await (ItemDB.getItem(parseInt(item)));
  //   //console.log(tempTest);
  //   userCars[0] = tempTest;
  //   userCars.push(tempTest);
  // });

// }
//addToUserCars();
  
// var print = function(){console.log(userCars);}

// setTimeout(print, 12);

//const item = await testing.getItem(1);
// var item = await ItemDB.getAllItems();
// var test = JSON.parse(JSON.stringify(item));
// //console.log(itemPromise);
// console.log('-------');
// //console.log(item);
// //console.log(test);
// //console.log(test);


var test;
let user = await SwapDB.test(1,'1');


//console.log(user);



  res.render("test", {test: test});



});

app.get('/signIn', function(req, res){
  res.render('login2');
});

app.post('/signIn', urlencodedParser, [
  check('email')
    .isEmail()  
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("errors = " + JSON.stringify(errors.mapped()));
  }else{
    console.log('success');
      res.render('login2');
  }
});






app.listen(3000);

