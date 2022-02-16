import http from "http";
import SocketIO from "socket.io";
import express from "express";
import uniqid from "uniqid";
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

// const parseMessage = (json) => JSON.parse(json);
// const stringifyMessage = (type, payload) => JSON.stringify({ type, payload });

// wsServer.on("connection", (socket) => {
//   const handleOpen = () => {
//     const id = uniqid();
//     socket["__id"] = id;
//     socket["__nickname"] = `User${Date.now()}`;
//     console.log(
//       `${socket["__nickname"]}(id: ${socket["__id"]})님의 브라우저가 연결되었습니다😄`
//     );
//     socket.send(stringifyMessage("initialize-id", socket["__id"]));
//     socket.send(stringifyMessage("initialize-nickname", socket["__nickname"]));
//     wsServer.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(
//           stringifyMessage(
//             "clients-list",
//             [...wsServer.clients.values()]
//               .filter((client) => client.readyState === WebSocket.OPEN)
//               .map((client) => ({
//                 id: client["__id"],
//                 nickname: client["__nickname"],
//               }))
//           )
//         );
//       }
//     });
//   };

//   const handleMessage = (message) => {
//     const sendChat = (socket, message) => {
//       wsServer.clients.forEach((client) => {
//         if (client !== socket && client.readyState === WebSocket.OPEN) {
//           client.send(
//             stringifyMessage("new-chat", {
//               id: socket["__id"],
//               nickname: socket["__nickname"],
//               chat: message,
//             })
//           );
//         }
//       });
//       console.log(
//         `${socket["__nickname"]}(id: ${socket["__id"]})님이 '${message}'의 채팅을 전송하였습니다.`
//       );
//     };
//     const changeNickname = (socket, nickname) => {
//       const { __id: id, __nickname: prevNickname } = socket;
//       socket["__nickname"] = nickname;
//       wsServer.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(stringifyMessage("change-nickname", { id, nickname }));
//         }
//       });
//       console.log(
//         `${prevNickname}(id: ${id})님이 ${nickname}으로 닉네임을 변경하였습니다.`
//       );
//     };

//     const { type, payload } = parseMessage(message);
//     switch (type) {
//       case "change-nickname":
//         changeNickname(socket, payload);
//         break;
//       case "send-chat":
//         sendChat(socket, payload);
//         break;
//       default:
//         throw new Error("의도치 않은 type 입니다");
//     }
//   };

//   const handleClose = (client) => {
//     console.log(
//       `${client["__nickname"]}(id:${client["__id"]})님의 브라우저 연결이 끊겼습니다😅`
//     );
//     const newClients = [...wsServer.clients.values()]
//       .filter((client) => client.readyState === WebSocket.OPEN)
//       .map((client) => ({
//         id: client["__id"],
//         nickname: client["__nickname"],
//       }));
//     wsServer.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(stringifyMessage("clients-list", newClients));
//       }
//     });
//   };
//   handleOpen();
//   socket.on("message", handleMessage);
//   socket.on("close", () => handleClose(socket));
// });

// wsServer.on("listening", () => {});

server.listen(3000, handleListen);
