// here will be the whole logic for the game itself
import { checkSession, extractAndSet, setProperButtons } from "/scripts/utils/utils.js";
import { fetchAllActivePlayers ,pageAuthentication} from "/scripts/utils/utils.js";


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
    await fetchAllActivePlayers();
    // lets set 



    // people playing - games today--------------------
    const peoplePlaying = document.querySelector('.people-playing');
    const gamesToday = document.querySelector('.games-today');
    //------------------------------------
    const opponent_name = document.querySelector('.opponent-name');
    const my_name = document.querySelector('.my-name');

    const newGameButton = document.querySelector(".new-game");


    if(user){
        my_name.textContent = JSON.parse(localStorage.getItem("guestUser")).value.guest_name;   
    }
    // start game button
    const start_gameButt = document.querySelector('.start-game');


    const playerBtn = document.querySelector('.user-btn');
    const playerSearchInput = document.querySelector('.play-user input');

    const users = document.querySelector('.users');


    // show players
    const show_playersButt = document.querySelector('.show-players');
    const startGameTab = document.querySelector('start-gameTab');

    show_playersButt.addEventListener('click', async () => {
        startGameTab.style.display = 'none';
        playerSearchInput.style.display = 'block';
        users.style.display = 'flex';
        // await displayUsers(true);
    });
    newGameButton.addEventListener('click', async () => {
        playerSearchInput.style.display = 'none';
        users.style.display = 'none';
        startGameTab.style.display = 'flex';

    })

    let board = document.querySelector('.board');




    const fetchAllPlayers = async () => {
        try {
            const response = await fetch('/api/users/players');
            console.log(await response.json());
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

    const displayUsers = async (displayAll = true, findBychar = '') => {
        let active = await fetchAllPlayers();
        if (!displayAll) {
            active = await fetchUserByName(findBychar);
        }
        removeAllUsers();
        const usersTable = document.createElement('div');
        usersTable.className = 'users-table';
        usersTable.innerHTML = `
        <div>Username</div>
        <div>Total Games</div>
        <div>Total Wins</div>
        <div>Total Losses</div>
        <div>Online</div>
        `;
        users.appendChild(usersTable);
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
            user.appendChild(username);
            user.appendChild(games);
            user.appendChild(wins);
            user.appendChild(losses);
            user.appendChild(is_online);
            users.appendChild(user);
        });
    }

    const removeAllUsers = () => {
        users.replaceChildren();
    }



    playerSearchInput.addEventListener('input', async (e) => {
        e.preventDefault();
        let current = e.target.value;
        await displayUsers(false, current);
        // now for this current value i need to send a request to the api 
    })
})();
// get the navbar header

