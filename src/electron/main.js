import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

let serverProcess; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.on("ready", () => {
    // Start Express 
    const serverPath = path.join(__dirname, "../..", "backend", "server.js");
    serverProcess = spawn("node", [serverPath], {
        detached: false,
        stdio: "inherit", // Show server output for debugging
        cwd: path.join(__dirname, "../..")
    });
    
    // Add error handler
    serverProcess.on("error", (err) => {
        console.error("Failed to start server:", err);
    });
    
    // Add exit handler
    serverProcess.on("exit", (code) => {
        console.log(`Server process exited with code ${code}`);
    });
    
    // Wait a moment for server to start before opening window
    setTimeout(() => {
        console.log("Express server started");

        // Open Electron window
        const mainWindow = new BrowserWindow({
            width: 1024,           // Set a default width
            height: 768,           // Set a default height
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false, // Important for accessing Node functionalities
            },
            autoHideMenuBar: true,  // Optional: Hides the menu bar
            fullscreen: false,       // Optional: Set to true for fullscreen mode
            resizable: true,        // Ensure the window can be resized
            minWidth: 800,          // Optional: Minimum width
            minHeight: 600,         // Optional: Minimum height
        });

        // Load frontend
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));

        // Optional: Open DevTools for debugging
        // mainWindow.webContents.openDevTools();
    }, 2000); // 2 second delay to let server start
});

// Kill Express when Electron exits
app.on("quit", () => {
    if (serverProcess) {
        serverProcess.kill();
        console.log("Express server closed");
    }
});

