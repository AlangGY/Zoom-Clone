import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { getEnteredRoom } from "./libs/util/functions";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
    switch (event) {
      case ("enter_room", "leave_room"):
        console.log(socket.adapter.rooms);
        break;
    }
  });
  socket.on("enter_room", ({ room }, done) => {
    socket.join(room);
    console.log(socket.adapter.rooms);
    socket
      .to(room)
      .emit("announce", { type: "join", nickname: socket["__nickname"] });
    done?.();
  });
  socket.on("leave_room", ({ room }, done) => {
    socket
      .to(room)
      .emit("announce", { type: "leave", nickname: socket["__nickname"] });
    socket.leave(room);
    done?.();
  });
  socket.on("disconnecting", () => {});
  socket.on("disconnect", () => {
    socket
      .to(room)
      .emit("announce", { type: "leave", nickname: socket["__nickname"] });
  });
  socket.on("change_nickname", ({ nickname }, done) => {
    const prevNickname = socket["__nickname"];
    socket["__nickname"] = nickname;
    const rooms = getEnteredRoom([...socket.adapter.rooms], socket.id);
    socket
      .to(rooms)
      .emit("announce", { type: "change-nickname", nickname, prevNickname });
    done?.();
  });
  socket.on("new_chat", ({ chat, room }, done) => {
    console.log(chat, room, socket["__nickname"]);
    socket.to(room).emit("new_chat", { nickname: socket["__nickname"], chat });
    done?.();
  });
});

server.listen(3000, handleListen);
