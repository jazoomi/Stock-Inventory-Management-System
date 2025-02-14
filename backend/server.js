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
    });
});
//make get for assembled ingredient
app.get("/assembled-ingredients", (req, res) => {
    db.all("SELECT * FROM assembled_ingredients", [], (err, rows) => {
        if (err){
            res.status(500).json({error: err.message});
            return;
        }
        res.json(rows);
    });

});

//make get for combo meals
app.get("/combo", (req, res) => {
    db.all("SELECT * FROM combo", [], (err, rows) => {
        if (err){
            res.status(500).json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

//make post for raw ingredients
app.post("/raw-ingredients", (req, res) => {
    const { name, quantity, unit, price} = req.body;

    if (!name || !quantity || !unit || !price) {
        return res.status(400).json({error: "Enter all fields (name, quantity, unit and price)"});
    }
    const sql = "INSERT INTO raw_ingredients (name, quantity, unit, price) VALUES(?, ?, ?, ?)";
    const params = [name, quantity, unit, price];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ id: this.lastID, name, quantity, unit, price});
    });
    
});
//make post for assemlbed ingredients
app.post("/assembled-ingredients", (req, res) => {
    const { name, quantity, recipe, price} = req.body;

    if (!name || !quantity || !recipe || !price) {
        return res.status(400).json({error: "Enter all fields (name, quantity, recipe and price)"});
    }
    const sql = "INSERT INTO assembled_ingredients (name, quantity, recipe, price) VALUES(?, ?, ?, ?)";
    const params = [name, quantity, recipe, price];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ id: this.lastID, name, quantity, recipe, price});
    });
    
});
//make post for combo meals
app.post("/combo", (req, res) => {
    const { name, items, price} = req.body;

    if (!name || !items || !price) {
        return res.status(400).json({error: "Enter all fields (name, items, and price)"});
    }
    const sql = "INSERT INTO combo (name, items, price) VALUES(?, ?, ?)";
    const params = [name, items, price];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ id: this.lastID, name, items, price});
    });
    
});

//not sure how correct this part is, i think it doesn't matter what port number.
const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
