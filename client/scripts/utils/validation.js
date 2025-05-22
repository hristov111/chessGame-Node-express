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
    return result;
}

function isPasswordValid(password, res = {}){
    let totalTextArray = password.split('');
    const paragraph = "Password must be between 8 and 20 characters,\natleast one lower case char,\none upper case char,\none number,\none special char";
    if(password ==='') return paragraph;
    if(totalTextArray.length > 20 || totalTextArray.length < 8){
        return paragraph;
    }    
    let lowerCase = totalTextArray.reduce((sum, curr) => {
        if(curr === curr.toLowerCase() && curr !== curr.toUpperCase())sum++;
        return sum;
    },0)
    if(lowerCase == 0) return paragraph;
 
    
    let upperCase = totalTextArray.reduce((sum, curr) => {
        if(curr === curr.toUpperCase() && curr !== curr.toLowerCase())sum++;
        return sum;
    },0)
    if(upperCase == 0)return paragraph;

    
    let number = totalTextArray.reduce((sum ,curr) => {
        if(!isNaN(curr) && curr.trim() != ""){
            sum++;
        }
        return sum;
    },0);
    if(number == 0) return paragraph;

    
    const specialCharacters = ",./;:''!@#$%^&*()_-=+[]{}";
    let specialChars = [...specialCharacters].some(char =>  password.includes(char));
    if(!specialChars) return paragraph;
    return true;
}


const isEmailValid = (email) =>{
    if(email === '')return '';
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if(pattern){
        return {
            msg: "✅ Good email!",
            passed: true
        }
    }else {
        return {
            msg: "❌ Bad email!",
            passed:false
        }
    }
}

const isNameValid  = (name) => {
    // no numbers or speical symbols, only letters
    if(name === '')return '';
    let pattern = /^[a-zA-Z0-9]+$/.test(name);
    if(pattern){
        if(name.length < 20){
            return {
                msg: "✅ Valid Name",
                passed: true
            }
        }else {
            return {
                msg: "❌ Name too long!",
                passed:false,
            }
        }
    }else {
        return {
            msg: "❌ Name not valid!",
            passed:false,
        }
    }
    
}

const isRepeatedPasswordValid = (pass1, REpassword) => {
    if(REpassword === '')return '';
    return REpassword !== pass1?"❌ Passwords must match":"✅ Passwords must match";
}

const isBioValid = (bio) => {
    
    return bio.length > 50? {msg:"❌ Bio too long!",passed:false}:{msg:"✅ Valid Bio!",passed:true};
}


const setErrorText = (text,paragraph) => paragraph.innerText = text;

export {isUsernameValid,isPasswordValid,isEmailValid,isNameValid,isBioValid,
    isRepeatedPasswordValid,setErrorText
};