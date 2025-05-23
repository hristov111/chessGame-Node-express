import {
    isPasswordValid, isUsernameValid, isEmailValid, isNameValid, isBioValid,
    isRepeatedPasswordValid, setErrorText
} from "./utils/validation.js";

import { extractAndSet, fetchUserINfo, greetUser, getPlayerById } from "./utils/utils.js";
import { navigate ,initializeSocket} from "./router.js";
import { pageAuthentication } from "./utils/utils.js";


(async () => {

    const user = await pageAuthentication('profile');
    const actualUser = JSON.parse(localStorage.getItem('guestUser'));
    if(actualUser)initializeSocket(actualUser.value.id);
    // redirect to login
    if(user === 'nouser'){
        navigate('login');
    }

    const changebtn = document.querySelector('.btn.primary');
    const deletebtn = document.querySelector('.btn.secondary');
    const avatarInput = document.querySelector('#avatarInput');
    const avatarImg = document.querySelector('.player-image');

    //username
    const usernameInput = document.querySelector('.usernameInput');
    const usernameError = document.querySelector('.username-error');
    let ISusername = true;

    // email
    const emailInput = document.querySelector('.emailInput');
    const emailErorr = document.querySelector('.email-error');
    let ISemail = true;

    // FIRSTNAME/lastName
    const firstNameInput = document.querySelector('.firstnameInput');
    const firstNameError = document.querySelector('.firstname-error');
    let ISfirstname = true;

    const lastNameInput = document.querySelector('.lastnameInput');
    const lastNameError = document.querySelector('.lastname-error');
    let ISlastname = true;

    // Bio
    const bioInput = document.querySelector('.bioInput');
    const bioError = document.querySelector('.bio-error');
    let ISbio = true;

    // PASSWORD
    const oldPasswordInput = document.querySelector('.passwordInput');
    const oldPasswordError = document.querySelector('.password-error');


    const passwordInput = document.querySelector('.repeatpasswordInput');
    const passwordError = document.querySelector('.repeat-password-error');

    let ISpassword = true;


    const rank = document.querySelector('.rank-number');

    const text_rank = document.querySelector('.rank-text');


    // FORM 
    const formSubmit = document.querySelector('.profile-form');

    const greeting = document.querySelector('navbar #greeting');
    console.log(greeting);

    // const REpasswordInput = document.querySelector('.repeatpasswordInput');
    // const REpasswordError = document.querySelector('.repeat-password-error');

    // function that fetches everything about the user from database

    // fetchUserINfo();
    const enterFields = async () => {
        let user
        if (!localStorage.getItem("user")) {
            const user_local = JSON.parse(localStorage.getItem("guestUser"))
            user = await getPlayerById(user_local.value.id);
            localStorage.setItem("user", JSON.stringify(user));
            console.log(JSON.parse(localStorage.getItem("user")));
        } else {
            user = JSON.parse(localStorage.getItem("user"));
        }

        if (user.profile_picture) avatarImg.src = user.profile_picture;
        rank.innerText = user.rank;
        text_rank.innerText = user.text_rank;
        usernameInput.value = user.username;
        if (user.email) emailInput.value = user.email;
        if (user.firstName) firstNameInput.value = user.firstname;
        if (user.lastName) lastNameInput.value = user.lastname;
        if (user.biography) bioInput.value = user.biography;

    }
    enterFields();

    // i need a function where i check if there are any mistakes

    passwordError.innerText.split("\n").find(el => el.startsWith("❌"));

    const checkFields = () => {
        if (ISusername && ISbio && ISemail && ISfirstname && ISlastname && ISpassword) return true;
        else return false;
    }


    usernameInput.addEventListener('input', () => {
        let res = isUsernameValid(usernameInput.value, { paragraph: '', checked: false })
        if (res) {
            if (res == '') {
                usernameError.innerText = '';
                ISusername = false;
            } else {
                usernameError.innerText = res.paragraph;
                ISusername = res.checked;
            }

        }
        else {
            usernameError.innerText = "❌ Enter username!";
            ISusername = false;
        }

    })

    emailInput.addEventListener('input', () => {
        const res = isEmailValid(emailInput.value);
        if (res == '') {
            emailErorr.innerText = '';
            ISemail = true;
        } else {
            emailErorr.innerText = res.msg;
            ISemail = res.passed;
        }

    })

    firstNameInput.addEventListener('input', () => {
        const res = isNameValid(firstNameInput.value);
        if (res === '') {
            firstNameError.innerText = '';
            ISfirstname = true;
        } else {
            firstNameError.innerText = res.msg;
            ISfirstname = res.passed;
        }


    });

    lastNameInput.addEventListener('input', () => {
        const res = isNameValid(lastNameInput.value);
        if (res === '') {
            lastNameError.innerText = '';
            ISlastname = true;
        } else {
            lastNameError.innerText = res.msg;
            ISlastname = res.passed;
        }


    });

    bioInput.addEventListener('input', () => {
        const res = isBioValid(bioInput.value);
        bioError.innerText = res.msg;
        ISbio = res.passed;

    });

    passwordInput.addEventListener('input', () => {
        const out = isPasswordValid(passwordInput.value);
        let text = out !== true ? out : '';
        passwordError.innerText = text;
        if (text === true) {
            ISpassword = true;
        } else ISpassword = false;
    })

    formSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("submitted");
        if (!checkFields()) return;

        const username = usernameInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const bio = bioInput.value.trim();
        const oldpassword = oldPasswordInput.value;
        const newPassword = passwordInput.value;
        let usr = JSON.parse(localStorage.getItem('user'));
        console.log(usr);
        let toUpgrade = {};
        if (usr.username != username && username != '') toUpgrade.username = username;
        if (usr.firstname != firstName && firstName != '') toUpgrade.firstname = firstName;
        if (usr.lastname != lastName && lastName != '') toUpgrade.lastname = lastName;
        if (usr.email != email && email != '') toUpgrade.email = email;
        if (usr.biography != bio && bio != '') toUpgrade.biography = bio;
        console.log(toUpgrade);
        if (Object.keys(toUpgrade).length !== 0) {
            const res = await updateProfile(usr.others.username, toUpgrade);
            // update sessionStorage
            if (res) {
                Object.assign(usr.others, toUpgrade);
                localStorage.setItem("user", JSON.stringify(usr));
            }
        }

        if (oldpassword && newPassword) await updatePassword();

    })



    const updatePassword = async () => {
        try {
            // thi will be an object
            const username = JSON.parse(localStorage.getItem('user')).username;
            const newPassword = passwordInput.value;
            const oldPassword = oldPasswordInput.value
            console.log(username, newPassword, oldPassword);
            // here we update the password
            const response2 = await fetch('/api/users/verifypassword', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usr, newPassword, oldPassword })
            });
            const data = await response2.json();
            console.log(data);
            if (response2.status === 404) {
                // username already in use
                setErrorText("❌ Wrong password", oldPasswordError);

            } else if (response2.status === 200) {
                // username is created
                setErrorText("✅ Password updated successfully", oldPasswordError);
                // now i need to redirect him to the main page here
                navigate('login');
            } else if (response2.status === 401) {
                // something went wrong;
                setErrorText("❌ Wrong password", oldPasswordError);

            } else if (response2.status === 500) {
                setErrorText("❌ Server error, please try again", oldPasswordError);
            }

        } catch (error) {
            setErrorText(`❌ Problem with the server. Please reload tge page: Error is ${error}`, oldPasswordError);

        }
    }


    const updateProfile = async (username, upgrade_list) => {
        // const usr = await getUsername();
        // we 
        const res = await fetch("/api/users/updateprofile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usr: username, ...upgrade_list })
        })
        const data = await res.json();
        if (res.ok) {
            console.log("Update successfull", data);
            return true;
        } else {
            console.log("Error updating profile:", data.msg);
            return false;
        }
    }




    changebtn.addEventListener("click", () => {
        avatarInput.click() // simulate clicjk of hidden input
    })


    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

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
})()
