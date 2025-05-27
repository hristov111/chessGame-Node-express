// const socket = io("http://localhost:3000");


// socket.on("connect", () => {
//     console.log(`connected with ${socket.id}`);
// })

import { socket, sendMove,signalForCheck } from "./router.js";
import { calculateTimer } from "/scripts/utils/utils.js"


(async () => {
    let table = [];
    let turn;
    let GLmy_color;
    let GLopponent_color;
    let GLroomId;

    const movesDisplay = document.querySelector('.game-started-moves');


    const displayMoves = (display, from, to, color) => {
        const h1 = document.createElement('h1');
        h1.innerText = `${color.padEnd(6)} ${from} ---> ${to}`;
        display.appendChild(h1);
    }

    const user = JSON.parse(localStorage.getItem("guestUser"));



    let figures = {
        king: ["/chess-images/king.png", "/chess-images/king_black.png"],
        queen: ["/chess-images/queen.png", "/chess-images/queen_black.png"],
        bishop: ["/chess-images/bishop.png", "/chess-images/bishop_black.png"],
        horse: ["/chess-images/horse.png", "/chess-images/horse_black.png"],
        pawn: ["/chess-images/pawn.png", "/chess-images/pawn_black.png"],
        rook: ["/chess-images/rook.png", "/chess-images/rook_black.png"],
        takeBlack(figure) {
            return this[figure][1];
        },
        takeWhite(figure) {
            return this[figure][0];
        }

    };

    class Figure {
        #available_positions = [];
        image_path;
        constructor(type, color, position) {
            this.color = color;
            this.position = position;
            this.type = type;
            if (color !== "" && type !== "") {
                this.image_path = color === "black" ? figures.takeBlack(type) : figures.takeWhite(type);
                this.enemy_color = color === "black" ? "white" : "black";
                let square_divs = document.querySelectorAll('.square');
                let figure_img = document.createElement("img");
                figure_img.src = this.image_path;
                figure_img.width = 83;
                figure_img.height = 83;
                square_divs[this.position].appendChild(figure_img);
            }

        }
        static create(type, color, position) {
            if (type === "king") return new King(color, position);
            else if (type === "queen") return new Queen(color, position);
            else if (type === "rook") return new Rook(color, position);
            else if (type === "bishop") return new Bishop(color, position);
            else if (type === "horse") return new Horse(color, position);
            else if (type === "pawn") return new Pawn(color, position);
            else return new Figure("", "", position);
        }
        calculateMoves() { }
        get available_positions() {
            return this.#available_positions;
        }
        set position(pos) {
            this._position = pos;

        }
        get position() {
            return this._position;
        }
        get image_path() {
            return this._image_path;
        }
        set image_path(img) {
            this._image_path = img;
        }

        static getElementFromTable = (idx) => {
            if (idx > 63 || idx < 0) return -1;
            return table.find(el => el.position === idx) || -1;
        }
        static checkLeftBounds = (pos) => {
            return pos % 8 === 0 ? true : false;
        }
        static checkRightBounds = (pos) => {
            return (pos + 1) % 8 === 0 ? true : false;
        }
        static concurPosition = (element, color) => {
            if (element.type === "" || element.color !== color) return true
            else return false;
        }
        static isEnemy = (element, color) => {
            if (element.enemy_color === color) return true;
            else return false;
        }
        static movesFromLeft = (pos) => {
            let count = 0;
            let i = pos - 1;
            if (this.checkLeftBounds(pos)) return count;
            while (!this.checkLeftBounds(i)) {
                i--;
                count++;
            }
            count++;
            return count;
        }
        static movesFromRight = (pos) => {
            let count = 0;
            let i = pos + 1;
            if (this.checkRightBounds(pos)) return count;
            while (!this.checkRightBounds(i)) {
                i++;
                count++;
            }
            count++;
            return count;
        }

        static movesFromDown = (pos) => {
            let count = 0;
            let i = pos;
            if (i > 55) return count;
            while (true) {
                i += 8;
                if (i > 63 || i > 55) break;
                count++;
            }
        }
        static movesFromUp = (pos) => {
            let count = 0;
            let i = pos;
            if (i < 8) return count;
            while (true) {
                i -= 8;
                if (i < 0 || i < 8) break;
                count++;
            }
        }
        static getMoves(color, currentPos, step, first_Condition, second_Condition, third_Condition) {
            let moves = [];
            let enemy;
            for (let i = currentPos + step; first_Condition(i, currentPos); i += step) {
                enemy = this.getElementFromTable(i);
                if (second_Condition(enemy, color, currentPos)) {
                    moves.push(enemy);
                    if (third_Condition(enemy, color, i)) break;
                } else {
                    break;
                }
            }
            return moves;
        }



    }
    const StraightMover = {
        getStraightMoves(color, pos) {
            let moves = [];

            // Up
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -8,
                (i) => i >= 0,
                (up, c) => Figure.concurPosition(up, c),
                (up, c) => Figure.isEnemy(up, c)
            ));
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                8,
                (i) => i < 64,
                (down, c) => Figure.concurPosition(down, c),
                (down, c) => Figure.isEnemy(down, c)

            ));

            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -1,
                // args[0] will be the i
                (i, pos) => i >= pos - Figure.movesFromLeft(pos),
                (left, c) => Figure.concurPosition(left, c),
                (left, c) => Figure.isEnemy(left, c)
            ))



            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                1,
                (i, pos) => i <= pos + Figure.movesFromRight(pos),
                (right, c) => Figure.concurPosition(right, c),
                (right, c) => Figure.isEnemy(right, c)
            ))
            return moves;
        }
    }
    const DiagonalMover = {
        getDiagonalMoves(color, pos) {
            let moves = [];

            if (!Figure.checkLeftBounds(pos)) {
                moves = moves.concat(Figure.getMoves(
                    color,
                    pos,
                    -9,
                    (i) => i >= 0,
                    (up_left_enemy, my_color) => Figure.concurPosition(up_left_enemy, my_color),
                    (pos, color, i) => Figure.isEnemy(pos, color) || Figure.checkLeftBounds(i)
                ))

                moves = moves.concat(Figure.getMoves(
                    color,
                    pos,
                    7,
                    (i) => i < 64,
                    (down_left, c) => Figure.concurPosition(down_left, c),
                    (pos, color, i) => Figure.isEnemy(pos, color) || Figure.checkLeftBounds(i)
                ))
            }

            if (!Figure.checkRightBounds(pos)) {
                moves = moves.concat(Figure.getMoves(
                    color,
                    pos,
                    -7,
                    (i) => i >= 0,
                    (up_right_enemy, my_color) => Figure.concurPosition(up_right_enemy, my_color),
                    (pos, color, i) => Figure.isEnemy(pos, color) || Figure.checkRightBounds(i)
                ))


                moves = moves.concat(Figure.getMoves(
                    color,
                    pos,
                    9,
                    (i) => i < 64,
                    (down_right, c) => Figure.concurPosition(down_right, c),
                    (pos, color, i) => Figure.isEnemy(pos, color) || Figure.checkRightBounds(i)
                ))
            }
            return moves;
        }
    }
    class Pawn extends Figure {

        constructor(color, position) {
            super("pawn", color, position);
        }
        calculateMoves() {
            // let moves = [];
            let oneStepPos = Figure.getElementFromTable(this.position - 8);




            let available_moves = [];
            if (oneStepPos !== -1) {
                if (oneStepPos.type === "") available_moves.push(oneStepPos);
                let twoStepPos = Figure.getElementFromTable(this.position - 16);
                if (twoStepPos !== -1 && twoStepPos.type === "" && this.position > 47) available_moves.push(twoStepPos);

            }
            let right = Figure.getElementFromTable(this.position - 7);
            let left = Figure.getElementFromTable(this.position - 9);
            if (Figure.checkLeftBounds(this.position)) {
                if (right.color === this.enemy_color) available_moves.push(right);
            }
            else if (Figure.checkRightBounds(this.position)) {
                if (left.color === this.enemy_color) available_moves.push(left);
            }
            else {
                if (right.color === this.enemy_color) available_moves.push(right);
                if (left.color === this.enemy_color) available_moves.push(left);
            }
            return available_moves;
        }

    }
    class Queen extends Figure {
        constructor(color, position) {
            super("queen", color, position);
            Object.assign(this, StraightMover, DiagonalMover);
        }
        calculateMoves() {
            return [...this.getStraightMoves(this.color, this.position), ...this.getDiagonalMoves(this.color, this.position)]
        }
    }
    class King extends Figure {
        constructor(color, position) {
            super("king", color, position);
        }

        calculateMoves() {
            let moves = [];
            // in order to have a left new need to have 1 pos from left so 
            let left = Figure.getElementFromTable(this.position - 1);
            let up_left = Figure.getElementFromTable(this.position - 9);
            let down_left = Figure.getElementFromTable(this.position + 7);
            let right = Figure.getElementFromTable(this.position + 1);
            let up_right = Figure.getElementFromTable(this.position - 7);
            let down_right = Figure.getElementFromTable(this.position + 9);
            let up = Figure.getElementFromTable(this.position - 8);
            let down = Figure.getElementFromTable(this.position + 8);


            if (Figure.movesFromLeft(this.position) >= 1 && Figure.concurPosition(left, this.color)) moves.push(left);
            if (this.position > 7 && Figure.movesFromLeft(this.position) >= 1 && Figure.concurPosition(up_left, this.color)) moves.push(up_left);
            if (this.position < 56 && Figure.movesFromLeft(this.position) >= 1 && Figure.concurPosition(down_left, this.color)) moves.push(down_left);
            if (Figure.movesFromRight(this.position) >= 1 && Figure.concurPosition(right, this.color)) moves.push(right);
            if (this.position > 7 && Figure.movesFromRight(this.position) >= 1 && Figure.concurPosition(up_right, this.color)) moves.push(up_right);
            if (this.position < 56 && Figure.movesFromRight(this.position) >= 1 && Figure.concurPosition(down_right, this.color)) moves.push(down_right);
            if (this.position > 7 && Figure.concurPosition(up, this.color)) moves.push(up);
            if (this.position < 56 && Figure.concurPosition(down, this.color)) moves.push(down);
            return moves;
        }
    }

    class Bishop extends Figure {
        constructor(color, position) {
            super("bishop", color, position);
            Object.assign(this, DiagonalMover);
        }
        calculateMoves() {
            return this.getDiagonalMoves(this.color, this.position);
        }
    }


    class Horse extends Figure {
        constructor(color, position) {
            super("horse", color, position);
        }
        calculateMoves() {
            let moves = [];
            let up_long_left = Figure.getElementFromTable(this.position - 10);
            let up_long_right = Figure.getElementFromTable(this.position - 6);
            let down_long_right = Figure.getElementFromTable(this.position + 10);
            let down_long_left = Figure.getElementFromTable(this.position + 6);
            let up_short_left = Figure.getElementFromTable(this.position - 17);
            let up_short_right = Figure.getElementFromTable(this.position - 15);
            let down_short_right = Figure.getElementFromTable(this.position + 17);
            let down_short_left = Figure.getElementFromTable(this.position + 15);
            let moves_fromLeft = Figure.movesFromLeft(this.position);
            let moves_fromRight = Figure.movesFromRight(this.position);

            // to make a up-long left the position of the horse must be > 7 
            // and movesFromLeft must return bigger or eq to 2
            if (this.position > 7 && moves_fromLeft >= 2 && Figure.concurPosition(up_long_left, this.color)) moves.push(up_long_left);
            // to make up-long left the pos of the horse mus be again > 7
            // and movesRight mus return bigger than or eq to 2
            if (this.position > 7 && moves_fromRight >= 2 && Figure.concurPosition(up_long_right, this.color)) moves.push(up_long_right);
            // to make down-long-right the position of the horse must be < 56 
            // and movesRight must return bigger than or eq to 2
            if (this.position < 56 && moves_fromRight >= 2 && Figure.concurPosition(down_long_right, this.color)) moves.push(down_long_right);
            // to make a down long 
            if (this.position < 56 && moves_fromLeft >= 2 && Figure.concurPosition(down_long_left, this.color)) moves.push(down_long_left);

            if (this.position > 15 && moves_fromLeft >= 1 && Figure.concurPosition(up_short_left, this.color)) moves.push(up_short_left);
            if (this.position > 15 && moves_fromRight >= 1 && Figure.concurPosition(up_short_right, this.color)) moves.push(up_short_right);
            if (this.position < 48 && moves_fromRight >= 1 && Figure.concurPosition(down_short_right, this.color)) moves.push(down_short_right);
            if (this.position < 48 && moves_fromLeft >= 1 && Figure.concurPosition(down_short_left, this.color)) moves.push(down_short_left);

            return moves;
        }
    }
    class Rook extends Figure {
        constructor(color, position) {
            super("rook", color, position);
            Object.assign(this, StraightMover);
        }
        calculateMoves() {
            return this.getStraightMoves(this.color, this.position);
        }
    }
    // Global variables
    let last_button;
    let square_buttonsArray = [];
    let clicked = false;
    let last_moves = [];

    const untoggleButton = () => {
        square_buttonsArray.forEach(el => {
            el.style.opacity = '1';
        });
        last_button = undefined;
        clicked = false;
        last_moves.forEach(el => {
            if (el) el.removeEventListener('click', makeMove);
        });
        last_moves = [];
    };

    const clearLastMovesArray = () => {
        last_moves.forEach(el => {
            if (el) el.removeEventListener('click', makeMove);
        });
        last_moves = [];
    };

    const findHtmlelementByIDX = (idx) => {
        let square_buttons = document.querySelectorAll('.square');
        for (let square of square_buttons) {
            if (Number(square.classList[1]) === idx) return square;
        }
        return undefined;
    };

    const makeOpponentMove = (from, to) => {
        const parentFig = Figure.getElementFromTable(from);
        const enemyFig = Figure.getElementFromTable(to);
        const parentHTML = findHtmlelementByIDX(from);
        const enemyHTML = findHtmlelementByIDX(to);

        if (parentHTML?.firstElementChild) parentHTML.firstElementChild.remove();
        if (enemyFig?.image_path && enemyHTML?.firstElementChild) enemyHTML.firstElementChild.remove();

        table[from] = Figure.create("", "", from);
        table[to] = Figure.create(parentFig.type, parentFig.color, to);
    };

    const putfigure = (from, figureToPut, figure) => {
        const parentHTML = findHtmlelementByIDX(figure._position);
        const fromHTML = findHtmlelementByIDX(from);
        table[Number(from)] = Figure.create('', '', Number(from));
        if (parentHTML?.firstElementChild) parentHTML.firstElementChild.remove();
        if (fromHTML?.firstElementChild) fromHTML.firstElementChild.remove();
        console.log(figureToPut, figure);
        table[figure._position] = Figure.create(figureToPut.type, figureToPut.color, figure._position);

    }

    const makeMove = (event) => {
        let enemy_pos = Number(event.currentTarget.classList[1]);
        let parent_pos = Number(last_button.classList[1]);
        let enemy_fig = Figure.getElementFromTable(enemy_pos);
        let parent_fig = Figure.getElementFromTable(parent_pos);
        let enemy_idx = table.indexOf(enemy_fig);
        let parent_idx = table.indexOf(parent_fig);
        let rebirth = false;
        if (parent_fig.type === "pawn" && enemy_fig.position >= 0 && enemy_fig.position <= 7) rebirth = true;
        if (last_button?.firstElementChild) last_button.firstElementChild.remove();
        if (enemy_fig?.image_path && event.currentTarget.firstElementChild)
            event.currentTarget.firstElementChild.remove();


        table[parent_idx] = Figure.create("", "", parent_pos);
        table[enemy_idx] = Figure.create(parent_fig.type, parent_fig.color, enemy_pos)

        sendMove(GLroomId, turn, parent_pos, enemy_pos, enemy_fig, parent_fig);
        if (!rebirth) {
            turn = GLopponent_color;
            switchTurns();
        }
        // check for check
        const newFigure = table[enemy_idx];
        const moves = newFigure.calculateMoves();
        moves.forEach(el => {
            if(el.type === 'king'){
                // we have a check here
                signalForCheck(GLroomId,GLmy_color,el);
            }
        })

        untoggleButton();
    };

    function GAME(opponent_color, my_color) {
        const square_buttons = document.querySelectorAll('.square');
        square_buttonsArray = Array.from(square_buttons);
        clicked = false;
        last_moves = [];

        square_buttonsArray.forEach((button) => {
            button.addEventListener('click', () => {
                const idx = Number(button.classList[1]);
                const figure = Figure.getElementFromTable(idx);

                if (figure.type !== "" && figure.color === my_color && turn === my_color) {
                    clicked = true;

                    if (last_button === button) {
                        untoggleButton();
                        return;
                    } else {
                        last_button = button;
                    }

                    clearLastMovesArray();

                    const moves = figure.calculateMoves();

                    if (moves?.length > 0) {
                        square_buttonsArray.forEach(el => el.style.opacity = "0.5");
                    } else {
                        return;
                    }

                    button.style.opacity = "1";
                    last_moves = moves.map(move => {
                        let btn = square_buttonsArray.find(butt => Number(butt.classList[1]) === move.position);
                        if (btn) {
                            btn.style.opacity = '1';
                            btn.addEventListener('click', makeMove);
                        }
                        return btn;
                    }).filter(Boolean);

                } else {
                    if (last_moves.includes(button)) return;

                    if (clicked) {
                        untoggleButton();
                    }
                }
            });
        });
    }

    function createChessBoard() {
        let board = document.querySelector('.ChessBoard');
        board.innerHTML = '';
        let id = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let square = document.createElement("button");
                square.classList.add("square");
                square.classList.add(id);
                if ((row + col) % 2 === 0) {
                    square.classList.add('white');
                } else square.classList.add('black');
                if (!turn) {
                    square.disabled = true;
                }
                board.appendChild(square);
                id++;

            }
        }
    }
    const align_opponnet = (color) => {
        table.push(Figure.create("rook", color, 0));
        table.push(Figure.create("horse", color, 1));
        table.push(Figure.create("bishop", color, 2));
        table.push(Figure.create("queen", color, 3));
        table.push(Figure.create("king", color, 4));
        table.push(Figure.create("bishop", color, 5));
        table.push(Figure.create("horse", color, 6));
        table.push(Figure.create("rook", color, 7));
        for (let i = 8; i < 16; ++i) {
            table.push(new Pawn(color, i));
        }

    }
    const align_me = (color) => {
        for (let i = 48; i < 56; i++) {
            table.push(new Pawn(color, i));
        }
        table.push(Figure.create("rook", color, 56));
        table.push(Figure.create("horse", color, 57));
        table.push(Figure.create("bishop", color, 58));
        table.push(new Queen(color, 59));
        table.push(new King(color, 60));
        table.push(Figure.create("bishop", color, 61));
        table.push(Figure.create("horse", color, 62));
        table.push(Figure.create("rook", color, 63));
    }

    function alignStart(opponent_color, my_color) {
        table = [];
        align_opponnet(opponent_color);
        for (let i = 16; i < 48; i++) {
            table.push(new Figure("", "", i));
        }
        align_me(my_color);


    }
    const setNextTurn = () => {
        if (current_Timer.classList.contains("opponent-timer")) {
            current_Timer = document.querySelector('.my-time');
        } else {
            current_Timer = document.querySelector('.opponent-time');
        }
        turn == "black" ? "white" : "black";
    }
    // const timerEnds = () => {
    //     setNextTurn();
    //     startTimer(600, current_Timer, timerEnds);
    // }

    const renderFromTable = (newTable) => {
        table = [];
        for (let record of newTable) {
            table.push(Figure.create(record.type, record.color, record._position));

        }
    }

    const switchTurns = () => {
        document.querySelector('.opponent-time').innerText = '10:00';
        document.querySelector('.my-time').innerText = '10:00';
        current_Timer = turn == GLmy_color ?
            document.querySelector('.my-time') :
            document.querySelector('.opponent-time');
    }
    const opponet_timer = document.querySelector('.opponent-time');
    const my_timer = document.querySelector('.my-time');
    let current_Timer;
    const opponent_name = document.querySelector('.opponent-name');
    const opponent_pic = document.querySelector('.person img');

    const pawnSelectionModal = document.querySelector('.pawnSelection');
    const figureRestoreDiv = document.querySelector('.figures-restore');

    const pawnAtEndsituation = ({ roomId, player, from, posToSwap, captured }) => {
        pawnSelectionModal.classList.remove('hide-pawnSelection');
        console.log(roomId, player, from, posToSwap, captured );
        captured.forEach(el => {
            const img = document.createElement('img');
            img.src = el.image_path
            figureRestoreDiv.appendChild(img);
            img.addEventListener('click', () => {
                pawnSelectionModal.classList.add('hide-pawnSelection');
                figureRestoreDiv.innerHTML = '';
                putfigure(from, el, posToSwap);
                console.log(posToSwap);
                socket.emit("swapFigures", ({ roomId, player, from, chosenElement: el, posToSwap }));
                turn = GLopponent_color;
                switchTurns();
                sessionStorage.setItem("pawnAtEnd", "false");
                sessionStorage.removeItem("pawnAtEndData");
            })

        })
    }



    const InitializeSocketEvents = () => {
        socket.off('game-ready');
        socket.on('game-ready', async ({ roomId, color, opponent_color, timer }) => {
            GLroomId = roomId;
            GLopponent_color = opponent_color;
            GLmy_color = color;
            if (timer) {
                turn = color
                current_Timer = document.querySelector('.my-time');
            }
            else {
                current_Timer = document.querySelector('.opponent-time');
                turn = opponent_color;
            }
            createChessBoard();
            alignStart(GLopponent_color, GLmy_color);
            socket.emit('get-table-one-time', {
                roomId: GLroomId,
                player: GLmy_color,
                table: table
            });
            GAME(GLopponent_color, GLmy_color);
            localStorage.setItem("gameReady", "true")

        })
        socket.off("timer-update");
        socket.on('timer-update', ({ whiteTime, blackTime, turn }) => {
            if (turn === 'white') calculateTimer(whiteTime, current_Timer);
            else calculateTimer(blackTime, current_Timer);

        })
        socket.on("pawnAtEnd", ({ roomId, player, from, posToSwap, captured }) => {
            // show the screen so user can choose a figure
            sessionStorage.setItem("pawnAtEnd", "true");
            sessionStorage.setItem("pawnAtEndData", JSON.stringify({ roomId, player, from, posToSwap, captured }))
            pawnAtEndsituation({ roomId, player, from, posToSwap, captured });
        })
        socket.on("syncTable", ({ my_table }) => {
            renderFromTable(my_table);
        })
        socket.off("get_currentMove");
        socket.on("get_currentMove", ({ move }) => {
            displayMoves(movesDisplay, move.from, move.to, move.player);
        })
        // socket.on("get-allMoves", ({ moves }) => {

        // })
        // we will threat from to with indexes
        // here we need to switch timers 
        socket.off("opponentMove");
        socket.on('opponentMove', (data) => {
            const { from, to, currentTurn } = data;
            console.log("moving opponent");
            makeOpponentMove(from, to);
            turn = currentTurn;
            switchTurns();

        })

        socket.on("putFigure", (data) => {
            const { from, chosenElement, posToSwap, currentTurn } = data;
            turn = currentTurn;
            switchTurns();
            putfigure(from, chosenElement, posToSwap)

        })
        socket.on("time-out", ({ currentTurn }) => {
            turn = currentTurn;
            switchTurns();
        })
        socket.off("rejoined");
        socket.on("rejoined", ({ table, moves, roomId, player1, player2, currentTurn, whiteTime, blackTime }) => {
            const enemy = JSON.parse(localStorage.getItem("guestOpponent"))
            GLroomId = roomId;
            if (user.value.id === player1.id) {
                GLmy_color = player1.color;
                GLopponent_color = player2.color
            } else if (user.value.id === player2.id) {
                GLmy_color = player2.color;
                GLopponent_color = player1.color;
            }
            turn = currentTurn;
            if (turn === GLmy_color) current_Timer = document.querySelector('.my-time');
            else current_Timer = document.querySelector('.opponent-time');
            opponent_name.textContent = enemy.username
            if (enemy.profile_picture) opponent_pic.src = enemy.profile_picture;
            createChessBoard();
            renderFromTable(table);
            GAME(GLopponent_color, GLmy_color);
            // opponent_name.textContent = localStorage.getItem('')
            // render the moves 
            window.dispatchEvent(new Event('game-on'));
            moves.forEach(move => {
                displayMoves(movesDisplay, move.from, move.to, move.player);
            })

        })

    }


    function onSocketReady() {
        InitializeSocketEvents();
        window.removeEventListener('socket-ready', onSocketReady); // auto-cleanup
        console.log("socket ready")
        if (sessionStorage.getItem("pawnAtEnd") === 'true') {
            console.log("getting paswAtEnd");
            const data = JSON.parse(sessionStorage.getItem("pawnAtEndData"));
            pawnAtEndsituation(data);
        }
    }

    if (window.socket) {
        InitializeSocketEvents();
    } else {
        window.removeEventListener('socket-ready', onSocketReady); // just in case
        window.addEventListener('socket-ready', onSocketReady);
    }


    if (localStorage.getItem("gameHasStarted") === "false" || !localStorage.getItem("gameHasStarted")) {
        createChessBoard();
        alignStart("black", "white");
        console.log(table);
    }


})();






