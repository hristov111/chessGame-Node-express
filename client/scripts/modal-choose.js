import { generateGuestName, createGuestUser, setwithExpiry, getwithExpiry, refreshExpiry,closeModalOverlay } from "./utils/utils.js";
import { navigate } from "./router.js";
// sign in modal 
let modalSignInButt = document.querySelector('.sign-in');
// sign up modal
let modalSignUpButt = document.querySelector('.sign-up');
// play as guest 
let guestPlayButt = document.querySelector('.play-guest');
const modalCloseButt = document.querySelector('.modal-close');
const modalContent = document.querySelector('.modal-content');
const modalOverlay = document.querySelector('.modal-overlay');


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


modalSignInButt.addEventListener('click',async () => {
    localStorage.clear();
    sessionStorage.clear();
    await navigate("login");

});
modalSignUpButt.addEventListener('click',async () => {
    localStorage.clear();
    sessionStorage.clear();
    await navigate("createAccount");
});
guestPlayButt.addEventListener('click', async () => {
    // set a proper guest name 
    /**   success:true,
        usedId:data.userId,
        username:data.username */
    // need to have expiry date 
    const modalTrigger = modalOverlay.getAttribute('data-trigger');
    // no user in local storage (create one)
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    if (!localStorage.getItem("guestUser")) {
        let guestName = await generateGuestName();
        const obj = await createGuestUser(guestName);
        if (obj.success) {
            const user = {
                id: obj.usedId,
                guest_name: obj.username
            }
            setwithExpiry("guestUser", user, twoDaysInMs);
            console.log("successfully logged user", user);
            closeModalOverlay(modalOverlay);
            window.location.href = window.location.href;
        } else {
            localStorage.setItem("guestUser", false);
        }

    }
    // if there is a guest user - check expiry 
    else {
        // if the user is expired it will rmeove it 
        if (getwithExpiry("guestUser")) {
            // refresh the expiry date
            refreshExpiry("guestUser", twoDaysInMs);
        }
        // make a new session here
        const guest = JSON.parse(localStorage.getItem("guestUser"));
        if(guest){
            const res = await fetch('/api/users/restore-guest', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({guest_id:guest.value.id})
            });
            if(res.ok)console.log("Guest session restored");
            else {
                console.log("Failed to restore guest session");
                localStorage.removeItem("guestUser");
            }
        }
    }
    if (modalTrigger == 'playButton') {
        navigate("game-panel")
    }else{
        closeModalOverlay(modalOverlay);
        window.location.href = window.location.href;

    }

    // here i need to reestablish the session
    // no register him in the database with flag is_guest = true make a local-storage and no password
});