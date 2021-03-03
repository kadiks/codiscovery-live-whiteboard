require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

const port = process.env.PORT || 9999;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});
app.get("/status", function (req, res) {
  res.status(200).json({ status: "ok" });
});

// Connexion Websocket
io.on("connection", (socket) => {
  console.log(`Connected to client with Id ${socket.id}`);

  io.emit("element", "New element");

  //   io.on("command", (cmd) => {
  //     console.log(`Recieved command ${cmd}`);
  //     io.emit("element", "Add element");
  //   });
  socket.on("c-draw-pen", (obj /* color, penPoints */) => {
    // console.log("c-draw-pen", obj);
    socket.broadcast.emit("s-draw-pen", obj);
  });
});

// Start HTTP server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port} !`);
});
