import { isEmailValid, isPasswordValid, isNameValid } from "/scripts/utils/validation.js";
import { registerUser } from "/scripts/utils/utils.js";
import { navigate } from "../router.js";

(() => {
    const continueBut = document.querySelector('continue');
    let usernameInput = document.querySelector('.username');
    let passwordInput = document.querySelector('.password');
    let form = document.querySelector('form');
    let nameErrorElement = document.querySelector('.name-err');
    let passwordErrorElement = document.querySelector('.password-err');


    const setText = (text, el) => {
        el.style.display = 'block';
        el.innerText = text;
    }
    const removeText = (el) => {
        el.innerText = '';
        el.style.display = 'none';
    }
    form.addEventListener('submit', async (e) => {
        // check email and password
        e.preventDefault();
        removeText(passwordErrorElement);
        removeText(nameErrorElement);
        let usernameValue = usernameInput.value;
        if (usernameValue == '') {
            setText("❌ Please enter a username!", nameErrorElement);
        }
        let passwordValue = passwordInput.value;
        if (passwordValue == '') {
            setText("❌ Please enter a password!", passwordErrorElement);
        } else {
            const nameError = isNameValid(usernameValue);
            if (nameError) {
                // valid name
                setText(nameError,nameErrorElement);
                const passError = isPasswordValid(passwordValue);
                if (passError === true) {
                    setText("✅ Password okay", passwordErrorElement);
                    // we can now call register
                    passwordErrorElement.innerText = '';
                    nameErrorElement.innerText = ''
                    const res = await registerUser(usernameValue, passwordValue, passwordErrorElement, '/game-panel');
                    if(res) await navigate('login');
                } else {
                    setText(passError, passwordErrorElement);

                }
            } else {
                setText(nameError, nameErrorElement);

            }
        }

    })


})();
