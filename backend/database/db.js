//file to initilize the schema.sql
const sqlite3 = require("sqlite3").verbose(); // verbose gives extra error msgs for debugging
const path = require("path");  // for finding paths
const fs = require("fs");  //for dealing with files

const DB_PATH = path.join(__dirname, "inventory.db");  // __dir to get current directory, then getting file inventory.db (it will create this)

const db = new sqlite3.Database(DB_PATH, (err) => { //creating the instances for the SQLite database, opens connection located at DB_PATH, logs if ran successfully or not.
    if (err){
        console.error("Error on connecting to database:", err.message);
    }
    else {
        console.log("Connected to the SQLite database successfully");
    }
});

const schemaPath = path.join(__dirname, "schema.sql"); //getting path for the schemea where the databases are created

db.serialize(() => {
    const schema = fs.readFileSync(schemaPath, "utf8"); // reading file of schemaPath in utf8 format
    db.exec(schema, (err) => { // executing code in the schema file, (err) function to log if it ran successfully or not.
        if (err) {
            console.error("Error on initializing database:", err.message);
        } else {
            console.log("Database has been initialized successfully.");
        }
    });
});

module.exports = db; //exporting the db object so it can be used in other modules