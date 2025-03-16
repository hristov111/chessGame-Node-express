

const submitLoginBtn = document.querySelector('.btn');

submitLoginBtn.addEventListener('submit', async (event) => {
    event.preventDefault(); // prevents the form from submitting itself

    const username = document.querySelector("input[name='username']");
    const password = document.querySelector("input[name='password']");

    const response = await fetch('/login', {
        method:"POST",
        headers: {"Content-Type":"application/json" },
        body: JSON.stringify({username, password})
    });

    const data = await response.json();
    console.log(data); 


})