
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector('.login');
    const registerForm = document.querySelector('.register');
    const registerBtn  = document.querySelector('.register-btn');
    const loginBtn  = document.querySelector('.login-btn');

    const usernameInputBox = document.querySelector('.username-box input');
    const passwordInputBox = document.querySelector('.password-box input');
    const repeatPasswordInputBox = document.querySelector('.repeatpass-box input');


    const usernameParagraph = document.querySelector('.usercheck');
    const passParagraph = document.querySelector('.passCheck');
    const repeatPassParagraph = document.querySelector('.repeatPassCheck');

    const passCheckBox = document.querySelector('.passCheck-box');
    const repeatpassCheckbox = document.querySelector('.repeatpassCheck-box');


    const labelPassCheckBox = document.querySelector('.password-box label');
    const labelRePassCheckbox = document.querySelector('.repeatpass-box label');

    // const registerSubmit = document.querySelector('.btn');
    // console.log(registerSubmit);

    // passwordInputBox.addEventListener('copy', async (event) => {
    //     passwordInputBox.type = 'text';
    //     console.log('copying');
    //     event.preventDefault();
    //     const password = passwordInputBox.value;
    //     event.clipboardData.setData("text/plain", "*".repeat(password.length));
    //     await navigator.clipboard.writeText(password);
    // })


    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.querySelector("input[name='username']").value;
        const password = document.querySelector("input[name='password']").value;
        const repeatPass = document.querySelector("input[name='repeat_password']").value;
        console.log("Username is "+ username);
        console.log("PaSasword is " + password);
        clearScreen();
        try{
            const response = await fetch('/api/users/register', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username,password})
            });

            const data = await response.json();
            if(response.status === 409){
                // username already in use
                setUsernameText("❌ Username already exists",usernameParagraph);
                
            }else if (response.status === 201){
                // username is created
                setUsernameText("✅ User successfully created",usernameParagraph);
                // now i need to redirect him to the main page here

            }else {
                // something went wrong;
                setUsernameText("❌ Problem with the server. Please reload tge page",usernameParagraph);

            }

        }catch(error){
            setUsernameText(`❌ Problem with the server. Please reload tge page: Error is ${error}`,usernameParagraph);

        }
        

    })

    passCheckBox.addEventListener('change', (event) => {
        passCheckBox.checked === true? passwordInputBox.type = 'text':passwordInputBox.type  = 'password';
    })

    repeatpassCheckbox.addEventListener('change', () => {
        repeatpassCheckbox.checked === true? repeatPasswordInputBox.type = 'text': repeatPasswordInputBox.type  = 'password';
    })

    const clearScreen = () => {
        usernameInputBox.value = '';
        passwordInputBox.value = '';
        repeatPasswordInputBox.value = '';
        usernameParagraph.innerText = '';
        passParagraph.innerText = '';
        repeatPassParagraph.innerText = '';
        labelPassCheckBox.style.display = 'none';


    }


    // username must have atleaast 3 letters and 2 numbers, but not more than 10 characters total
    // password must be atleast 8 - 20 characters. It must have on lower, one upper case, one number and one special character

    // modifes the res 
    usernameInputBox.addEventListener('input', (event) => {
        let result = {checked:false,paragraph:""};
        isUsernameValid(usernameInputBox.value, result);

        usernameParagraph.innerText = result.paragraph;
        passwordInputBox.disabled = !result.checked;
        
        
    })


    passwordInputBox.addEventListener('input', (event) => {
        let result = {checked:false,paragraph:""};
        isPasswordValid(passwordInputBox.value,result)
       
        passParagraph.innerText = result.paragraph;
        repeatPasswordInputBox.disabled = !result.checked;
        // if(repeatPasswordInputBox.disabled){
        //     labelPassCheckBox.style.display = "none"
        // }

    })

    repeatPasswordInputBox.addEventListener('input', (event) => {
        
        repeatPassParagraph.innerText = paragraph;
    })


});







