// const socket = io("http://localhost:3000");


// socket.on("connect", () => {
//     console.log(`connected with ${socket.id}`);
// })

import { socket, sendMove } from "./router.js";
import { calculateTimer } from "/scripts/utils/utils.js"


(async () => {
    let table = [];
    let turn;
    let GLmy_color;
    let GLopponent_color;
    let GLroomId;
    let check = false;
    let allowedMoves = {};

    const movesDisplay = document.querySelector('.game-started-moves');

    const showChessAlert = (message) => {
        const modal = document.getElementById('alertModal');
        modal.textContent = message;
        modal.classList.add('show');


        setTimeout(() => {
            modal.classList.remove('show');
        }, 2000);

    }

    const blinkRedJS = (el, times = 3, interval = 3000) => {
        let count = 0;
        const originalColor = el.style.backgroundColor;
        const blink = setInterval(() => {
            el.style.backgroundColor = (el.style.backgroundColor === 'red') ? originalColor : "red";
            count++;
            if (count > times * 2) {
                clearInterval(blink);
                el.style.backgroundColor = originalColor;
            }
        }, interval);

    }


    const displayMoves = (display, from, to, color, check) => {
        const checked = color === "white" ? "black" : "white";
        const h1 = document.createElement('h1');
        if (check) {
            const h1Check = document.createElement('h1');
            h1Check.innerText = `${checked.padEnd(6)} is in check`;
            display.appendChild(h1);

        }
        h1.innerText = `${color.padEnd(6)} ${from} ---> ${to}`;
        display.appendChild(h1);
    }

    const user = JSON.parse(localStorage.getItem("guestUser"));

    const getFiguresByColor = (color, table_toUse) => {
        let colorTable = [];
        table_toUse.forEach(el => {
            if (el.color === color) {
                colorTable.push(el);
            }
        })
        return colorTable;
    }

    const simulateMoveForCheck = (figure, move, copyTable) => {
        const copy = copyTable.map(f => f ? Figure.create(f.type, f.color, f.position) : null);
        // simulate the move
        copy[move.position] = Figure.create(figure.type, figure.color, move.position);
        copy[figure.position] = Figure.create('', '', figure.position);
        const opponentFigures = getFiguresByColor(GLopponent_color, copy);
        // now take the 
        for (const el of opponentFigures) {
            const moves = el.calculateMoves(copy);
            for (const move of moves) {
                if (move.type === 'king') return false;
            }
        }
        return true;
    }



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
            this.iswhite = this.color === 'white';

        }
        render() {
            if (this.color !== "" && this.type !== "") {
                this.image_path = this.color === "black" ? figures.takeBlack(this.type) : figures.takeWhite(this.type);
                this.enemy_color = this.color === "black" ? "white" : "black";

                let square = document.querySelector(`.square[data-index="${this.position}"]`);
                if (square) {
                    let figure_img = document.createElement("img");
                    figure_img.src = this.image_path;
                    figure_img.width = 83;
                    figure_img.height = 83;
                    square.appendChild(figure_img);
                }
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
        calculateMoves(table) { }
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

        static getElementFromTable = (idx, table) => {
            if (idx > 63 || idx < 0) return -1;
            return table.find(el => el.position === idx) || -1;
        }
        static checkLeftBounds(pos) {
            // True if the square is on the 'a' file (left edge)
            return pos % 8 === 0;
        }

        static checkRightBounds(pos) {
            // True if the square is on the 'h' file (right edge)
            return (pos + 1) % 8 === 0;
        }
        static concurPosition = (element, color) => {
            if (element.type === "" || element.color !== color) return true
            else return false;
        }
        static isEnemy = (element, color) => {
            if (element.enemy_color === color) return true;
            else return false;
        }
        static movesFromLeft(pos) {
            return pos % 8; // Distance to the left edge (0 to 7)
        }

        static movesFromRight(pos) {
            return 7 - (pos % 8); // Distance to the right edge (0 to 7)
        }

        static movesFromUp(pos) {
            return Math.floor(pos / 8); // How many rows are above
        }

        static movesFromDown(pos) {
            return 7 - Math.floor(pos / 8); // How many rows are below
        }
        static getMoves(color, currentPos, step, first_Condition, table) {
            let moves = [];

            for (let i = currentPos + step; first_Condition(i, currentPos); i += step) {
                const target = this.getElementFromTable(i, table);

                if (target.type === "") {
                    // Empty square: can move through
                    moves.push(target);
                } else if (target.color !== color) {
                    // Enemy piece: can capture, but stop after
                    moves.push(target);
                    break;
                } else {
                    // Friendly piece: cannot move or continue
                    break;
                }
            }

            return moves;
        }



    }
    const StraightMover = {
        getStraightMoves(color, pos, table) {
            let moves = [];

            // Up
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -8,
                (i) => i >= 0,
                table
            ));

            // Down
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                8,
                (i) => i < 64,
                table
            ));

            // Left
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -1,
                (i, pos) => i >= pos - Figure.movesFromLeft(pos),
                table
            ));

            // Right
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                1,
                (i, pos) => i <= pos + Figure.movesFromRight(pos),
                table
            ));

            return moves;
        }
    }
    const DiagonalMover = {
        getDiagonalMoves(color, pos, table) {
            let moves = [];

            // Up-Left (-9)
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -9,
                (i, p) => i >= 0 && Figure.movesFromLeft(i) < Figure.movesFromLeft(p),
                table
            ));

            // Down-Left (+7)
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                7,
                (i, p) => i < 64 && Figure.movesFromLeft(i) < Figure.movesFromLeft(p),
                table
            ));

            // Up-Right (-7)
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -7,
                (i, p) => i >= 0 && Figure.movesFromRight(i) < Figure.movesFromRight(p),
                table
            ));

            // Down-Right (+9)
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                9,
                (i, p) => i < 64 && Figure.movesFromRight(i) < Figure.movesFromRight(p),
                table
            ));

            return moves;
        }
    }
    class Pawn extends Figure {
        constructor(color, position) {
            super("pawn", color, position);
        }

        calculateMoves(table) {
            const direction = this.color === 'white' ? -1 : 1;
            const startRow = this.color === 'white' ? 6 : 1; // rows 6 (index 48–55) or 1 (8–15)
            const pos = this.position;
            const available_moves = [];

            // One step forward
            const oneStep = Figure.getElementFromTable(pos + 8 * direction, table);
            if (oneStep !== -1 && oneStep.type === "") {
                available_moves.push(oneStep);

                // Two steps forward from starting row
                const isStartRow = Math.floor(pos / 8) === startRow;
                const twoStep = Figure.getElementFromTable(pos + 16 * direction, table);
                if (isStartRow && twoStep !== -1 && twoStep.type === "") {
                    available_moves.push(twoStep);
                }
            }

            // Diagonal captures
            const rightCapture = Figure.getElementFromTable(pos + 9 * direction, table);
            const leftCapture = Figure.getElementFromTable(pos + 7 * direction, table);

            if (Figure.movesFromRight(pos) > 0 && rightCapture !== -1 && rightCapture.color === this.enemy_color) {
                available_moves.push(rightCapture);
            }

            if (Figure.movesFromLeft(pos) > 0 && leftCapture !== -1 && leftCapture.color === this.enemy_color) {
                available_moves.push(leftCapture);
            }

            return available_moves;
        }
    }
    class Queen extends Figure {
        constructor(color, position) {
            super("queen", color, position);
            Object.assign(this, StraightMover, DiagonalMover);
        }
        calculateMoves(table) {
            return [...this.getStraightMoves(this.color, this.position, table), ...this.getDiagonalMoves(this.color, this.position, table)]
        }
    }
    class King extends Figure {
        constructor(color, position) {
            super("king", color, position);
        }

        calculateMoves(table) {
            let moves = [];

            // in order to have a left new need to have 1 pos from left so 
            let left = Figure.getElementFromTable(this.position - 1, table);
            let up_left = Figure.getElementFromTable(this.position - 9, table);
            let down_left = Figure.getElementFromTable(this.position + 7, table);
            let right = Figure.getElementFromTable(this.position + 1, table);
            let up_right = Figure.getElementFromTable(this.position - 7, table);
            let down_right = Figure.getElementFromTable(this.position + 9, table);
            let up = Figure.getElementFromTable(this.position - 8, table);
            let down = Figure.getElementFromTable(this.position + 8, table);


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
        calculateMoves(table) {
            return this.getDiagonalMoves(this.color, this.position, table);
        }
    }


    class Horse extends Figure {
        constructor(color, position) {
            super("horse", color, position);
        }
        calculateMoves(table) {
            let moves = [];
            let up_long_left = Figure.getElementFromTable(this.position - 10, table);
            let up_long_right = Figure.getElementFromTable(this.position - 6, table);
            let down_long_right = Figure.getElementFromTable(this.position + 10, table);
            let down_long_left = Figure.getElementFromTable(this.position + 6, table);
            let up_short_left = Figure.getElementFromTable(this.position - 17, table);
            let up_short_right = Figure.getElementFromTable(this.position - 15, table);
            let down_short_right = Figure.getElementFromTable(this.position + 17, table);
            let down_short_left = Figure.getElementFromTable(this.position + 15, table);
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
        calculateMoves(table) {
            return this.getStraightMoves(this.color, this.position, table);
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
            if (Number(square.dataset.index) === idx) return square;
        }
        return undefined;
    };

    const makeOpponentMove = (from, to) => {
        const parentFig = Figure.getElementFromTable(from, table);
        const enemyFig = Figure.getElementFromTable(to, table);
        const parentHTML = findHtmlelementByIDX(from);
        const enemyHTML = findHtmlelementByIDX(to);

        if (parentHTML?.firstElementChild) parentHTML.firstElementChild.remove();
        if (enemyFig?.image_path && enemyHTML?.firstElementChild) enemyHTML.firstElementChild.remove();

        table[from] = Figure.create("", "", from);
        table[from].render();
        table[to] = Figure.create(parentFig.type, parentFig.color, to);
        table[to].render();
    };

    const putfigure = (from, figureToPut, figure) => {
        const parentHTML = findHtmlelementByIDX(figure._position);
        const fromHTML = findHtmlelementByIDX(from);
        table[Number(from)] = Figure.create('', '', Number(from));
        table[Number(from)].render();
        if (parentHTML?.firstElementChild) parentHTML.firstElementChild.remove();
        if (fromHTML?.firstElementChild) fromHTML.firstElementChild.remove();
        console.log(figureToPut, figure);
        table[figure._position] = Figure.create(figureToPut.type, figureToPut.color, figure._position);
        table[figure._position].render();

    }

    const makeMove = (event) => {
        //               const idx = Number(button.dataset.index);

        let enemy_pos = Number(event.currentTarget.dataset.index);
        let parent_pos = Number(last_button.dataset.index);
        let enemy_fig = Figure.getElementFromTable(enemy_pos, table);
        let parent_fig = Figure.getElementFromTable(parent_pos, table);
        let enemy_idx = table.indexOf(enemy_fig);
        let parent_idx = table.indexOf(parent_fig);
        let rebirth = false;
        let check = false;
        if (!simulateMoveForCheck(parent_fig, enemy_fig, table)) {
            blinkRedJS(event.currentTarget, 3, 100);
            untoggleButton();
            return;
        }
        allowedMoves = {};
        if (parent_fig.type === "pawn" && enemy_fig.position >= 0 && enemy_fig.position <= 7) rebirth = true;
        if (last_button?.firstElementChild) last_button.firstElementChild.remove();
        if (enemy_fig?.image_path && event.currentTarget.firstElementChild)
            event.currentTarget.firstElementChild.remove();

        // simulate the move first if its gonna give check to the other side

        table[parent_idx] = Figure.create("", "", parent_pos);
        table[parent_idx].render();
        table[enemy_idx] = Figure.create(parent_fig.type, parent_fig.color, enemy_pos)
        table[enemy_idx].render();

        const newFigure = table[enemy_idx];
        const moves = newFigure.calculateMoves(table);
        moves.forEach(el => {
            if (el.type === 'king') {
                // we have a check here
                // signalForCheck(GLroomId, GLmy_color, el);
                check = true;
            }
        })

        sendMove(GLroomId, turn, parent_pos, enemy_pos, enemy_fig, parent_fig, check);
        if (!rebirth) {
            turn = GLopponent_color;
            switchTurns();
        }
        // check for check

        untoggleButton();
    };

    function GAME(opponent_color, my_color) {
        const square_buttons = document.querySelectorAll('.square');
        square_buttonsArray = Array.from(square_buttons);
        clicked = false;
        last_moves = [];

        square_buttonsArray.forEach((button) => {
            button.addEventListener('click', () => {
                const idx = Number(button.dataset.index);
                const figure = Figure.getElementFromTable(idx, table);
                if (figure.type !== "" && figure.color === my_color && turn === my_color) {
                    clicked = true;
                    if (check && Object.keys(allowedMoves).length) {
                        let allowed = false;
                        for (const key of Object.keys(allowedMoves)) {
                            if (Number(key) === idx) {
                                allowed = true;
                            }
                        }
                        if (!allowed) return;
                    }

                    if (last_button === button) {
                        untoggleButton();
                        return;
                    } else {
                        last_button = button;
                    }

                    clearLastMovesArray();

                    const moves = check && Object.keys(allowedMoves).length ? allowedMoves[idx] : figure.calculateMoves(table);

                    if (moves?.length > 0) {
                        square_buttonsArray.forEach(el => el.style.opacity = "0.5");
                    } else {
                        return;
                    }

                    button.style.opacity = "1";
                    last_moves = moves.map(move => {
                        let btn = square_buttonsArray.find(butt => Number(butt.dataset.index) === move.position);
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

    function createChessBoard(my_color) {
        const board = document.querySelector('.ChessBoard');
        board.innerHTML = '';
        const iswhite = my_color === 'white';

        let squares = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const index = row * 8 + col;

                const square = document.createElement("button");
                square.classList.add("square");
                square.dataset.index = index;

                // Determine square color
                if ((row + col) % 2 === 0) {
                    square.classList.add('white');
                } else {
                    square.classList.add('black');
                }

                squares.push(square);
            }
        }

        // Render squares in normal or reversed order
        const orderedSquares = iswhite ? squares : squares.reverse();

        for (const square of orderedSquares) {
            board.appendChild(square);
        }
    }

    const align_row = (color, offset) => {
        table.push(Figure.create("rook", color, offset));
        table.push(Figure.create("horse", color, offset + 1));
        table.push(Figure.create("bishop", color, offset + 2));
        table.push(Figure.create("queen", color, offset + 3));
        table.push(Figure.create("king", color, offset + 4));
        table.push(Figure.create("bishop", color, offset + 5));
        table.push(Figure.create("horse", color, offset + 6));
        table.push(Figure.create("rook", color, offset + 7));
    }
    const align_pawns = (color, offset) => {
        for (let i = 0; i < 8; i++) {
            table.push(new Pawn(color, offset + i));

        }
    }

    function alignStart(my_color) {
        table = [];

        // Always align the board logically the same way
        align_row("black", 0);
        align_pawns("black", 8);

        for (let i = 16; i < 48; i++) {
            table.push(new Figure("", "", i));
        }

        align_pawns("white", 48);
        align_row("white", 56);

        // Visual rotation should be handled separately
        table.forEach(el => el.render());
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
            const fig = Figure.create(record.type, record.color, record._position);
            table.push(fig);
            fig.render();
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
        captured.forEach(el => {
            const img = document.createElement('img');
            img.src = el.image_path
            figureRestoreDiv.appendChild(img);
            img.addEventListener('click', () => {
                pawnSelectionModal.classList.add('hide-pawnSelection');
                figureRestoreDiv.innerHTML = '';
                putfigure(from, el, posToSwap);
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
            createChessBoard(color);
            alignStart(GLmy_color);
            socket.emit('get-table-one-time', {
                roomId: GLroomId,
                player: GLmy_color,
                table: table
            });
            GAME(GLopponent_color, GLmy_color);
            localStorage.setItem("gameReady", "true")
            console.log(table);

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
            displayMoves(movesDisplay, move.from, move.to, move.player, move.check);
        })
        // socket.on("get-allMoves", ({ moves }) => {

        // })
        // we will threat from to with indexes
        // here we need to switch timers 
        socket.off("opponentMove");
        socket.on('opponentMove', (data) => {
            const { from, to, currentTurn } = data;
            makeOpponentMove(from, to);
            turn = currentTurn;
            switchTurns();

        })

        socket.on("receiveMessage", ({ message }) => {
            showChessAlert(message);
        })

        socket.on("kingChecked", () => {
            // now here we need to calculate every single move if its going to
            // help p[revent the check 
            //1. iterate over my figures
            const copyTable = [...table];

            const myFigures = getFiguresByColor(GLmy_color, copyTable);
            myFigures.forEach(el => {
                const moves = el.calculateMoves(table);
                moves.forEach(move => {
                    if (simulateMoveForCheck(el, move, copyTable)) {
                        if (!allowedMoves[el.position]) allowedMoves[el.position] = [];
                        allowedMoves[el.position].push(move);
                    }
                })
            })
            if (Object.keys(allowedMoves).length === 0) {
                showChessAlert("CheckMate");
                socket.emit("sendMessagetoOtherSide", { roomId: GLroomId, message: "CheckMate" });
            } else {
                showChessAlert("Check");
                socket.emit("sendMessagetoOtherSide", { roomId: GLroomId, message: "Check" });
                check = true;
            }
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
            createChessBoard(GLmy_color);
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
        if (sessionStorage.getItem("pawnAtEnd") === 'true') {
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
        createChessBoard("white");
        alignStart("white");
    }


})();






