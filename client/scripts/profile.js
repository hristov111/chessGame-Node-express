import { isPasswordValid,isUsernameValid ,isEmailValid,isNameValid,isBioValid,
    isRepeatedPasswordValid,setErrorText
} from "../scripts/validation.js";


document.addEventListener("DOMContentLoaded", async () => {
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
    const oldPassword = document.querySelector('.passwordInput');
    const oldPasswordError = document.querySelector('.password-error');


    const passwordInput = document.querySelector('.repeatpasswordInput');
    const passwordError = document.querySelector('.repeat-password-error');


    // FORM 
    const formSubmit = document.querySelector('.profile-form');
    

    // const REpasswordInput = document.querySelector('.repeatpasswordInput');
    // const REpasswordError = document.querySelector('.repeat-password-error');

    // function that fetches everything about the user from database
    const fetchUserINfo = async () => {
        try {
            const user_fetch = await fetch("/api/users/me", {
                method: "GET",
                credentials: "include",
            });
            const {username} = await user_fetch.json();
            const fetch_all = await fetch(`/api/users/${username}`);
            const end_result = await fetch_all.json();
            console.log(end_result);
            sessionStorage.setItem("user",JSON.stringify(end_result));

        }catch(error){
            console.log("Error:" + error);
        }
    }
    fetchUserINfo()
    const enterFileds = () => {
        const user = fetchUserINfo();
        
    }


    
    usernameInput.addEventListener('input',() =>usernameError.innerText = isUsernameValid(usernameInput.value))

    emailInput.addEventListener('input',() => emailErorr.innerText =isEmailValid(emailInput.value))

    firstNameInput.addEventListener('input',() => firstNameError.innerText =isNameValid(firstNameInput.value))

    lastNameInput.addEventListener('input',() => lastNameError.innerText =isNameValid(lastNameInput.value))

    bioInput.addEventListener('input',() => bioError.innerText  = isBioValid(bioInput.value));

    passwordInput.addEventListener('input',() => passwordError.innerText =isPasswordValid(passwordInput.value))

    formSubmit.addEventListener('submit',async () => {

    })

    const checkPassword = async (password) => {
        try{
            const response1 = await fetch("/api/users/me", {
                method:"GET",
                credentials:'include'
            });
            const {username} = await response1.json();
            const response2 = await fetch('/api/users/verifypassword', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username,password})
            });
            console.log(await response.json());
            return;
            const data = await response.json();
            if(response.status === 404){
                // username already in use
                setErrorText("❌ Username not valid, something went wrong",oldPasswordError);
                
            }else if (response.status === 200){
                // username is created
                setErrorText("✅ Password updated successfully",oldPasswordError);
                // now i need to redirect him to the main page here

            }else if(response.status === 401){
                // something went wrong;
                setErrorText("❌ Wrong password",oldPasswordError);

            }

        }catch(error){
            setErrorText(`❌ Problem with the server. Please reload tge page: Error is ${error}`, oldPasswordError);

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