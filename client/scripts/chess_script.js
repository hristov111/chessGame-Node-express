// const socket = io("http://localhost:3000");


// socket.on("connect", () => {
//     console.log(`connected with ${socket.id}`);
// })


document.addEventListener("DOMContentLoaded", () => {
    let table = [];

    let figures = {
        king:["../../chess-images/king.png","../../chess-images/king_black.png"],
        queen:["../../chess-images/queen.png","../../chess-images/queen_black.png"],
        bishop:["../../chess-images/bishop.png", "../../chess-images/bishop_black.png"],
        horse:["../../chess-images/horse.png","../../chess-images/horse_black.png"],
        pawn: ["../../chess-images/pawn.png", "../../chess-images/pawn_black.png"],
        rook: ["../../chess-images/rook.png", "../../chess-images/rook_black.png"],
        takeBlack(figure){
            return this[figure][1];
        },
        takeWhite(figure){
            return this[figure][0];
        }
        
    };

    class Figure{
        #available_positions = []; 
        image_path;
        constructor(type,color,position){
            this.color = color;
            this.position = position;
            this.type = type;
            if(color !== "" && type!== ""){

                this.image_path= color === "black"?figures.takeBlack(type):figures.takeWhite(type);
                this.enemy_color = color === "black"?"white":"black";
                let square_divs = document.querySelectorAll('.square');
                let figure_img = document.createElement("img");
                figure_img.src = this.image_path;
                figure_img.width = 83;
                figure_img.height = 83;
                square_divs[this.position].appendChild(figure_img);
            }
           
        }
        static create(type,color, position){
            if(type === "king")return new King(color,position);
            else if(type === "queen") return new Queen(color,position);
            else if(type === "rook")return new Rook(color,position);
            else if(type === "bishop") return new Bishop(color,position);
            else if(type === "horse") return new Horse(color,position);
            else if(type === "pawn") return new Pawn(color, position);
            else return new Figure("","",position);
        }
        calculateMoves(){}
        get available_positions(){
            return this.#available_positions;
        }
        set position(pos){
            this._position = pos;
            
        }
        get position(){
            return this._position;
        }
        get image_path(){
            return this._image_path;
        }
        set image_path(img){
            this._image_path = img;
        }
    
        static getElementFromTable = (idx) => {
            if(idx > 63 || idx < 0) return -1;
            return table.find(el => el.position ===idx) || -1;
        }
        static checkLeftBounds = (pos) =>{
            return pos % 8 === 0?true:false;
        }
        static checkRightBounds = (pos) => {
            return (pos +1 )% 8 === 0?true:false;
        }
        static concurPosition = (element,color) =>{
            if(element.type === "" || element.color !== color)return true
            else return false;
        }  
        static isEnemy = (element, color) =>{
            if(element.enemy_color === color)return true;
            else return false;
        }
        static movesFromLeft = (pos) => {
            let count = 0;
            let i =pos -1;
            if(this.checkLeftBounds(pos))return count;
            while(!this.checkLeftBounds(i)){
                i--;
                count++;
            }
            count++;
            return count;
        }
        static movesFromRight = (pos) => {
            let count = 0;
            let i =pos +1;
            if(this.checkRightBounds(pos))return count;
            while(!this.checkRightBounds(i)){
                i++;
                count++;
            }
            count++;
            return count;
        }

        static movesFromDown = (pos) => {
            let count = 0;
            let i = pos;
            if(i > 55)return count;
            while(true){
                i+=8;
                if(i >63 || i>55)break;
                count++;
            }
        }
        static movesFromUp = (pos) => {
            let count = 0;
            let i = pos;
            if(i < 8)return count;
            while(true){
                i-=8;
                if(i <0 || i<8)break;
                count++;
            }
        }
        static getMoves(color,currentPos,step,first_Condition,second_Condition,third_Condition){
            let moves = [];
            let curr_pos;
            for(let i = currentPos +step;first_Condition(i,currentPos);i+=step){
                curr_pos = this.getElementFromTable(i);
                if(second_Condition(curr_pos,color)){
                    moves.push(curr_pos);
                    if(third_Condition(curr_pos,color,i))break;
                }
            }
            return moves;
        }

        
    
    }
    const StraightMover = {
        getStraightMoves(color,pos) {
            let moves = [];

            // Up
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -8,
                (i) =>i>=0 ,
                (up,c) =>Figure.concurPosition(up,c),
                (up,c)=>Figure.isEnemy(up,c)
            ));
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                8,
                (i) => i<64,
                (down,c) => Figure.concurPosition(down,c),
                (down,c)=> Figure.isEnemy(down,c)

            ));
            
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -1,
                // args[0] will be the i
                (i,pos) => i>=pos - Figure.movesFromLeft(pos),
                (left,c) => Figure.concurPosition(left,c),
                (left,c) => Figure.isEnemy(left,c)
            ))


          
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                1,
                (i,pos) =>i <= pos + Figure.movesFromRight(pos),
                (right,c) => Figure.concurPosition(right,c),
                (right,c) => Figure.isEnemy(right,c)
            ))
            return moves;
        }
    }
    const DiagonalMover = {
        getDiagonalMoves(color,pos) {
            let moves = [];


            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -9,
                (i) => i>= 0,
                (up_left,c) => Figure.concurPosition(up_left,c),
                (pos,color,i) => Figure.isEnemy(pos,color) || Figure.checkLeftBounds(i)
            ))

           
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                -7,
                (i) => i>= 0,
                (up_right,c) => Figure.concurPosition(up_right,c),
                (pos,color,i) => Figure.isEnemy(pos,color) || Figure.checkRightBounds(i)
            ))
           
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                7,
                (i) => i< 64,
                (down_left,c) => Figure.concurPosition(down_left,c),
                (pos,color,i) => Figure.isEnemy(pos,color) || Figure.checkLeftBounds(i)
            ))
           
            moves = moves.concat(Figure.getMoves(
                color,
                pos,
                9,
                (i) => i < 64,
                (down_right,c) => Figure.concurPosition(down_right,c),
                (pos,color,i) => Figure.isEnemy(pos,color) || Figure.checkRightBounds(i)
            ))
            return moves;
        }
    }
    class Pawn extends Figure{

        constructor(color,position){
            super("pawn",color,position);
        }
        calculateMoves(){
            // let moves = [];
            let oneStepPos = Figure.getElementFromTable(this.position - 8);
           



            let available_moves = [];
            if(oneStepPos !== -1){
                if(oneStepPos.type === "") available_moves.push(oneStepPos);
                let twoStepPos =  Figure.getElementFromTable(this.position- 16);
                if(twoStepPos !== -1 && twoStepPos.type === "" &&this.position >47) available_moves.push(twoStepPos);
                
            }
            let right = Figure.getElementFromTable(this.position- 7);
            let left =  Figure.getElementFromTable(this.position- 9);
            if(Figure.checkLeftBounds(this.position)){
                if(right.color === this.enemy_color)available_moves.push(right);
            }
            else if (Figure.checkRightBounds(this.position)){
                if(left.color === this.enemy_color)available_moves.push(left);
            }
            else{
                if(right.color === this.enemy_color)available_moves.push(right);
                if(left.color === this.enemy_color)available_moves.push(left);
            } 
            return available_moves;
        }
        
    }
    class Queen extends Figure{
        constructor(color,position){
            super("queen",color,position);
            Object.assign(this,StraightMover,DiagonalMover);
        }
        calculateMoves(){
            return [...this.getStraightMoves(this.color,this.position),...this.getDiagonalMoves(this.color,this.position)]
        }
    }
    class King extends Figure{
        constructor(color,position){
            super("king",color,position);
        }

        calculateMoves(){
            let moves = [];
            // in order to have a left new need to have 1 pos from left so 
            let left = Figure.getElementFromTable(this.position-1);
            let up_left =Figure.getElementFromTable(this.position-9);
            let down_left = Figure.getElementFromTable(this.position+7);
            let right = Figure.getElementFromTable(this.position+1);
            let up_right = Figure.getElementFromTable(this.position-7);
            let down_right = Figure.getElementFromTable(this.position+9);
            let up = Figure.getElementFromTable(this.position-8);
            let down = Figure.getElementFromTable(this.position+8);


            if(Figure.movesFromLeft(this.position) >=1 && Figure.concurPosition(left,this.color))moves.push(left);
            if(this.position > 7 && Figure.movesFromLeft(this.position) >=1 && Figure.concurPosition(up_left,this.color))moves.push(up_left);
            if(this.position < 56 && Figure.movesFromLeft(this.position) >=1 && Figure.concurPosition(down_left,this.color))moves.push(down_left);
            if(Figure.movesFromRight(this.position) >=1 && Figure.concurPosition(right,this.color))moves.push(right);
            if(this.position > 7 && Figure.movesFromRight(this.position) >=1 && Figure.concurPosition(up_right,this.color))moves.push(up_right);
            if(this.position < 56 && Figure.movesFromRight(this.position) >=1 && Figure.concurPosition(down_right,this.color))moves.push(down_right);
            if(this.position > 7 && Figure.concurPosition(up,this.color))moves.push(up);
            if(this.position < 56 && Figure.concurPosition(down,this.color))moves.push(down);
            return moves;
        }
    }

    class Bishop extends Figure{
        constructor(color,position){
            super("bishop",color,position);
            Object.assign(this,DiagonalMover);
        }
        calculateMoves(){
            return this.getDiagonalMoves(this.color,this.position);
        }
    }


    class Horse extends Figure{
        constructor(color,position){
            super("horse",color,position);
        }
        calculateMoves(){
            let moves = [];
            let up_long_left = Figure.getElementFromTable(this.position - 10);
            let up_long_right = Figure.getElementFromTable(this.position - 6);
            let down_long_right = Figure.getElementFromTable(this.position + 10);
            let down_long_left =   Figure.getElementFromTable(this.position + 6);
            let up_short_left =  Figure.getElementFromTable(this.position - 17);
            let up_short_right = Figure.getElementFromTable(this.position - 15);
            let down_short_right = Figure.getElementFromTable(this.position + 17);
            let down_short_left = Figure.getElementFromTable(this.position + 15);
            let moves_fromLeft = Figure.movesFromLeft(this.position);
            let moves_fromRight = Figure.movesFromRight(this.position);

            // to make a up-long left the position of the horse must be > 7 
            // and movesFromLeft must return bigger or eq to 2
            if(this.position > 7 && moves_fromLeft >=2 && Figure.concurPosition(up_long_left,this.color))moves.push(up_long_left);
            // to make up-long left the pos of the horse mus be again > 7
            // and movesRight mus return bigger than or eq to 2
            if(this.position > 7 && moves_fromRight>=2 && Figure.concurPosition(up_long_right,this.color))moves.push(up_long_right);
            // to make down-long-right the position of the horse must be < 56 
            // and movesRight must return bigger than or eq to 2
            if(this.position < 56 && moves_fromRight >=2 && Figure.concurPosition(down_long_right,this.color))moves.push(down_long_right);
            // to make a down long 
            if(this.position < 56 && moves_fromLeft>=2 && Figure.concurPosition(down_long_left,this.color))moves.push(down_long_left);

            if(this.position > 15 && moves_fromLeft >=1 && Figure.concurPosition(up_short_left,this.color))moves.push(up_short_left);
            if(this.position > 15 && moves_fromRight >=1 && Figure.concurPosition(up_short_right,this.color))moves.push(up_short_right);
            if(this.position < 48 && moves_fromRight >=1 && Figure.concurPosition(down_short_right,this.color))moves.push(down_short_right);
            if(this.position < 48 && moves_fromLeft >=1 && Figure.concurPosition(down_short_left,this.color))moves.push(down_short_left);
            
            return moves;
        }
    }
    class Rook extends Figure{
        constructor(color,position){
            super("rook",color,position);
            Object.assign(this,StraightMover);
        }
        calculateMoves(){
            return this.getStraightMoves(this.color,this.position);
        }
    }
    let last_button;
    const makeMove = (event)=> {
        let enemy_pos = Number(event.currentTarget.classList[1]);
        let parent_pos = Number(last_button.classList[1]);
        let enemy_fig = Figure.getElementFromTable(enemy_pos);
        let parent_fig = Figure.getElementFromTable(parent_pos);
        let enemy_idx = table.indexOf(enemy_fig);
        let parent_idx = table.indexOf(parent_fig);
        let enemy_img = event.currentTarget.firstElementChild;

        // remove the parent img from the dom
        last_button.firstElementChild.remove();
        // change the enemy image to the parent
        enemy_img.src = parent_fig.image_path;
        // then fix table
        table[parent_idx] = Figure.create("","",parent_pos);
        parent_fig.position = enemy_pos;
        table[enemy_idx] = parent_fig;
        // 
    }
    function GAME(){
        createChessBoard();
        alignStart();
        let square_buttons =document.querySelectorAll('.square');
        let square_buttonsArray = Array.from(square_buttons);
        let clicked =false;
        let last_moves = [];
        square_buttons.forEach((button) => {
            button.addEventListener('click', () =>{
                const figure = Figure.getElementFromTable(Number(button.classList[1]));
                // check if the user has clicked on a occupied space
                if(figure.type !== "" && figure.color === "white"){
                    // setting click to true
                    clicked = true;
                    // if we have clicked an already clicked figure
                    // we want to untoggle by restoring the screen
                    if(last_button === button){
                        // making everything opacity to one as by default
                        square_buttonsArray.forEach(el => {
                            el.style.opacity = '1';
                        })
                        last_button = undefined;
                        clicked = false;
                        last_moves.forEach(el => {
                            if(el) el.removeEventListener('click',makeMove);
                        })
                        last_moves = [];
                        return;
                    }else {
                        last_button = button;
                       
    
                    }
                    last_moves.forEach(el => {
                        if(el) el.removeEventListener('click',makeMove);
                    })
                    last_moves = [];
                    // available moves for current clicked figure
                    const moves = figure.calculateMoves();
                    // if there are available moves for the figure we wanna make eveytging with opacity 0.5
                    if(moves && moves.length > 0){
                        square_buttonsArray.forEach(el => {
                            el.style.opacity = "0.5";
                        })
                    }else {
                        return;
                    }
                    button.style.opacity = "1";
                    // find the html buttons corresponding to the moves we found earilier so we can manuipilate them
                    let buttons = [];
                    moves.forEach(move => {
                        let btn = square_buttonsArray.find(butt => Number(butt.classList[1]) === move.position);
                        buttons.push(btn);
                        last_moves.push(btn);
                    })


                    buttons.forEach(el => {
                        // make them with opacity 1
                        el.style.opacity = '1';
                        // and adding a event listener to them
                        el.addEventListener('click', makeMove);
                    })
                    console.log(buttons);
                }else {
                    if(last_moves.find(el => el === button))return;
                    
                    if(clicked){
                        square_buttonsArray.forEach(el => {
                            el.style.opacity = '1';
                        })
                        clicked = false;
                        last_moves.forEach(el => {
                            if(el)el.removeEventListener('click',makeMove);
                        })
                        last_moves = [];
                    }
                    last_button = undefined;
                  
                }
                
            })
        })       
    }

    function createChessBoard(){
        let board = document.querySelector('.ChessBoard');
        let id = 0;
        console.log('ghello');
        for(let row = 0; row < 8;row++){
            for(let col = 0;col < 8;col++){
                let square = document.createElement("button");
                square.classList.add("square");
                square.classList.add(id);
                if((row+col) % 2 === 0){
                     square.classList.add('white');
                }else square.classList.add('black');

                board.appendChild(square);
                id++;
    
            }
        }
    }
    
    function alignStart(){
        table.push(Figure.create("queen","white",28));
        table.push(Figure.create("bishop","black",20));

        // table.push(new Queen("queen","black",));
        for(let i = 0;i< 20;i++)table.push(Figure.create("", "", i));
        for(let i = 21;i< 28;i++)table.push(Figure.create("", "", i));
        for(let i = 29;i< 64;i++)table.push(Figure.create("","",i));
        //-------------------------------------------------
        // console.log(table)
        // table.push(new King("king", "black",4));
        // table.push(new Queen("queen", "white", 59));
        // table.push(new King("king", "white", 60));

        // let elements = ["rook","horse","bishop"]
        // for(let i =0,j= 7;i<elements.length &&j>4;i++,j--){
        //    let pieceClass;

        //    switch(elements[i]){
        //     case "rook":
        //         pieceClass = Rook;
        //         break;
        //     case "bishop":
        //         pieceClass = Bishop;
        //         break;
        //     default:
        //         pieceClass = Horse;
        //         break;
        //    }
        //    table.push(new pieceClass(elements[i], "black", i));
        //    table.push(new pieceClass(elements[i], "black", j));
        // }  
        // let curr = 0;
        // for(let i = 56,j = 63;i<59,j>60;i++,j--){
        //     let pieceClass;

        //    switch(elements[curr]){
        //     case "rook":
        //         pieceClass = Rook;
        //         break;
        //     case "bishop":
        //         pieceClass = Bishop;
        //         break;
        //     default:
        //         pieceClass = Horse;
        //         break;
        //    }
        //    table.push(new pieceClass(elements[curr], "white", i));
        //    table.push(new pieceClass(elements[curr], "white", j));
        //    curr++;
        // }
        // for(let i =8;i< 16;++i){
        //     table.push(new Pawn("pawn", "black", i));
        // }
        // for(let i = 48;i<56;i++){
        //     table.push(new Figure("", "", i));
        // }
    
        // // need to fill places
        // for(let i =16;i<48;i++){
        //     table.push(new Figure("","", i));
        // }
        // console.log(table);
    
        // here i need to update the table
    
    }
    
    GAME();
    
    
})



