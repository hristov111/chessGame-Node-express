function isUsernameValid(username, result = {}){
    let usernameChecked = true;
    let totalText = username.split('');
    let paragraph = '';

    if(username === '')return '';

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
    if(Object.keys(result).length === 0) return paragraph;
    result.checked = usernameChecked;
    result.paragraph = paragraph;
}

function isPasswordValid(password, res = {}){
    let totalTextArray = password.split('');
    let paragraph = '';
    let continueTo = true;
    if(password ==='') return '';
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
    let specialChars = [...specialCharacters].some(char =>  password.includes(char));
    if(specialChars) paragraph += "✅ Password must have atleast one special char\n";
    else {
        paragraph += "❌ Password must have atleast one special char\n";
        continueTo = false;
    }
    if (Object.keys(res).length === 0)return paragraph;
    res.checked = continueTo;
    res.paragraph = paragraph;
}


const isEmailValid = (email) =>{
    if(email === '')return '';
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    return pattern?"✅ Good email!":"❌ Bad email!";
}

const isNameValid  = (name) => {
    // no numbers or speical symbols, only letters
    if(name === '')return '';
    let pattern = /^[a-zA-Z]+$/.test(name);
    return pattern?name.length <20?"✅ Valid Name": "❌ Name too long!":"❌ Name not valid!"
    
}

const isRepeatedPasswordValid = (pass1, REpassword) => {
    if(REpassword === '')return '';
    return REpassword !== pass1?"❌ Passwords must match":"✅ Passwords must match";
}

const isBioValid = (bio) => {
    return bio.length > 50? "❌ Bio too long!": "✅ Valid Bio!";
}


const setErrorText = (text,paragraph) => paragraph.innerText = text;

export {isUsernameValid,isPasswordValid,isEmailValid,isNameValid,isBioValid,
    isRepeatedPasswordValid,setErrorText
};