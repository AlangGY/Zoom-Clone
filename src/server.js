import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (socket) => {
  const handleClose = () => {
    console.log("브라우저 연결이 끊겼습니다😅");
  };
  const handleMessage = (message) => {
    console.log(message.toString("utf8"));
  };
  console.log("브라우저가 연결되었습니다😄");
  socket.send("hello!");
  socket.on("message", handleMessage);
  socket.on("close", handleClose);
});

server.listen(3000, handleListen);
