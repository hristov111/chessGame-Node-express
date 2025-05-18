import { extractAndSet, fetchUserINfo, setProperButtons, checkSession, generateGuestName, createGuestUser } from "./utils/utils.js";
import { navigate } from "./router.js";
(async () => {
    // import the modal overlay


    // take buttons and check if the user  is signed in or not in order to use them
    // LOGGED IN section
    // true if it is user else guest
    const modalOverlay = document.querySelector('.modal-overlay');
    await extractAndSet(modalOverlay, '/pages/partials/modal-choose.html');

    const openModalOverlay = (trigger) => {
        if (modalOverlay) {
            modalOverlay.setAttribute('data-trigger', trigger);
            modalOverlay.style.display = 'flex';
        } else {
            console.warn("overklay not found");
        }
    }
    let user = undefined;
    const res = await checkSession();
    // if undefined ask to sign in .....
    if (!res.session) openModalOverlay("sessionCheck");
    else if (res.session && res.isGuest) user = "guest";
    else user = 'user';
    await setProperButtons(user);

    // THIS IS SET in index.html
    // const navbar = document.querySelector('.navbar');
    // await extractAndSet(navbar, '/main-navbar');
    // -----------------------------------------------
    // play button 1
    const play_onlineButt = document.querySelector(".primary");
    // nav bar play button
    const playNavbar = document.querySelector('#nav-play');
    // ---
    const modalContent = document.querySelector('.modal-content');
    // set the navbar horizontally

    // modal-close button 

    // NAV sign in 
    const navSignIn = document.querySelector('#nav-login');




    const modalCloseButt = document.querySelector('.modal-close');

    if (modalCloseButt && modalOverlay) {
        modalCloseButt.addEventListener('click', () => {
            modalOverlay.style.display = 'none';

        })
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (!modalContent.contains(e.target)) {
                modalOverlay.style.display = 'none';
            }
        });
    }




    // sign in modal 
    let modalSignInButt = document.querySelector('.sign-in');
    // sign up modal
    let modalSignUpButt = document.querySelector('.sign-up');
    // play as guest 
    let guestPlayButt = document.querySelector('.play-guest');

    if (playNavbar) {
        playNavbar.addEventListener('click', (e) => {
            play_onlineButt.click()

        })
    }
    if (play_onlineButt) {
        play_onlineButt.addEventListener('click', async () => {
            try {

                if (user) {
                    navigate("game-panel");
                } else {
                    openModalOverlay('playButton');
                }
            } catch (err) {
                console.error("Session checkf ailed:", err);
            }

        });
    }
    if (user == undefined) {
        modalSignInButt.addEventListener('click', () => navigate("login"));
        modalSignUpButt.addEventListener('click', () => navigate("createAccount"));
        guestPlayButt.addEventListener('click', async () => {
            // set a proper guest name 
            /**   success:true,
                usedId:data.userId,
                username:data.username */
            const modalTrigger = modalOverlay.getAttribute('data-trigger');
            if (!localStorage.getItem("guestUser")) {
                let guestName = await generateGuestName();
                const obj = await createGuestUser(guestName);
                if (obj.success) {
                    const user = {
                        id: obj.usedId,
                        guest_name: obj.username
                    }
                    localStorage.setItem("guestUser", JSON.stringify(user));
                } else {
                    localStorage.setItem("guestUser", false);
                }

            }
            if (modalTrigger == 'playButton') {
                navigate("game-panel")
            }
            // no register him in the database with flag is_guest = true make a local-storage and no password
        });
    }


})();
