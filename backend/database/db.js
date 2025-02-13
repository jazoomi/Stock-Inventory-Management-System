import sqlite3 from "sqlite3";
import path from "path";  // for finding paths
import fs from "fs";  //for dealing with files
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "inventory.db");  // __dir to get current directory, then getting file inventory.db (it will create this)

//creating the instances for the SQLite database, opens connection located at DB_PATH, logs if ran successfully or not.
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database successfully.");
    }
});

const schemaPath = path.join(__dirname, "schema.sql"); // Get schema file path

// Read and execute schema file to initialize database
if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf8"); // reading file of schemaPath in utf8 format
    db.exec(schema, (err) => {
        if (err) {
            console.error("Error initializing database:", err.message);
        } else {
            console.log("Database has been initialized successfully.");
        }
    });
} else {
    console.error("Schema file not found:", schemaPath);
    process.exit(1);
}

export default db; //exporting the db object so it can be used in other modules