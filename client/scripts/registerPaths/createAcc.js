import { navigate } from "../router.js";

(() => {
    // signUp btn
    const signUpBtn = document.querySelector('.signup');
    signUpBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await navigate("createAccount?step=createSkill-level");
    })

})();