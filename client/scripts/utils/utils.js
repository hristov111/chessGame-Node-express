import { navigate } from "../router.js";
import { setErrorText } from "./validation.js";



const setProperButtons = async (user, sessionUser) => {
    let userMenu = document.querySelector('#user-menu');
    let guestMenu = document.querySelector('#guest-menu');
    let username = document.querySelector('#user-name');
    let profile_pic = document.querySelector('.dropbtn img');
    if (user == 'user') {
        userMenu.style.display = 'block';
        username.innerText = sessionUser.guest_name
        if (sessionUser.profile_pic) profile_pic.src = sessionUser.profile_pic;
        else profile_pic.src = '/images/profile.png'
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

const closeModalOverlay = (modalOverlay) => {
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    } else {
        console.warn("overklay not found");
    }
}

const updatePlayerActiveState = async (username,is_online) => {
    console.log(username,is_online);
    try {
        const res = await fetch(`/api/users/updateplayerActiveState?name=${username}&status=${is_online}`, {
            method:"PATCH",
            credentials:"include",
        })

        console.log(res);
        const data = await res.json();
        return data;
    }catch(error){
        console.log("Server error: ", error);
    }
}


const logOutUser = async (username) => {
    await updatePlayerActiveState(username,false);
    const res = await fetch('/api/users/logout', {
        method:"POST",
        credentials:"include",
    })
    if(res.ok){
        await navigate('login');


    }
}

const pageAuthentication = async (sensitivePage) => {
    let modalOverlay;
    if (sensitivePage != 'profile') {
        modalOverlay = document.querySelector('.modal-overlay');
        if (!modalOverlay) return null;
        await extractAndSet(modalOverlay, '/pages/partials/modal-choose.html', null, ['/scripts/modal-choose.js']);
    }

    let user = undefined;
    const res = await checkSession();
    const userInLocalStorage = JSON.parse(localStorage.getItem("guestUser"));
    // session has expired now get to log in sign up or play as guest   
    if (!res?.session) {
        if(sensitivePage === 'profile') return 'nouser';
        openModalOverlay("sessionCheck", modalOverlay);
    } else {
        const sessionUser = {
            id: res.id,
            profile_pic: res.profile_pic,
            guest_name: res.username,
            isAdmin: res.isAdmin,
            isGuest: res.isGuest
        }
        //Sync localStorage with session
        if (!userInLocalStorage || userInLocalStorage.guest_name !== res.username) {
            setwithExpiry("guestUser", sessionUser, 2 * 24 * 60 * 60 * 1000); // 2 days in ms
        }

        user = res.isGuest ? "guest" : "user";
        await setProperButtons(user, sessionUser);
    }
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
    try {
        const user = JSON.parse(localStorage.getItem("guestUser"))
        const fetch_all = await fetch(`/api/users/${username}`);
        const end_result = await fetch_all.json();
        sessionStorage.setItem("user", JSON.stringify(end_result));
        return end_result;

    } catch (error) {
        console.log("Error:" + error);
    }

}

const updateUserGameSearchState = async (id, is_searching) => {
    try {
        const res = await fetch("/api/users/updateGameSearchState", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_searching })
        });

        const data = await res.json();
        console.log(data);
        if (res.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {

    }
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

const getGameSearchingUsers = async (id) => {
    try {
        const res = await fetch(`/api/users/get-searchingUsers/${id}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
            console.log("✅ Success:", data);
            return data;
        } else {
            console.warn("⚠️ Request failed with status:", res.status, res.statusText);
            return data;
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
        return null;
    }
};



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
            return true;
            // now i need to redirect him to the main page here
        } else {
            // something went wrong;
            setErrorText("❌ Problem with the server. Please reload tge page", errorParagraph);

        }

    } catch (error) {
        setErrorText(`❌ Problem with the server.\n Please reload the page:\n Error is ${error}`, errorParagraph);
    }
    return false;
}

const getAllActiveGames = async () => {
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

const getGamesForToday = async () => {
    try {
        const res = await fetch('api/games/getGamesForToday', {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"

        });

        const data = await res.json();
        if (res.status == 200) {
            console.log(data);
            return data;
        } else {
            console.log("Couldnt get games for today");
        }
    } catch (error) {
        console.log(error);
    }
}

function getTitleByELO(elo) {
    if (elo < 400) return "Novice";
    if (elo < 1000) return "Casual";
    if (elo < 1400) return "Intermediate";
    if (elo < 1700) return "Advanced";
    if (elo < 2000) return "Expert";
    if (elo < 2200) return "Candidate Master";
    if (elo < 2400) return "Master";
    if (elo < 2600) return "International Master";
    return "Grandmaster";
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
            return data;
        }
    } catch (err) {
        console.error(err);
    }
}


const getPlayerById = async (id) => {
    try {
        const res = await fetch(`api/users/by-id/${id}`, {
            method: "GET",
            credentials: "include"
        });
        if (res.status == 200) {
            const data = await res.json();
            console.log(data);
            return data;
        } else {
            console.log("Failed fetching");
        }

    } catch (error) {
        console.log("Failed fetching: ", error);
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


const startTimer = (duration, display, onEnd = () => { }) => {
    var timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            onEnd();
        }
    }, 1000)
}

export {logOutUser,updatePlayerActiveState,
    extractAndSet, startTimer, getGameSearchingUsers, getTitleByELO, updateUserGameSearchState, refreshExpiry, setwithExpiry, getwithExpiry, getPlayerById, fetchUserINfo, greetUser, createGuestUser, fetchAllActivePlayers,
    checkIfUsernameExists, checkSession, registerUser, setProperButtons, generateGuestName, openModalOverlay, pageAuthentication, closeModalOverlay, getGamesForToday
};
