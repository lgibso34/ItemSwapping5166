var _ = require("underscore");

var testMap = new Map();
testMap.set(1, "hola");

//console.log(Array.from(testMap.values()).includes("hola"));

var arr = [1,2,3,4,5,6,7,8,9];

var testFunction = function(){
    //do things
    console.log(Array.from(arguments).slice(3,arguments.length));
    //console.log(arguments.slice(3,-1));
}

//console.log(arr.slice(3,-1));

testFunction(1,2,3,4,5,6,7,8,9);





var arr2 = [9,2];

console.log(arr2.filter(item => item != 2));



