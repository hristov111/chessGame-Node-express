// here will be the whole logic for the game itself
import { checkSession, extractAndSet, setProperButtons,startTimer, updateUserGameSearchState, getGameSearchingUsers } from "/scripts/utils/utils.js";
import { fetchAllActivePlayers, pageAuthentication, getGamesForToday, getPlayerById } from "/scripts/utils/utils.js";
import { findgame, socket } from "./router.js";

/**if(user_fetch.status == 401){
        return {
            session:false,
        } 
    }
    else if(user_fetch.status == 200) {
        const data = await user_fetch.json();
        return {
            session:true,
            isGuest:data.isGuest
        } */
(async () => {

    console.log('game-ready')

    const user = await pageAuthentication();

    // actibvve players for today
    const peoplePlaying = document.querySelector('.people-playing');
    const activePlayers = await fetchAllActivePlayers();
    if (activePlayers) peoplePlaying.textContent = activePlayers.length;



    // games for today
    const gamesToday = document.querySelector('.games-today');
    const gamesForTodayFetch = await getGamesForToday();
    if (gamesForTodayFetch) gamesToday.textContent = gamesForTodayFetch;

    // people playing - games today--------------------
    //------------------------------------
    const opponent_name = document.querySelector('.opponent-name');
    const my_name = document.querySelector('.my-name');



    if (user) {
        my_name.textContent = JSON.parse(localStorage.getItem("guestUser")).value.guest_name;
    }
    // start game button
    const stopSearching = document.querySelector('.stop-searching');
    const start_gameButt = document.querySelector('.start-gameButt');
    const searchModal = document.querySelector('.search-modal-overlay');

    start_gameButt.addEventListener('click', async () => {
        // find someone that is on your level 

        // 1. first check authentication
        // 2. make 
        // take local storage
        // first open screen for searching 
        searchModal.classList.remove('hide');
        const user = JSON.parse(localStorage.getItem("guestUser"))
        // const res = await updateUserGameSearchState(user.value.id,true);
        // // now search for other players with search state of true
        // const searchgingGamesUsers = await getGameSearchingUsers(user.value.id);
        findgame(user.value.id);

    })
    stopSearching.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem("guestUser"))
        const res = await updateUserGameSearchState(user.value.id, false);

        searchModal.classList.add('hide');
    })



    const playerBtn = document.querySelector('.user-btn');
    const playerSearchInput = document.querySelector('.play-user input');
    const users = document.querySelector('.users');
    const user_Tags = document.querySelector('.user-tags');

    //TABS for display none or 
    const searchPlayersTab = document.querySelector('.search-players');
    const startGameTab = document.querySelector('.start-gameTab');

    const show_playersButt = document.querySelector('.show-players');
    const newGameButton = document.querySelector(".new-game");
    show_playersButt.addEventListener('click', async () => {
        newGameButton.style.backgroundColor = "#28a745";
        show_playersButt.style.backgroundColor = "#218838";
        startGameTab.style.display = 'none';
        searchPlayersTab.style.display = 'block';
        await displayUsers();
        // here i need to call displayAllplayers 


        // await displayUsers(true);
    });
    newGameButton.addEventListener('click', async () => {
        newGameButton.style.backgroundColor = "#218838";
        show_playersButt.style.backgroundColor = "#28a745";
        searchPlayersTab.style.display = 'none';
        startGameTab.style.display = 'block';

    })

    let board = document.querySelector('.board');




    const fetchAllPlayers = async () => {
        try {
            const response = await fetch('/api/users/players');
            if (!response.ok) {
                console.log("Request failed");
            } else {
                let users = await response.json();
                users.sort((first, next) => first.username.localeCompare(next.username));
                console.log(users);
                return users;

            }
        } catch (error) {
            console.log("Error fetching users: ", error);
        }
    }

    const fetchUserByName = async (char) => {
        const response = await fetch(`/api/users/active?char=${char}`);
        if (!response.ok) console.log("Bad request");
        else {
            let users = await response.json();
            users.sort((first, next) => first.username.localeCompare(next.username));
            return users;
        }
    }
    const popup = document.getElementById('playerPopup');

    const displayUsers = async (displayAll = true, findBychar = '') => {
        let active = await fetchAllPlayers();
        if (!displayAll) {
            active = await fetchUserByName(findBychar);
        }
        removeAllUsers();
        active.forEach(element => {
            const user = document.createElement('div');
            user.className = "user";
            const username = document.createElement('div');
            username.classList = ["username", "field"]
            username.textContent = element.username
            const games = document.createElement('div');
            games.classList = ["games", "field"];
            games.textContent = element.games;
            const wins = document.createElement('div');
            wins.classList = ["wins", "field"];
            wins.textContent = element.wins;
            const losses = document.createElement('div');
            losses.classList = ['losses', "field"];
            losses.textContent = element.losses;
            const is_online = document.createElement('div');
            is_online.classList = ['is_online', "field"];
            is_online.textContent = element.online ? "✅" : "❌";
            const is_playing = document.createElement('div');
            is_playing.classList = ['is_playing', "field"];
            is_playing.textContent = element.playing ? "✅" : "❌";
            user.appendChild(username);
            user.appendChild(games);
            user.appendChild(wins);
            user.appendChild(losses);
            user.appendChild(is_online);
            user.appendChild(is_playing);
            user_Tags.appendChild(user);
            user.addEventListener('click', async (e) => {
                const rect = user.getBoundingClientRect();
                popup.style.top = `${rect.top + window.screenY + user.offsetHeight}px`;
                popup.style.left = `${rect.left + window.screenY}px`;
                popup.classList.remove('hidden');
                console.log(element.id);
                const player = await getPlayerById(element.id);
                console.log(player);

                const img = document.querySelector('.popup-header');
                const username = document.querySelector('.popup-title');
                const name = document.querySelector(".popup-name");
                // meta will be the rank in integer
                const meta = document.querySelector('.popup-meta');
                // rank will be the name of ther ank grandmaster and tn
                const rank = document.querySelector('.popup-rank');
                if (player.profile_picture == null) {
                    img.src = "../images/profile.png"
                } else img.src = player.profile_picture
                username.textContent = player.username;
                if (name) name.textContent = player.firstname
                meta.textContent = player.rank
                rank.textContent = player.text_rank



                // make a fetch request for username and .....
            })
        });
    }

    const removeAllUsers = () => {
        user_Tags.replaceChildren();
    }



    playerSearchInput.addEventListener('input', async (e) => {
        e.preventDefault();
        let current = e.target.value;
        await displayUsers(false, current);
        // now for this current value i need to send a request to the api 
    })


    // POP UP FOR PROFILES


    document.addEventListener("click", (e) => {
        if (!popup.contains(e.target) && !e.target.closest('.user')) {
            popup.classList.add("hidden");
        }
    })

    const popUpAddFriend = document.querySelector(".pop-upAddFiend");
    const popUpChallange = document.querySelector(".challange");

    popUpAddFriend.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem("guestUser"));
        if (user.value.isGuest) return;
        else {
            // add him as a friend 
        }
    })


    popUpChallange.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem("guestUser"));
        if (user.value.isGuest) return;
        else {
            // add him send him a challange
        }
    })
    let in_game = false;
    // SECTION FOR SOCKETS LISTENING 
    const opponent_pic = document.querySelector('.person img');
    socket.on('game-started', async ({ roomId, opponentId,color ,opponent_color, timer}) => {
        // need to get information about opponent first and store him in localstorage
        searchModal.classList.add('hide');
        const opponent = await getPlayerById(opponentId);
        localStorage.setItem("guestOpponent",opponent);
        localStorage.setItem("roomId", roomId);
        opponent_name.textContent = opponent.username;
        if(opponent.profile_picture) opponent_pic.src = opponent.profile_picture;
        // display the board
        firstTurn = timer;
        in_game = true;
        socket.emit('start-game', (roomId,color,opponent_color,timer));

    });
    if(in_game && sessionStorage.getItem("reloaded")){
        const roomId = JSON.parse(localStorage.getItem("roomId"));
        const user = JSON.parse(localStorage.getItem("guestUser"));
        // if there is localstorage of the roomId get it and rejoin
        if(roomId){
            socket.emit("rejoin-room", (roomId));
        }else {
            socket.emit("get-roomId",(user.value.id));
        }
        sessionStorage.removeItem("reloaded");
    }
    socket.on("rejoined", ({game}) => {
        // here set everything 
    })

    socket.on("roomId", ({roomId}) => {
        localStorage.setItem("roomId",roomId);
        socket.emit("rejoin-room", (roomId));
    })

    // on reload set a localstorage variable
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem("reloaded", "true");
    })

})();
// get the navbar header

