document.addEventListener("DOMContentLoaded", () => {
    // load the buttons for skill level in the container
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
    const removeSelection = (text,h1, container) => {
        h1.textContent = text;
        container.style.border = "2px solid rgb(100, 84, 84)";
    }
    select(newChessContainer, newChessContainerH1);

    let beginnerContainer = document.querySelector('.beginner-container');
    let beginnerContainerH1 = document.querySelector('.beginner-container h1');    

    let intermediateContainer = document.querySelector('.Intermediate-container');
    let intermediateContainerH1  = document.querySelector('.Intermediate-container h1');    

    let advancedContainer  = document.querySelector('.Advanced-container ');
    let advancedContainerH1 = document.querySelector('.Advanced-container  h1');    


    newChessContainer.addEventListener('click' , ()=> {
        removeSelection(selectedText,selectedH1,selectedcontainer);
        select(newChessContainer, newChessContainerH1);
    })


    beginnerContainer.addEventListener('click' , ()=> {
        removeSelection(selectedText,selectedH1,selectedcontainer);
        select(beginnerContainer, beginnerContainerH1);
    })

    intermediateContainer.addEventListener('click' , ()=> {
        removeSelection(selectedText,selectedH1,selectedcontainer);
        select(intermediateContainer, intermediateContainerH1);
    })
    advancedContainer.addEventListener('click' , ()=> {
        removeSelection(selectedText,selectedH1,selectedcontainer);
        select(advancedContainer, advancedContainerH1);
    })

    continueButton.addEventListener('click', () => {
        window.location.href = "/register?step=loginInfo"
    })


});


