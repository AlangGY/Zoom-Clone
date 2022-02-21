import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { getEnteredRoom, getPublicRooms } from "./libs/util/functions";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.use("/css", express.static(__dirname + "/views/css"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", (socket) => {
  const sendRoomList = () => {
    const { rooms, sids } = socket.adapter;
    const publicRooms = getPublicRooms([...rooms], sids);
    io.emit("room_list", { roomList: publicRooms });
  };

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  sendRoomList();
  socket.on("enter_room", ({ room }, done) => {
    socket.join(room);
    socket
      .to(room)
      .emit("announce", { type: "join", nickname: socket["__nickname"] });
    sendRoomList();

    done?.();
  });

  socket.on("leave_room", ({ room }, done) => {
    socket
      .to(room)
      .emit("announce", { type: "leave", nickname: socket["__nickname"] });
    socket.leave(room);
    sendRoomList();

    done?.();
  });

  socket.on("disconnecting", () => {
    console.log("disconnecting");
    const rooms = getEnteredRoom([...socket.rooms], socket.id);
    if (!rooms.length) return;
    socket
      .to(rooms)
      .emit("announce", { type: "leave", nickname: socket["__nickname"] });
  });

  socket.on("disconnect", () => {
    console.log("disconnected! SendRoomList");
    sendRoomList();
  });

  socket.on("change_nickname", ({ nickname }, done) => {
    const prevNickname = socket["__nickname"];
    socket["__nickname"] = nickname;
    const rooms = getEnteredRoom([...socket.rooms], socket.id);
    socket
      .to(rooms)
      .emit("announce", { type: "change-nickname", nickname, prevNickname });
    done?.();
  });

  socket.on("new_chat", ({ chat, room }, done) => {
    socket.to(room).emit("new_chat", { nickname: socket["__nickname"], chat });
    done?.();
  });

  socket.on("offer", ({ offer, room }) => {
    socket.to(room).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, room }) => {
    socket.to(room).emit("answer", { answer });
  });

  socket.on("ice", ({ candidate, room }) => {
    socket.to(room).emit("ice", { candidate });
  });
});

server.listen(3000, handleListen);
