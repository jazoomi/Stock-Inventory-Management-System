import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";

let serverProcess; 

app.on("ready", () => {
    // Start Express 
    serverProcess = spawn("node", ["backend/server.js"], {
        detached: false, // Express closes when Electron closes
        stdio: "ignore", // Stops Express log flood
    });

    serverProcess.unref(); 

    console.log("Express server started");

    // Open Electron window
    const mainWindow = new BrowserWindow({
        disableBlinkFeatures: "Autofill",
    });

    // Load frontend
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
});

// Kill Express when Electron exits
app.on("quit", () => {
    if (serverProcess) {
        serverProcess.kill();
        console.log("Express server closed");
    }
});

