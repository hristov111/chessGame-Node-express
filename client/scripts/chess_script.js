// const socket = io("http://localhost:3000");


// socket.on("connect", () => {
//     console.log(`connected with ${socket.id}`);
// })


document.addEventListener("DOMContentLoaded", () => {
    let table = [];

    let figures = {
        king:["../chess-images/king.png","../chess-images/king_black.png"],
        queen:["../chess-images/queen.png","../chess-images/queen_black.png"],
        bishop:["../chess-images/bishop.png", "../chess-images/bishop_black.png"],
        horse:["../chess-images/horse.png","../chess-images/horse_black.png"],
        pawn: ["../chess-images/pawn.png", "../chess-images/pawn_black.png"],
        rook: ["../chess-images/rook.png", "../chess-images/rook_black.png"],
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
                figure_img.width = 80;
                figure_img.height = 80;
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




// const Person = function(firstName, birthYear){
//     // Instance properties
//     this.firstName = firstName;
//     this.birthYear = birthYear;
// }


// const jonas = new Person('Jonas', 1991);
// console.log(jonas);

// // 1. New empty object is created
// // 2. function is called, this = {}
// // 3. {} linked to prototype
// // 4. function automatically return {}


// const matilda = new Person('Matilda', 2017);
// const jack = new Person('Jack', 1975);
// console.log(matilda, jack);

// const jay = 'Jay';
// console.log(jonas instanceof Person);

// // Prototypes
// console.log(Person.prototype);
// Person.prototype.calc = function() {
//     console.log('Eat dick');

// }

// jonas.calc();
// matilda.calc();
// jack.calc();

// Person.prototype.species  = 'Homo Sapience';
// console.log(jonas.species, matilda.species);

// // console.log(jonas.);

// //Object.prototyp[e (top of prototype chain) 
// console.log(jonas.__proto__.__proto__);
// console.log(jonas.__proto__.__proto__.__proto__);


// console.dir(Person.prototype.constructor);

// const arr = [3,6,7,8,9,0,10]; // new Array === []
// console.log(arr.__proto__);
// console.log(arr.__proto__ === Array.prototype);
// console.log(arr.__proto__.__proto__);

// Array.prototype.unique = function() {
//     return [...new Set(this.arr)];
// }

// console.log(arr.unique());

// class expression
// const PersonCl1 = class {

// }

// class declaration
// class PersonCl {
//     constructor(fullName ,birthYear) {
//         this.fullName = fullName;
//         this.birthYear = birthYear;
//     }

//     calcAge() {
//         return 2025 - this.birthYear
//     }
//     greet() {
//         console.log(`Hey ${this.fullName}`);
//     }

//     get age(){
//         return this.calcAge();
//     }
    
//     set fullName(name){
//         console.log(name);
//         if(name.includes(' ')) this._fullName = name;
//         else alert(`${name} is not a  full name!`);
//     }
//     get fullName(){
//         return this._fullName;
//     }

//     static hey() {
//         console.log("Hey there");
//         console.log(this);
//     }
// }

// const jessica = new PersonCl('Jessica Voldemor', 2000);
// const walter = new PersonCl('Walter white', 1996);
// PersonCl.hey();
// // console.log(jessica);
// // jessica.calcAge(jessica.__proto__ === PersonCl.prototype);
// console.log(jessica);

// // 1. Classes are NOT hoisted
// // 2. Class are first-class citizens(pass them into functins and return them)
// // 3. Classes are executed in strict mode

// // Setters and getters

// const account = {
//     owner:'Kalata',
//     movements:[200,350,120,300],

//     get latest_movement() {
//         return this.movements.slice(-1).pop();
//     },
//     set latest(movement) {
//         this.movements.push(movement);
//     }
// };

// console.log(account.latest_movement);

// account.latest = 1;


// const PersonProto = {
//     calcAge() {
//         console.log(2025 - this.birthYear);
//     },

//     init(firstName, birthYear){
//         this.firstName = firstName;
//         this.birthYear = birthYear;
//     }
// };

// const steven = Object.create(PersonProto);
// console.log(steven);
// steven.name = 'Steven';
// steven.birthYear = 2002;
// steven.calcAge();

// console.log(steven.__proto__ === PersonProto);

// const sarah = Object.create(PersonProto);
// sarah.init('Sarah', 1979);
// sarah.calcAge();


// const Person = function(firstName, birthYear){
//     this.firstName = firstName;
//     this.birthYear = birthYear;
// };

// Person.prototype.calcage = function() {
//     console.log(2025 - this.birthYear);
// };


// const Student = function(firstName, birthYear, course){
//     Person.call(this,firstName,birthYear);
//     this.course = course;
// }

// // Linkin prototypes
// Student.prototype = Object.create(Person.prototype);

// // Student.prototype = Person.prototype;

// Student.prototype.introduce = function() {
//     console.log(`My name is ${this.firstName} and I study ${this.course}`);
// }
// const mike = new Student('Mike', 2020, 'Computer Science');
// console.log(mike);

// mike.introduce();
// mike.calcage();

// console.log(mike.__proto__);
// console.log(mike.__proto__.__proto__);

// console.log(mike instanceof Student);
// console.log(mike instanceof Person);

// Student.prototype.constructor = Student;
// console.dir(Student.prototype.constructor);


// class PersonCl {
//     constructor(fullName ,birthYear) {
//         this.fullName = fullName;
//         this.birthYear = birthYear;
//     }

//     calcAge() {
//         return 2025 - this.birthYear
//     }
//     greet() {
//         console.log(`Hey ${this.fullName}`);
//     }

//     get age(){
//         return this.calcAge();
//     }
    
//     set fullName(name){
//         console.log(name);
//         if(name.includes(' ')) this._fullName = name;
//         else alert(`${name} is not a  full name!`);
//     }
//     get fullName(){
//         return this._fullName;
//     }

//     static hey() {
//         console.log("Hey there");
//         console.log(this);
//     }
// }

// class StudentCl extends PersonCl{
//     constructor(fullName,birthYear,course){
//         // Always happens first
//         super(fullName,birthYear);
//         this.course = course;

//     }   
//     introduce(){
//         console.log(`My name is ${this.fullName} and i study ${this.course}`);
//     }

//     calcAge() {
//         console.log(`I'am ${2025 - this.birthYear} years old, but as a student i feel more like ${2025 - this.birthYear + 10}`);
//     }
// }

// const martha = new StudentCl('Martha Jones', 2012, 'Computer Science');
// martha.introduce();
// 
// martha.calcAge();

// const PersonProto = {
//     calcAge() {
//         console.log(2025 - this.birthYear);
//     },
//     init(firstName,birthYear) {
//         this.firstName = firstName;
//         this.birthYear = birthYear;
//     }
// }


// const steven = Object.create(PersonProto);

// const StudentProto = Object.create(PersonProto);
// StudentProto.init() = function(firstName,birthYear,course){
//     PersonProto.init.call(this,firstName,birthYear);
//     this.course = course;
// }

// StudentProto.introduce = function() {
//     console.log(`My name is ${this.fullName} and I study ${this.course}`);
// }


// const jay = Object.create(StudentProto);
// jay.init('Jay', 2010, 'computer Science');
// jay.introduce();
// jay.calcAge();

// 1) Public Fields
// 2) Private fields
// 3) Public methods
// 4) Private methods
// STATIC version of these 4



// class Account {
//     local = navigator.locale;
//     bank = 'Bankist';
//     #movements =[]; 
//     #pin;


//     constructor(owner,currency,pin){
//         this.owner = owner;
//         this.currency = currency;
//         // this.local = navigator.language;
//         this.total = 0;
//         this.#pin = pin;

//         console.log(`Thanks for opening an account ${owner}`);
//     }
//     sum(){
//         return this.total;
//     }

//     getMovements() {
//         return this.#movements;
//     }
//     deposit(money) {
//         this.#movements.push(money);
//         this.total += money;
//         console.log(`You have successfully added ${money} to your bank account.\n
//             Your current cash is ${this.sum()}`);
//     }
//     withdraw(money){
//         if(this.total < money){
//             console.log("Error! Low on cash");
//         }else {
//             this.total-= money;
//             this.#movements.push(-money);
//             console.log(`You have successfully withdrawed ${money}.
//                 Your current balance is ${this.total}`);
//         }
//     }
//     #approveLoan(){
//         return true;
//     }
//     requestLoan(val){
//         if(this.#approveLoan(val)){
//             this.deposit(val);
//         }
//     }
//     static test(){
//         console.log('TEST');
//     }
// }

// const acc1 = new Account('Jonas', 'EUR', 1111);
// acc1.deposit(60);
// acc1.withdraw(45);


// acc1.deposit(300).withdraw(100).withdraw().requestLoan(2500).
// withdraw(4000);





// console.log(acc1);

// const s1 = 'Hello';
// console.log(typeof s1);

// const s2 = new String('Hello');
// console.log(typeof s2);


// console.log(window);
// alert(1);
// console.log(navigator.appVersion);

// Object Literal
// const book1 = {
//     title:'Book1',
//     author:'John Doe',
//     year:2013,
//     getsummary: function(){
//         return `${this.title} was written by ${this.author} i ${this.year}`;
//     }
// }

// const book2 = {
//     title:'Book 2',
//     author:'Sanra Doe',
//     year:2013,
//     getsummary: function(){
//         return `${this.title} was written by ${this.author} i ${this.year}`;
//     }
// }


// console.log(book1.getsummary());
// console.log(book2.getsummary());
// console.log(Object.values(book2));
// console.log(Object.keys(book2));


// constructor
// function Book(title, author,year) {
//     this.title = title;
//     this.author = author;
//     this.year = year;
// }

// // getSummary
// Book.prototype.getSummary = function() {
//     return `${this.title} was written by ${this.author} in ${this.year}`;
// };

// getAge
// Book.prototype.getAge = function() {
//     const years = new Date().getFullYear() - this.year;
//     return `${this.title} is ${years} years old`;
// };

// // Revise / Change Year
// Book.prototype.revise = function(newYear) {
//     this.year = newYear;
//     this.revise = true;
// };




// // Instantiate an Object
// const book1 = new Book('Book One', 'John doe', 2013);
// const book2 = new Book('Book Two', 'Jane Doe', 2016);

// console.log(book2);
// book2.revise('125');console.log(book2);


// Magazine Constructor
// function Magazine(title, author, year, month) {
//     Book.call(this,title,author,year);
//     this.month = month;
// }
// // Inherit Prototype 
// Magazine.prototype = Object.create(Book.prototype);

// // Instantiate Magazine Object
// const mag1 = new Magazine('Mag One', 'John Doe', '2018', 'Jan');

// // Use Magazine constructor
// Magazine.prototype.constructor = Magazine;


// console.log(mag1);


// Object of Protos
// const bookProtos = {
//     getsummary() {
//         return `${this.title} was written by ${this.author} in ${this.year}`;
//     },
//     getAge() {
//         const years = new Date().getFullYear() - this.year;
//         return `${this.title} is ${years} years old`;
//     }
// }

// // Create Object 
// const book1 = Object.create(bookProtos);
// book1.title = 'Book One';
// book1.author = 'John Doe';
// book1.year = '2025';

// console.log(book1);
