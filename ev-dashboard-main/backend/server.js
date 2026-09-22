const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");

const app = express();

app.use(cors());
app.use(express.json());

let realData = {};

const port = new SerialPort({
  path: "COM5",
  baudRate: 9600,
  autoOpen: false
});

port.open((err) => {
  if (err) {
    console.log("Serial device not connected. Waiting for kit...");
    return;
  }

  console.log("Serial port connected!");
});

let serialBuffer = "";

port.on("data", (chunk) => {
  serialBuffer += chunk.toString();

  const lines = serialBuffer.split(/\r\n|\r|\n/);

  serialBuffer = lines.pop();

  lines.forEach((line) => {
    const cleanLine = line.trim();

    if (!cleanLine) return;

    console.log("Received:", cleanLine);

    if (cleanLine.includes("=")) {
      const separatorIndex = cleanLine.indexOf("=");

      const key = cleanLine.substring(0, separatorIndex).trim();
      const value = cleanLine.substring(separatorIndex + 1).trim();

      if (key && value !== "" && !isNaN(Number(value))) {
        realData[key] = Number(value);
      }
    }

    realData.rawData = cleanLine;
  });
});

port.on("close", () => {
  console.log("Kit disconnected!");
  realData = {};
});

app.get("/api/ev-data", (req, res) => {
  res.json(realData);
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});