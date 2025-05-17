import { isPasswordValid,isUsernameValid ,isEmailValid,isNameValid,isBioValid,
    isRepeatedPasswordValid,setErrorText
} from "./utils/validation.js";

import { extractAndSet, fetchUserINfo,greetUser} from "./utils/utils.js";


document.addEventListener("DOMContentLoaded",() => {

    extractAndSet(document.querySelector('.navbar'),"../pages/partials/nav.html",() => {
        const greeting = document.querySelector('.greeting');
        console.log(greeting)
        greetUser(greeting);
    });
    extractAndSet(document.querySelector('.footer'),"../pages/partials/footer.html");

    const changebtn = document.querySelector('.btn.primary');
    const deletebtn = document.querySelector('.btn.secondary');
    const avatarInput = document.querySelector('#avatarInput');
    const avatarImg = document.querySelector('.player-image');

    //username
    const usernameInput = document.querySelector('.usernameInput');
    const usernameError = document.querySelector('.username-error');

    // email
    const emailInput = document.querySelector('.emailInput');
    const emailErorr = document.querySelector('.email-error');

    // FIRSTNAME/lastName
    const firstNameInput = document.querySelector('.firstnameInput');
    const firstNameError = document.querySelector('.firstname-error');

    const lastNameInput = document.querySelector('.lastnameInput');
    const lastNameError = document.querySelector('.lastname-error');

    // Bio
    const bioInput = document.querySelector('.bioInput');
    const bioError = document.querySelector('.bio-error');

    // PASSWORD
    const oldPasswordInput = document.querySelector('.passwordInput');
    const oldPasswordError = document.querySelector('.password-error');


    const passwordInput = document.querySelector('.repeatpasswordInput');
    const passwordError = document.querySelector('.repeat-password-error');


    // FORM 
    const formSubmit = document.querySelector('.profile-form');

    const greeting = document.querySelector('navbar #greeting');
    console.log(greeting);

    // const REpasswordInput = document.querySelector('.repeatpasswordInput');
    // const REpasswordError = document.querySelector('.repeat-password-error');

    // function that fetches everything about the user from database
  
    // fetchUserINfo();
    const enterFields = async () => {
        const user = await fetchUserINfo();
        console.log(user);
        avatarImg.src = user.others.profile_picture;

        usernameInput.value = user.others.username;    
        emailInput.value = user.others.email;
        firstNameInput.value = user.others.firstname;
        lastNameInput.value = user.others.lastname;
        bioInput.value = user.others.biography;


    }
    greetUser(greeting);
    enterFields(); 

    // i need a function where i check if there are any mistakes

    passwordError.innerText.split("\n").find(el => el.startsWith("❌"));

    const checkFields = () => {
        if(usernameError.innerText.startsWith("❌") || emailErorr.innerText.startsWith("❌") 
            || firstNameError.innerText.startsWith("❌") || lastNameError.innerText.startsWith("❌") | bioError.innerText.startsWith("❌")
        || passwordError.innerText.split("\n").find(el => el.startsWith("❌"))) return false;
        else return true;
    }

    
    usernameInput.addEventListener('input',() =>usernameError.innerText = isUsernameValid(usernameInput.value));

    emailInput.addEventListener('input',() => emailErorr.innerText =isEmailValid(emailInput.value));

    firstNameInput.addEventListener('input',() => firstNameError.innerText =isNameValid(firstNameInput.value));

    lastNameInput.addEventListener('input',() => lastNameError.innerText =isNameValid(lastNameInput.value));

    bioInput.addEventListener('input',() => bioError.innerText  = isBioValid(bioInput.value));

    passwordInput.addEventListener('input',() => passwordError.innerText =isPasswordValid(passwordInput.value));

    formSubmit.addEventListener('submit',async (e) => {
        e.preventDefault();
        console.log("submitted");
        if(!checkFields()) return;

        const username = usernameInput.value.trim();
        const firstName  = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const bio = bioInput.value.trim();
        const oldpassword = oldPasswordInput.value;
        const newPassword =  passwordInput.value;
        let usr = JSON.parse(sessionStorage.getItem('user'));
        console.log(usr);
        let toUpgrade = {};
        if(usr.others.username != username && username != '') toUpgrade.username = username;
        if(usr.others.firstname != firstName && firstName != '') toUpgrade.firstname = firstName;
        if(usr.others.lastname != lastName && lastName != '') toUpgrade.lastname = lastName;
        if(usr.others.email != email && email != '') toUpgrade.email = email;
        if(usr.others.biography != bio && bio != '') toUpgrade.biography = bio;
        console.log(toUpgrade);
        if(Object.keys(toUpgrade).length !== 0) {
            const res = await updateProfile(usr.others.username,toUpgrade);
            // update sessionStorage
            if(res){
                Object.assign(usr.others,toUpgrade);
                sessionStorage.setItem("user", JSON.stringify(usr));
            }
        }

        if(oldpassword && newPassword)await updatePassword();
        
    })



    const updatePassword = async () => {
        try{
            // thi will be an object
           let usr = await fetchUserINfo();
           usr = usr.others.username;
           const newPassword = passwordInput.value;
           const oldPassword = oldPasswordInput.value 
           console.log(usr,newPassword,oldPassword);
            // here we update the password
            const response2 = await fetch('/api/users/verifypassword', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({usr,newPassword,oldPassword})
            });
            const data = await response2.json();
            console.log(data);
            if(response2.status === 404){
                // username already in use
                setErrorText("❌ Wrong password",oldPasswordError);
                
            }else if (response2.status === 200){
                // username is created
                setErrorText("✅ Password updated successfully",oldPasswordError);
                // now i need to redirect him to the main page here

            }else if(response2.status === 401){
                // something went wrong;
                setErrorText("❌ Wrong password",oldPasswordError);

            }else if(response2.status === 500){
                setErrorText("❌ Server error, please try again",oldPasswordError);
            }

        }catch(error){
            setErrorText(`❌ Problem with the server. Please reload tge page: Error is ${error}`, oldPasswordError);

        }
    }


    const updateProfile = async (username,upgrade_list) => {
        // const usr = await getUsername();
        // we 
        const res = await fetch("/api/users/updateprofile", {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({usr:username,...upgrade_list})
        })
        const data = await res.json();
        if(res.ok){
            console.log("Update successfull", data);
            return true;
        }else {
            console.log("Error updating profile:",data.msg);
            return false;
        }
    }

    


    changebtn.addEventListener("click", () => {
       avatarInput.click() // simulate clicjk of hidden input
    })


    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if(!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => {
            avatarImg.src = reader.result;
        };
        reader.readAsDataURL(file);

    });


    deletebtn.addEventListener("click", () => {
        avatarImg.src = "../../../images/line.png";
        avatarInput.value = ""; // clear the input value;
    })
})