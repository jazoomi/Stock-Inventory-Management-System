const express = require("express"); // express framework for http requests and responses
const db = require("./database/db"); // getting the database connection that was exported in the other file

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


//not sure how correct this part is, i think it doesn't matter what port number.
const PORT = 5000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
