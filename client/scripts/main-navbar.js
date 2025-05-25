
import { navigate, loadPage, navbar } from "./router.js";
import { logOutUser } from "./utils/utils.js";
(async () => {


    const user = JSON.parse(localStorage.getItem("guestUser"));
    const navPlay = document.querySelector('#nav-play');
    const navPuzzle = document.querySelector('#nav-puzzles');
    const navLearn = document.querySelector('#nav-learn');
    const navProfile = document.querySelector('.profile');
    const navHome = document.querySelector('.home');

    const navLogOut = document.querySelector('#logout-btn');
    const navLogin = document.querySelector('#nav-login');
    const navSignUp = document.querySelector('.signup-btn');

    const resignModal = document.querySelector('.resign-Tab-overlay');
    if (navPlay) {
        navPlay.addEventListener('click', async (e) => {
            e.preventDefault();
            await navigate('game-panel');
        })
    }
    if (navPuzzle) {
        navPuzzle.addEventListener('click', async (e) => {
            e.preventDefault();
        })
    }
    if (navLearn) {
        navLearn.addEventListener('click', async (e) => {
            e.preventDefault();
        })
    }

    if (navProfile) {
        navProfile.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.gameHasStarted && resignModal) {
                resignModal.classList.remove('hide-resign');
            } else {
                await navigate('profile');
            }

        })
    }

    if (navHome) {
        navHome.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.gameHasStarted && resignModal) {
                resignModal.classList.remove('hide-resign');
            } else {
                await navigate('main');
            }
        })
    }
    if (navLogOut) {
        navLogOut.addEventListener('click', async (e) => {
            e.preventDefault();
             if (window.gameHasStarted && resignModal) {
                resignModal.classList.remove('hide-resign');
            } else {
                await logOutUser(user.value.guest_name);
            }
        })
    }

    if (navLogin) {
        navLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            await navigate('login');
        })
    }
    if (navSignUp) {
        navSignUp.addEventListener('click', async (e) => {
            e.preventDefault();
            await navigate('createAccount');
        })
    }
})();




