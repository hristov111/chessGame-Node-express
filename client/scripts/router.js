import { extractAndSet } from "./utils/utils.js";

const pageConfig = {
    main: {
        scripts: ["/scripts/main-page.js"],
        styles: ["/styles/partials/modal-choose.css", "/styles/main.css", "/styles/partials/main-nav.css"]
    },
    game_panel: {
        scripts: ["/scripts/main-page-GAME-READY.js", "/scripts/chess_script.js"],
        styles: ["/styles/partials/main-nav-VERTICAL.css", "/styles/chess-style.css", "/styles/main-GAME-READY.css"],
    },
    login: {
        scripts: ["/scripts/login.js"],
        styles: ['https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css', "/styles/partials/main-nav.css", "/styles/index.css"],
    },
    createAccount: {
        scripts: ["scripts/registerPaths/createAcc.js"],
        styles: ["styles/registerPaths/createAccount.css"],
    },
    createSkill: {
        scripts: ["scripts/registerPaths/createSkillLevel.js"],
        styles: ["styles/registerPaths/createSkillLevel.css"]
    },
    loginInfo: {
        scripts: ["scripts/registerPaths/loginInfo.js"],
        styles: ["styles/registerPaths/loginInfo.css"],
    },

}


const loadScripts = async (scripts = []) => {
    document.querySelectorAll('script[data-dynamic-script]').forEach(s => s.remove());

    for (const src of scripts) {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.type = 'module';
                script.setAttribute('data-dynamic-script', 'true');
                script.onload = () => {
                    console.log(`Loaded script: ${src}`);
                    resolve();
                };
                script.onerror = (e) => {
                    console.error(` Failed to load script: ${src}`);
                    reject(e);
                };
                document.body.appendChild(script);
            });
        }catch(err){
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

const loadPage = async (page) => {
    const res = await fetch(`/pages/mainPaths/${page}.html`);
    const html = await res.text();
    document.querySelector(".app").innerHTML = html;

    const config = pageConfig[page] || {};
    await loadScripts(config.scripts || []);
    loadStyleSheets(config.styles || []);
}


const getPageFromPath = () => {
    const path = location.pathname;
    const segments = path.split('/');
    return segments[1] || 'main'; // '' =? 'main
}

// when the user clicks forward or backward button
window.addEventListener('popstate', () => {
    const page = getPageFromPath();
    loadPage(page);
})

// called when thje user click a button or link 
const navigate = async (page) => {
    history.pushState(null, '', `/${page}`);
    await loadPage(page);
}
document.addEventListener('DOMContentLoaded', async () => {
    const socket = io();

    let container = document.querySelector('.container');
    let navbar = document.querySelector('.navbar');
    let app = document.querySelector('.app');
    let footer = document.querySelector('.footer');
    // set the navbar
    await extractAndSet(navbar, '/pages/partials/main-navbar.html', null, ['/scripts/main-navbar.js']);




    await loadPage(getPageFromPath());
})

export { navigate };
