import Component from "./Component.template.js";
import ChatRoom from "./components/ChatRoom.js";
import FormCard from "./components/FormCard/index.js";
import Header from "./components/Header.js";
import RoomList from "./components/RoomList/index.js";
import Video from "./components/Video.js";
import VideoList from "./components/VideoList.js";
import WebCam from "./components/WebCam/index.js";
import PrefixContent from "./PrefixContent.js";
import webRTC from "./webRTC.js";

// App

const defaultState = {
  nickname: null,
  room: null,
  rooms: [],
  chats: [],
  videos: [],
};

class App extends Component {
  socket = io();
  peerConnection = webRTC.makeRTCPeerConnection();
  #header;
  #nicknameSpan;
  #roomSpan;
  #nicknameForm;
  #roomForm;
  #roomList;
  #chatRoom;
  #chatForm;
  #webCam;
  #videoList;

  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.#header = new Header({
      $target,
      initialState: { title: "알랑 채팅 방" },
    });

    this.#nicknameSpan = new PrefixContent({
      $target,
      initialState: {
        prefix: "닉네임 : ",
        text: this.state.nickname ?? "닉네임을 지어주세요",
        block: true,
      },
    });

    this.#roomSpan = new PrefixContent({
      $target,
      initialState: {
        prefix: "참가한 방 : ",
        text: this.state.room ?? "없음",
        block: true,
      },
    });

    this.#nicknameForm = new FormCard({
      $target,
      initialState: {
        title: "닉네임을 입력하세요",
        placeholder: "닉네임을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        this.handleNicknameSubmit(value);
        this.#nicknameForm.state.value = "";
      },
    });

    this.#roomForm = new FormCard({
      $target,
      initialState: {
        title: "방 제목을 입력하세요",
        placeholder: "방 제목을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        if (!this.state.nickname) {
          alert("닉네임을 먼저 설정해주세요!");
          return;
        }
        this.handleRoomSubmit(value);
        this.#roomForm.state.value = "";
      },
    });

    this.#roomList = new RoomList({
      $target,
      initialState: {
        rooms: this.state.rooms,
        currentRoom: this.state.room,
      },
      onClickRoom: (room) => {
        this.handleRoomSubmit(room);
      },
    });

    this.#chatRoom = new ChatRoom({
      $target,
      initialState: {
        chats: this.state.chats,
      },
    });

    this.#chatForm = new FormCard({
      $target,
      initialState: {
        title: "",
        placeholder: "채팅 메시지를 입력하세요",
        text: "전송",
        value: "",
      },
      onSubmit: (value) => {
        this.handleChatSubmit(value);
        this.#chatForm.state.value = "";
      },
    });

    this.#webCam = new WebCam({
      $target,
      initialState: {
        width: 200,
        height: 200,
        on: true,
        muted: false,
      },
      onChangeStream: async ({ stream, tracks }) => {
        console.log("change Stream!");
        const videoTrack = tracks?.find((track) => track.kind === "video");
        const audioTrack = tracks?.find((track) => track.kind === "audio");
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(
          (sender) => sender.track?.kind === "video"
        );
        const audioSender = senders.find(
          (sender) => sender.track?.kind === "audio"
        );
        if (videoSender) {
          await videoSender.replaceTrack(videoTrack);
        } else if (videoTrack instanceof MediaStreamTrack) {
          const emptySender = senders.find((sender) => !sender.track);
          emptySender
            ? await emptySender.replaceTrack(videoTrack)
            : this.peerConnection.addTrack(videoTrack, stream);
        }
        if (audioSender) {
          await audioSender.replaceTrack(audioTrack);
        } else if (audioTrack instanceof MediaStreamTrack) {
          const emptySender = senders.find((sender) => !sender.track);
          emptySender
            ? await emptySender.replaceTrack(audioTrack)
            : this.peerConnection.addTrack(audioTrack, stream);
        }
      },
    });

    this.#videoList = new VideoList({
      $target,
      initialState: {
        videos: [],
      },
    });

    this.children = [
      this.#header,
      this.#nicknameSpan,
      this.#roomSpan,
      this.#nicknameForm,
      this.#roomForm,
      this.#roomList,
      this.#chatRoom,
      this.#chatForm,
      this.#webCam,
      this.#videoList,
    ];

    this.handleIce = (ice) => {
      console.log("send ice candidate");
      const { candidate } = ice;
      this.socket.emit("ice", { candidate, room: this.state.room });
    };

    this.handleTrack = (data) => {
      console.log("got track from peer");
      const stream = data.streams[0];
      const hasStream = this.state.videos.find(
        ({ srcObject }) => srcObject.id === stream.id
      );
      if (hasStream) return;
      const video = { srcObject: stream, width: 200, height: 200 };
      this.state.videos = [...this.state.videos, video];
    };
  }

  setChildrenState(state) {
    const { nickname, room, rooms, chats, videos } = state;
    this.#nicknameSpan.state.text = nickname ?? "Unknown";
    this.#roomSpan.state.text = room ?? "없음";
    this.#roomList.state.state = { rooms, currentRoom: room };
    this.#chatRoom.state.chats = chats;
    this.#videoList.state.videos = videos;
    this.render();
    return this;
  }

  setEvent() {
    this.peerConnection.addEventListener("icecandidate", this.handleIce);
    this.peerConnection.addEventListener("track", this.handleTrack);

    // Socket Events
    this.socket.on("announce", async ({ type, nickname, prevNickname }) => {
      switch (type) {
        case "join":
          this.appendChat({ chat: `'${nickname}'님이 입장하셨습니다.` });
          const offer = await this.peerConnection.createOffer();
          this.peerConnection.setLocalDescription(offer);
          this.socket.emit("offer", { offer, room: this.state.room });
          break;
        case "leave":
          this.appendChat({ chat: `'${nickname}'님이 퇴장하셨습니다.` });
          break;
        case "change-nickname":
          this.appendChat({
            chat: `'${prevNickname}'님이 '${nickname}'으로 닉네임을 변경하였습니다.`,
          });
          break;
        default:
          console.error("확인되지 않은 방식입니다.");
          break;
      }
    });

    this.socket.on("new_chat", ({ chat, nickname }) => {
      console.log(chat, nickname);
      this.appendChat({ prefix: `${nickname} : `, chat });
    });

    this.socket.on("room_list", ({ roomList }) => {
      this.state.rooms = roomList;
    });

    this.socket.on("offer", async ({ offer }) => {
      this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      this.peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", { answer, room: this.state.room });
    });

    this.socket.on("answer", ({ answer }) => {
      console.log("got answer");
      this.peerConnection.setRemoteDescription(answer);
    });

    this.socket.on("ice", async ({ candidate }) => {
      console.log("got ice");
      try {
        await this.peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.log("adding Ice Candidate Failed!");
        console.error(e);
      }
    });
  }

  clearEvent() {
    this.peerConnection.removeEventListener("icecandidate", this.handleIce);

    this.peerConnection.removeEventListener("track", this.handleTrack);
  }

  appendChat({ prefix, chat }) {
    const { chats } = this.state;
    this.state.chats = [...chats, `${prefix || ""}${chat}`];
  }

  handleNicknameSubmit(nickname) {
    this.socket.emit("change_nickname", { nickname }, () => {
      console.log("change nickname!");
      this.state.nickname = nickname;
    });
  }

  handleRoomSubmit(nextRoom) {
    const { room: prevRoom } = this.state;
    if (prevRoom) {
      this.socket.emit("leave_room", { room: prevRoom }, () => {
        console.log(`left Room: ${prevRoom}`);
        this.state.room = null;
      });
    }

    this.socket.emit("enter_room", { room: nextRoom }, () => {
      console.log(`entered Room: ${nextRoom}`);
      this.state.room = nextRoom;
    });

    // this.peerConnections = [makeRTCPeerConnection([])];
  }

  handleChatSubmit(chat) {
    this.socket.emit("new_chat", { chat, room: this.state.room }, () => {
      console.log(`chat sent successfully: ${chat}`);
    });
    this.appendChat({ prefix: "나 : ", chat });
  }
}

export default App;
