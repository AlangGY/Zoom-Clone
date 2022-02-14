const socket = new WebSocket(`ws://${window.location.host}`);

console.log(socket);

socket.addEventListener("open", () => {
  console.log("서버에 연결되었습니다😃");
});

socket.addEventListener("message", (message) => {
  console.log(`Message: ${message.data}`);
  console.log(message);
});

socket.addEventListener("close", () => {
  console.log("서버와의 연결이 끊겼습니다");
});

setTimeout(() => {
  socket.send("Hello from the browser");
}, 10000);
