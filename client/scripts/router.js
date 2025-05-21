const pageConfig = {
    main: {
        src: "/pages/mainPaths",
        navbar: "main-navbar",
        scripts: ["/scripts/main-page.js"],
        styles: ["/styles/partials/modal-choose.css", "/styles/main.css", "/styles/partials/main-nav.css"]

    },
    "game-panel": {
        src: "/pages/mainPaths",
        navbar: "main-navbar",
        scripts: ["/scripts/main-page-GAME-READY.js", "/scripts/chess_script.js"],
        styles: ["/styles/partials/modal-choose.css", "/styles/partials/main-nav-VERTICAL.css", 
            "/styles/chess-style.css"
            , "/styles/main-GAME-READY.css", "/styles/popupprofile.css"],
    },
    login: {
        src: "/pages/mainPaths",
        navbar: "main-navbar",
        scripts: ["/scripts/login.js"],
        styles: ['https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css', "/styles/partials/main-nav.css", "/styles/index.css"],
    },
    createAccount: {
        src: "/pages/registerPaths",
        navbar: "createAccountNavbar",
        scripts: ["/scripts/registerPaths/createAcc.js"],
        styles: ["/styles/registerPaths/createAccount.css"],
    },
    "createSkill-level": {
        src: "/pages/registerPaths",
        navbar: "createSkillLevelNavbar",
        scripts: ["/scripts/registerPaths/createSkillLevel.js"],
        styles: ["/styles/registerPaths/createSkillLevel.css"]
    },
    loginInfo: {
        src: "/pages/registerPaths",
        navbar: "createSkillLevelNavbar",
        scripts: ["/scripts/registerPaths/loginInfo.js"],
        styles: ["/styles/registerPaths/loginInfo.css"],
    },


    "main-navbar": {
        src: "/pages/partials/main-navbar.html",
        scripts: ["/scripts/main-navbar.js"],
        styles: [],
    },
    "createAccountNavbar": {
        src: "/pages/partials/createAccountNavbar.html",
        scripts: [],
        styles: [],
    },
    "createSkillLevelNavbar": {
        src: "/pages/partials/createSkillLevelNavbar.html",
        scripts: [],
        styles: [],
    }
}
let navbar = document.querySelector('.navbar');

const loadscript = (url) => {
    const noCacheUrl = `${url}?v=${Date.now()}`;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = noCacheUrl;
        script.type = 'module';
        script.setAttribute('data-dynamic-script', 'true');
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

const loadScripts = async (scripts = []) => {
    document.querySelectorAll('script[data-dynamic-script]').forEach(s => s.remove());

    for (const src of scripts) {
        try {
            await loadscript(src);
        } catch (err) {
            console.warn(`Skipping failed script: ${src}`);
        }
    }

}



const loadStyleSheets = (styles = []) => {
    // remove old
    document.querySelectorAll('link[data-dynamic-style]').forEach(s => s.remove());


    for (const href of styles) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-dynamic-style', 'true');
        document.head.appendChild(link);
    }
}

const loadPage = async (page, htmlInject = null, loadingScr = true, loadingStyles = true, loadNavbar = true) => {
    const config = pageConfig[page] || {};
    const pageconfigNav = pageConfig[config.navbar] || {};
    let res = await fetch(`${config.src}/${page}.html`);

    const html = await res.text();
    if (!htmlInject) {
        document.querySelector(".app").innerHTML = html;

    } else {
        htmlInject.innerHTML = html;
    }
    if (loadNavbar) {
        // load nav html
        res = await fetch(pageconfigNav.src);
        const navhtml = await res.text();
        navbar.innerHTML = navhtml;
    }
    if (loadingScr) await loadScripts([
        ...(config.scripts || []),
        ...(pageconfigNav.scripts || [])
    ]);

    if (loadingStyles) loadStyleSheets([
        ...(config.styles || []),
        ...(pageconfigNav.styles || [])
    ]);

}


const getPageFromPath = () => {
    const path = location.pathname.slice(1);
    const params = new URLSearchParams(location.search);
    const step = params.get("step");
    return step || path || 'main';
}

// when the user clicks forward or backward button
window.addEventListener('popstate', async (e) => {
    await loadPage(getPageFromPath());
})

// called when thje user click a button or link 
const navigate = async (page, pagePath = null) => {
    const [base, query] = page.split('?');
    const params = new URLSearchParams(query);
    const step = params.get("step");

    const fileToLoad = step || base;
    const url = query ? `/${base}?${query}` : `/${base}`
    history.pushState(null, '', url);
    await loadPage(fileToLoad, pagePath);
}
const socket = io();

const findgame = async(userId) => {
    socket.emit('find-game', userId);

}

(async () => {
    let container = document.querySelector('.container');
    let app = document.querySelector('.app');
    let footer = document.querySelector('.footer');

    const sendInvite = (opponentId) => {
        socket.emit('send-invite', { opponentId, from: socket.id });
    }
    socket.on('connect', () => {
    })

    socket.on("receive-invite", ({from, fromSocketId}) => {
        const accpet = confirm(`Player ${from} invited you to a game. Accept or not`);
        if(accpet){
            const roomId = `${fromSocketId}_${socket.id}`;
            socket.emit('accept-invite', {toSocketId: fromSocketId, roomId});

        }else {
            socket.emit('decline-invite', {toSocketId: fromSocketId});

        }
    })  

    socket.on('invite-accepted', ({roomId}) => {
        socket.join(roomId);
        
    })
    socket.on('Invite-declined', () => {
        // declined invite
    })


    function sendMove(roomId,move){
        socket.emit('move', {reemid, move});
    }
    socket.on('opponent-move', (move) => {
        console.log(JSON.stringify(move));
    })

    function resign(roomId){
        socket.emit('resign', {roomId, reason: "Resignation"});
    }

    socket.on("game-ended", ({reason}) => {
        // game ended type shi
    })

    // set the navbar
    // await extractAndSet(navbar, '/pages/partials/main-navbar.html', null, ['/scripts/main-navbar.js']);


    // default;
    //await loadPage("main-navbar", "/pages/partials", navbar);
    await loadPage(getPageFromPath());

})();

export { navigate, loadPage, navbar ,findgame,socket};
