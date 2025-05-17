document.addEventListener("DOMContentLoaded", () => {

    // signUp btn
    const signUpBtn = document.querySelector('.signup');
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/register?step=skill-level'
    })
})