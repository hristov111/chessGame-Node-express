import { setErrorText } from "./validation.js";



const setProperButtons = async (user) => {
    let userMenu = document.querySelector('#user-menu');
    let guestMenu = document.querySelector('#guest-menu');
    if (user == 'user') {
        userMenu.style.display = 'block';
    } else {
        guestMenu.style.display = 'flex';
    }
}
const openModalOverlay = (trigger, modalOverlay) => {
    if (modalOverlay) {
        modalOverlay.setAttribute('data-trigger', trigger);
        modalOverlay.style.display = 'flex';
    } else {
        console.warn("overklay not found");
    }
}

const closeModalOverlay = ( modalOverlay) => {
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    } else {
        console.warn("overklay not found");
    }
}


const pageAuthentication = async () => {
    const modalOverlay = document.querySelector('.modal-overlay');
    if(!modalOverlay)return null;
    await extractAndSet(modalOverlay, '/pages/partials/modal-choose.html',null, ['/scripts/modal-choose.js']);
    let user = undefined;
    console.log('pageAuth');
    const res = await checkSession();
    // session has expired now get to log in sign up or play as guest   
    if (!res.session) openModalOverlay("sessionCheck",modalOverlay);
    else if(res.session && !localStorage.getItem("guestUser")){
        // guest user was removed, add him back
        setwithExpiry("guestUser",{id:res.id,guest_name:res.username,isAdmin:false,isGuest:res.isGuest},2 * 24 * 60 * 60 * 1000);
    }
    else if (res.session && res.isGuest) {
        user = "guest";
    }
    else user = 'user';
    await setProperButtons(user);
    return user;
}


// pass with innerHTML
const extractAndSet = async (html, path, callback = null, scripts = []) => {
    try {
        const res = await fetch(path);
        const data = await res.text();
        html.innerHTML = data;

        for (const script of scripts) {
            const newScript = document.createElement("script");
            newScript.src = script;
            newScript.type = 'module';
            document.body.appendChild(newScript);
        }

        if (typeof callback === 'function') {
            callback();
        }
    } catch (err) {
        console.error(`❌ Error in extractAndSet for ${path}:`, err);
    }
};


const fetchUserINfo = async () => {
    if (!localStorage.getItem("user")) {
        try {
            const user_fetch = await fetch("/api/users/me", {
                method: "GET",
                credentials: "include",
            });
            const { username } = await user_fetch.json();
            if (username == undefined) return;
            const fetch_all = await fetch(`/api/users/${username}`);
            const end_result = await fetch_all.json();
            sessionStorage.setItem("user", JSON.stringify(end_result));
            return end_result;

        } catch (error) {
            console.log("Error:" + error);
        }
    } else return JSON.parse(localStorage.getItem("user"));

}

const checkIfUsernameExists = async (username) => {
    try {
        const res = await fetch(`/api/users/existsUsername?guest_username=${username}`, {
            method: "GET",
            credentials: "include",
        })
        if (res.status == 200) {
            const data = await res.json();
            return data.exists;
        } else {
            return undefined;
        }
    } catch (err) {
        console.error("Failed to check username:", err);
        return undefined;
    }
}

const createGuestUser = async (guest_user) => {
    try {
        const res = await fetch('api/users/createGuest', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ guest_user })

        });
        if (res.status == 201) {
            const data = await res.json();
            return {
                success: true,
                usedId: data.userId,
                username: data.username
            };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error("Something went wrong in the server:", error);
        return { success: false };
    }
}

const generateGuestName = async () => {
    let name;
    do {
        name = `Guest${Math.floor(Math.random() * 100000)}`;
    } while (await checkIfUsernameExists(name));
    console.log(name);
    return name;
}

const checkSession = async () => {
    const user_fetch = await fetch('/api/users/me', {
        method: "GET",
        credentials: "include",
    })
    if (user_fetch.status == 401) {
        return {
            session: false,
        }
    }
    else if (user_fetch.status == 200) {
        const data = await user_fetch.json();
        console.log(data);
        return {
            session: true,
            ...data
        }
    }
}
const greetUser = async (html) => {
    console.log(html)
    const usr = await fetchUserINfo();
    html.innerText = `Welcome ${usr.others.username}`;
}


const registerUser = async (username, password, errorParagraph, redirectPage) => {
    try {
        const response = await fetch('/api/users/register', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.status === 409) {
            // username already in use
            setErrorText("❌ Username already exists", errorParagraph);

        } else if (response.status === 201) {
            // username is created
            setErrorText("✅ User successfully created", errorParagraph);
            // now i need to redirect him to the main page here
            window.location.href = redirectPage;

        } else {
            // something went wrong;
            setErrorText("❌ Problem with the server. Please reload tge page", errorParagraph);

        }

    } catch (error) {
        setErrorText(`❌ Problem with the server. Please reload the page: Error is ${error}`, errorParagraph);
    }
}

const getAllactiveGames = async () => {
    try {
        const res = await fetch('/api/games/getActiveGames', {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log(data);
        if (response.status = 200) {
            console.log("success");
        } else {
            setErrorText("Problem with the server. Please try gain later");
        }
    } catch (error) {
        console.log("error");
    }
}


const fetchAllActivePlayers = async () => {
    //    router.route("/allActive").get(getallActiveUsersFunc);
    try {
        const res = await fetch('/api/users/allActive', {
            method: "GET",
            credentials: "include"
        });

        if (res.status == 200) {
            const data = await res.json();
            console.log(data);
        }
    } catch (err) {
        console.error(err);
    }
}


const setwithExpiry = (key, value, ttl) => {

    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// function check if localstorage is expired
const getwithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();


    // check if expired
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }


    return item.value;
}


const refreshExpiry = (key, ttl) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return;

    const item = JSON.parse(itemStr);

    const now = new Date();
    const newItem = {
        value: item.value,
        expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(newItem));
}

export {
    extractAndSet, refreshExpiry, setwithExpiry, getwithExpiry, fetchUserINfo, greetUser, createGuestUser, fetchAllActivePlayers,
    checkIfUsernameExists, checkSession, registerUser, setProperButtons, generateGuestName,openModalOverlay,pageAuthentication,closeModalOverlay
};
