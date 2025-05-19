import { extractAndSet, getwithExpiry,pageAuthentication, refreshExpiry, fetchUserINfo, setwithExpiry, setProperButtons, checkSession, generateGuestName, createGuestUser } from "./utils/utils.js";
import { navigate } from "./router.js";
(async () => {



    const user = await pageAuthentication();

    // play button 1
    const play_onlineButt = document.querySelector(".primary");
    const playNavbar = document.querySelector('#nav-play');

    const navSignIn = document.querySelector('#nav-login');


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


})();
