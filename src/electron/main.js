import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";

let serverProcess; 

app.on("ready", () => {
    // Start Express 
    const serverPath = path.join(app.getAppPath(), "backend", "server.js");
    serverProcess = spawn("node", [serverPath], {
        detached: false,
        stdio: "ignore",
    });
    
    serverProcess.unref(); 
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
});

// Kill Express when Electron exits
app.on("quit", () => {
    if (serverProcess) {
        serverProcess.kill();
        console.log("Express server closed");
    }
});

