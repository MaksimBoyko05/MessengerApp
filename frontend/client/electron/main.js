import {app, BrowserWindow} from "electron";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    transparent: true,
    frame: false,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5173");

  if (process.platform === "win32") {
    win.setBackgroundMaterial("acrylic");
    win.setOpacity(1);

  }
}

app.whenReady().then(createWindow);
