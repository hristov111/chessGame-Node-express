// here will be the whole logic for the game itself
import { checkSession, extractAndSet ,setProperButtons} from "./utils/utils.js";
import { fetchAllActivePlayers } from "./utils/utils.js";
document.addEventListener("DOMContentLoaded", async()=> {

    // get the navbar header
    let user;
    const session = await checkSession();
    if(session.isGuest){
        user = false;
    }else {
        user = true;
    }
    await fetchAllActivePlayers();


    // people playing - games today--------------------
    const peoplePlaying = document.querySelector('.people-playing');
    const gamesToday = document.querySelector('.games-today');
    //------------------------------------

    const loginNav = document.querySelector('#nav-login');
    const signUpNav = document.querySelector('.signup-btn');
    const guestMenu = document.querySelector('#guest-menu');
    const userMenu = document.querySelector('#user-menu');

    const opponent_name = document.querySelector('.opponent-name');
    const my_name = document.querySelector('.my-name');

    // start game button
    const start_gameButt = document.querySelector('.start-game');


    const playerBtn = document.querySelector('.user-btn');
    const playerSearchInput = document.querySelector('.play-user input');

    const users = document.querySelector('.users');


    // show players
    const show_players = document.querySelector('.show-players');

    show_players.addEventListener('click',async () => {
            playerSearchInput.style.display = 'block';
            users.style.display ='flex';
            await displayUsers(true);
    });


    if(localStorage.getItem('guestUser')){
        let text_name = JSON.parse(localStorage.getItem('guestUser')).guest_name;
        my_name.textContent = text_name;
    }

    if(!user){
        // user is not logged in
        loginNav.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/login';
        })
        signUpNav.addEventListener('click', () => {
            window.location.href = '/register';
        })
    }

    await setProperButtons();

    let board = document.querySelector('.board');




    const fetchAllPlayers = async () => {
        try {
            const response = await fetch('/api/users/players');
            console.log(await response.json());
            if(!response.ok){
                console.log("Request failed");
            }else {
                let users = await response.json();
                users.sort((first,next) => first.username.localeCompare(next.username));
                console.log(users);
                return users;
                
            }
        }catch(error){
            console.log("Error fetching users: ", error);
        }
    }

    const fetchUserByName = async(char) => {
        const response = await fetch(`/api/users/active?char=${char}`);
        if(!response.ok)console.log("Bad request");
        else {
            let users = await response.json();
            users.sort((first,next) => first.username.localeCompare(next.username));
            return users;
        }
    }

    const displayUsers = async (displayAll = true,findBychar = '') => {
        let active = await fetchAllPlayers();
        if(!displayAll){
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
            losses.classList= ['losses', "field"];
            losses.textContent = element.losses;
            const is_online = document.createElement('div');
            is_online.classList= ['is_online', "field"];
            is_online.textContent = element.online ? "✅":"❌" ;
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



    playerSearchInput.addEventListener('input' , async (e) => {
        e.preventDefault();
        let current = e.target.value;
        await displayUsers(false,current);
        // now for this current value i need to send a request to the api 
    })
})