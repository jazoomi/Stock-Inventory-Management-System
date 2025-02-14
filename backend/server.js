import express from "express"; // express framework for http requests and responses
import db from "./database/db.js"; // getting the database connection that was exported in the other file

const app = express(); //creating the express app

app.use(express.json()); //middleware for parse JSON request bodies

app.get("/raw-ingredients", (req, res) => { //making get, with endpoing /raw-ingredients, 
    db.all("SELECT * FROM raw_ingredients", [], (err, rows) => { //db.all for SQL query to fetch all. the SQL query fetches all records from the raw_ingredients table. Not sure about the "[]"
        if(err){ //err is for if an error occured, otherwise rows has all the info.
            res.status(500).json({ error: err.message});
            return;
        }
        res.json(rows); //sends back info in a JSON response.
    })
})
//make get for assembled ingredient
app.get("/assembled-ingredients", (req, res) => {
    db.all("SELECT * FROM assembled_ingredients", [], (err, rows) => {
        res.status(500).json({ error: err.message});
        return;
    })
    res.json(rows);
})

//make get for combo meals
app.get("/combo", (req, res) => {
    db.all("SELECT * FROM combo", [], (err, rows) => {
        res.status(500).json({error: err.message});
        return;
    })
    res.json(rows);
})

//make post for raw ingredients
app.post("/raw-ingredients", (req, res) => {
    
})
//make post for assemlbed ingredients
app.post("/assembled-ingredients", (req, res) => {
    
})
//make post for combo meals
app.post("/combo", (req, res) => {
    
})

//not sure how correct this part is, i think it doesn't matter what port number.
const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
