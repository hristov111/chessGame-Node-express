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
        console.log('clicking1');
        event.preventDefault();
        console.log('clicking2');
        clearScreen();
        const username = document.querySelector("input[name='username']").value;
        const password = document.querySelector("input[name='password']").value;
        const repeatPass = document.querySelector("input[name='repeat_password']").value;

        try{
            const response = await fetch('/register', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username,password})
            });
            const data = await response.json();

 
            if(response.status === 409){
                // username already in use
                console.log("bad");
            }else if (response.status === 201){
                // username is created
                console.log("good");
            }else {
                // something went wrong;
            }

        }catch(error){
            console.log(`Server return error: ${error}`);
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


    usernameInputBox.addEventListener('input', (event) => {
        let usernameChecked = true;
        let totalText = usernameInputBox.value.split('');
        let paragraph = '';
        if(usernameInputBox.value === ''){
            usernameParagraph.innerText = '';
            passwordInputBox.disabled = true;
            return;
        }
        // a check if username has at least three letters
        let letters = totalText.reduce((sum ,curr) => {
            let code = curr.charCodeAt(0);
            if((code >= 65 && code <= 90) || (code >= 97 && code <= 122)){
                sum++;
            }
            return sum;
        }, 0);
        let numbers = totalText.reduce((sum ,curr) => {
            if(!isNaN(curr) && curr.trim() != ""){
                sum++;
            }
            return sum;
        },0);
        console.log(letters, numbers);
        if(letters >= 3){
            paragraph = '✅ Username must have atleast 3 letters\n'
        }else {
            usernameChecked = false;
            paragraph = '❌ Username must have atleast 3 letters\n'
        }
        if(totalText.length > 10){
            usernameChecked= false;
            paragraph += '❌ Username must be no more than 10 characters long\n'
        }else if(totalText.length <= 10){
            paragraph += '✅ Username must be no more than 10 characters long\n'
        }
        if(numbers >=2){
            paragraph += "✅ Username must have 2 or more numbers\n"
        }else {
            usernameChecked= false;
            paragraph += "❌ Username must have 2 or more numbers\n"

        }
        usernameParagraph.innerText = paragraph;
        passwordInputBox.disabled = !usernameChecked;
        
        
    })


    passwordInputBox.addEventListener('input', (event) => {
        let totalText = passwordInputBox.value
        let totalTextArray = totalText.split('');
        let paragraph = '';
        let continueTo = true;
        if(totalText ==='') {
            passParagraph.innerText = '';
            labelPassCheckBox.style.display = 'none';
            return;
        }
        labelPassCheckBox.style.display = 'block';


        if(totalTextArray.length > 20 || totalTextArray.length < 8){
            paragraph = "❌ Password must be between 8 and 20 characters\n";
            continueTo = false;
        }
        else paragraph = "✅ Password must be between 8 and 20 characters\n"; 
        

        let lowerCase = totalTextArray.reduce((sum, curr) => {
            if(curr === curr.toLowerCase() && curr !== curr.toUpperCase())sum++;
            return sum;
        },0)
        if(lowerCase > 0) paragraph += "✅ Password must have atleast one lower case char\n";
        else {
            paragraph += "❌ Password must have atleast one lower case char\n";
            continueTo = false;
        }
        
        let upperCase = totalTextArray.reduce((sum, curr) => {
            if(curr === curr.toUpperCase() && curr !== curr.toLowerCase())sum++;
            return sum;
        },0)
        if(upperCase > 0)paragraph += "✅ Password must have atleast one upper case char\n";
        else  {
            paragraph += "❌ Password must have atleast one upper case char\n";
            continueTo = false;
        }

        
        let number = totalTextArray.reduce((sum ,curr) => {
            if(!isNaN(curr) && curr.trim() != ""){
                sum++;
            }
            return sum;
        },0);
        if(number > 0)paragraph += "✅ Password must have atleast one number\n";
        else {
            paragraph += "❌ Password must have atleast one number\n";
            continueTo = false;
        }

        
        const specialCharacters = ",./;:''!@#$%^&*()_-=+[]{}";
        let specialChars = [...specialCharacters].some(char =>  totalText.includes(char));
        if(specialChars) paragraph += "✅ Password must have atleast one special char\n";
        else {
            paragraph += "❌ Password must have atleast one special char\n";
            continueTo = false;
        }
        passParagraph.innerText = paragraph;
        repeatPasswordInputBox.disabled = !continueTo;

    })

    repeatPasswordInputBox.addEventListener('input', (event) => {
        let totalText = repeatPasswordInputBox.value;
        let paragraph = '';
        if(totalText === ''){
            repeatPassParagraph.innerText = '';
            labelRePassCheckbox.style.display = 'none';
            return;
        }
        labelRePassCheckbox.style.display = 'block';

        if(totalText !== passwordInputBox.value){
            paragraph += "❌ Passwords must match\n";

        }else {
            paragraph = "✅ Passwords must match\n";

        }
        repeatPassParagraph.innerText = paragraph;
    })


});





