var getUserStatus;

// window.onload = function(){ 
//     document.getElementById("submit").addEventListener("click", matching);    
// }

$(document).ready(function(){
    matching();
});

var matching = function(){
    // var pass1 = document.getElementById("pass");
    // var pass2 = document.getElementById("passConfirm");

    $('#submitSignUp').click(function(){
        // if($('#pass').val() !== $('#passConfirm').val() && $('#pass').val() !== ""){
        //     alert("Passwords don't match!");
        // }else{
            console.log('form should be submitting');
            $('#signUpForm').submit();
        //} 
    });
    

    // if(pass1.value != pass2.value){
    //     alert("Passwords don't match!");
    // }
}