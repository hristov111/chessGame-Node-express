

(() => {
    const formLogin = document.querySelector('.login');

    // nav play 

    // check for the session

    const userError = document.querySelector('.user-error');
    const passError = document.querySelector('.pass-error');

    const setErrorSuccessMessage = (text, html, callback = () => { }) => {
        html.innerText = text;
        callback();
    }
    const clearErrorSuccessMessage = (html) => {
        html.innerText = '';
    }

    // form on submit login
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault(); // prevents the form from submitting itself

        const username = document.querySelector("input[name='username']").value;
        const password = document.querySelector("input[name='password']").value;
        console.log(username);
        console.log(password);
        try {
            const response = await fetch('/api/users/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.status === 404) {
                setErrorSuccessMessage("❌ Username doesn't exist", userError, () => clearErrorSuccessMessage(passError));
            } else if (response.status === 401) {
                setErrorSuccessMessage("❌ Wrong password", passError, () => () => clearErrorSuccessMessage(userError));
            } else if (response.status == 200) {
                setErrorSuccessMessage("✅ Success", userError);
                window.location.href = "/home";
            } else {
                console.log("There was an intyernal error. Please refresh and try again");
            }

        } catch (error) {
            console.log("An error occured,please refrsh and tery again:" + error);
        }
    })


})();
// the form
