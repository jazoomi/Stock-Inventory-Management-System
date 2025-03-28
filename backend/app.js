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
    console.log("Incoming ingredient:", req.body);
    const { name, quantity, unit, price, threshold} = req.body;

    if (!name || !quantity || !unit || !price ) {
        return res.status(400).json({error: "Enter all fields (name, quantity, unit and price)"});
    }
    const sql = "INSERT INTO raw_ingredients (name, quantity, unit, price, threshold) VALUES(?, ?, ?, ?, ?)";
    const params = [name, quantity, unit, price, threshold];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ id: this.lastID, name, quantity, unit, price, threshold});
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
//delete for raw 
app.delete("/raw-ingredients/:id", (req, res) => {
    const {id} = req.params; // takes the id from the endpoint param and deconstructs it

    const sql = "DELETE FROM raw_ingredients WHERE id = ?" //sql query to delete
    db.run(sql, [id], function(err) { 
        if (err){
            return res.status(500).json({error: err.message});
        }
        if(this.changes === 0){
            return res.status(404).json({message: "did not find that raw ingredient."})
        }
        res.status(200).json({ message: "Raw ingredient deleted successfully" });

    });
});

//delete for raw 
app.delete("/assembled-ingredients/:id", (req, res) => {
    const {id} = req.params; // takes the id from the endpoint param and deconstructs it

    const sql = "DELETE FROM assembled_ingredients WHERE id = ?" //sql query to delete
    db.run(sql, [id], function(err) { 
        if (err){
            return res.status(500).json({error: err.message});
        }
        if(this.changes === 0){
            return res.status(404).json({message: "did not find that asssembled ingredient."})
        }
        res.status(200).json({ message: "assembled ingredient deleted successfully" });

    });
});

//delete for raw 
app.delete("/combo/:id", (req, res) => {
    const {id} = req.params; // takes the id from the endpoint param and deconstructs it

    const sql = "DELETE FROM combo WHERE id = ?" //sql query to delete
    db.run(sql, [id], function(err) { 
        if (err){
            return res.status(500).json({error: err.message});
        }
        if(this.changes === 0){
            return res.status(404).json({message: "did not find that combo."})
        }
        res.status(200).json({ message: "combo deleted successfully" });

    });
});

app.put("/raw-ingredients/:id", (req, res) => {
    const {id} = req.params;
    const {name, quantity, unit, price, threshold} = req.body;
    if (!name || !quantity || !unit || !price || !threshold){
        return res.status(400).json({error: "Please put all info"});
    }
    const sql = "UPDATE raw_ingredients set name = ?, quantity = ?, unit = ?, price = ?, threshold = ? WHERE id = ?";
    const params = [name, quantity, unit, price, threshold, id];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({error: "did not find raw ingredient with that id"});
        }
        res.status(200).json({message: "Raw ingredients updated successfully:", id, name, quantity, unit, price, threshold})

    });
});

app.put("/assembled-ingredients/:id", (req, res) => {
    const {id} = req.params;
    const {name, quantity, recipe, price} = req.body;
    if (!name || !quantity || !recipe || !price){
        return res.status(400).json({error: "Pls put all info"});
    }
    const sql = "UPDATE assembled_ingredients set name = ?, quantity = ?, recipe = ?, price = ? WHERE id = ?";
    const params = [name, quantity, recipe, price, id];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({error: "did not find assembled ingredient with that id"});
        }
        res.status(200).json({message: "assembled ingredients updated successfully:", id, name, quantity, recipe, price})

    });
});

app.put("/combo/:id", (req, res) => {
    const {id} = req.params;
    const {name, items, price} = req.body;
    if (!name || !items || !price){
        return res.status(400).json({error: "Pls put all info"});
    }
    const sql = "UPDATE combo set name = ?, items = ?, price = ? WHERE id = ?";
    const params = [name, items, price, id];

    db.run(sql, params, function (err) {
        if (err){
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({error: "did not find combo with that id"});
        }
        res.status(200).json({message: "combo updated successfully:", id, name, items, price})

    });
});

export default app;