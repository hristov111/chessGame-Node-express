import { isEmailValid, isPasswordValid, isNameValid } from "/scripts/utils/validation.js";
import { registerUser } from "/scripts/utils/utils.js";

(() => {
    const continueBut = document.querySelector('continue');
    let usernameInput = document.querySelector('.username');
    let passwordInput = document.querySelector('.password');
    let form = document.querySelector('form');
    let nameErrorElement = document.querySelector('.name-err');
    let passwordErrorElement = document.querySelector('.password-err');


    const setText = (text, el) => {
        el.style.display = 'block';
        el.textContent = text;
    }
    const removeText = (el) => {
        el.textContent = '';
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
                const passError = isPasswordValid(passwordValue);
                if (passError) {
                    // we can now call register
                    await registerUser(usernameValue, passwordValue, passwordErrorElement, '/game-panel');
                } else {
                    setText(passError, passwordErrorElement);

                }
            } else {
                setText(nameError, nameErrorElement);

            }
        }

    })


})();
