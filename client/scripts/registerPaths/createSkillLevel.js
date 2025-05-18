// load the buttons for skill level in the container
import { navigate} from "../router.js";

( async() => {
    let container = document.querySelector('container');
    const continueButton = document.querySelector('.continue');
    let newChessContainer = document.querySelector('.new-to-chess-container');
    let newChessContainerH1 = document.querySelector('.new-to-chess-container h1');
    let selectedcontainer = newChessContainer;
    let selectedH1 = newChessContainerH1;
    let selectedText = selectedH1.textContent;
    const select = (container, h1) => {
        selectedText = h1.textContent;
        selectedH1 = h1;
        selectedcontainer = container;
        h1.textContent += " ✔";
        container.style.border = "2px solid green";
    }
    const removeSelection = (text, h1, container) => {
        h1.textContent = text;
        container.style.border = "2px solid rgb(100, 84, 84)";
    }
    select(newChessContainer, newChessContainerH1);

    let beginnerContainer = document.querySelector('.beginner-container');
    let beginnerContainerH1 = document.querySelector('.beginner-container h1');

    let intermediateContainer = document.querySelector('.Intermediate-container');
    let intermediateContainerH1 = document.querySelector('.Intermediate-container h1');

    let advancedContainer = document.querySelector('.Advanced-container ');
    let advancedContainerH1 = document.querySelector('.Advanced-container  h1');

    let SELECTED_LEVEL = 'NEW TO CHESS';


    newChessContainer.addEventListener('click', () => {
        removeSelection(selectedText, selectedH1, selectedcontainer);
        select(newChessContainer, newChessContainerH1);
        SELECTED_LEVEL = 'NEW TO CHESS';
    })


    beginnerContainer.addEventListener('click', () => {
        removeSelection(selectedText, selectedH1, selectedcontainer);
        select(beginnerContainer, beginnerContainerH1);
        SELECTED_LEVEL = "BEGINNER";
    })

    intermediateContainer.addEventListener('click', () => {
        removeSelection(selectedText, selectedH1, selectedcontainer);
        select(intermediateContainer, intermediateContainerH1);
        SELECTED_LEVEL = "INTERMEDIATE";
    })
    advancedContainer.addEventListener('click', () => {
        removeSelection(selectedText, selectedH1, selectedcontainer);
        select(advancedContainer, advancedContainerH1);
        SELECTED_LEVEL = "ADVANCED";
    })

    continueButton.addEventListener('click', async () => {
        sessionStorage.setItem("selected-level", SELECTED_LEVEL);
        await navigate("createAccount?step=loginInfo");
    })
})();






