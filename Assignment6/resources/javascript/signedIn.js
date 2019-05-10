var signedIn = function(){
    var status = document.getElementById("status");
    var getUserStatus = true;
    var email = "sample";

    if(getUserStatus){
        status.innerHTML = "Signed in as " + email;
    }
}
