import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE
}).promise();

export default pool;



// notes


// 1. route params 
// ex. app.get("/api/users/:id", (request,res) => {
//  console.log(request.params) => {id: number} 
//})

// 2. query params localhost:5500/products?key=value&key2=values2 - query string
// ex. app.get("/api/users", (request,res) => {
//  console.log(request.query) => {id: number} 
//})

// 3. POST request
// app.post("/api/users", (request, res) => {console.log(request.body)})


//4. Put request - you are updatring the entire record
// app.put("/api/users/:id", (req,res) => const {body, params: {id}} = request)
// in the body is the new data taht we want to update the old one 


// 5. PATCH request - updates a record partially , instead of everything 
// app.patch("/api/users/:id", (req,res) =>  const {body, params: {id}} = request)

//6. DELETE request - delets a record 
// app.delete("/api/users/:id", (req,res) => { const {params: {id}} = req})


// validation
// 