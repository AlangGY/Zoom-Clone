import Component from "./Component.template.js";
import ChatRoom from "./components/ChatRoom.js";
import FormCard from "./components/FormCard/index.js";
import Header from "./components/Header.js";
import RoomList from "./components/RoomList/index.js";
import Video from "./components/Video.js";
import VideoList from "./components/VideoList.js";
import WebCam from "./components/WebCam/index.js";
import PrefixContent from "./components/PrefixContent.js";
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
  peerConnections = {};
  audioTrack;
  videoTrack;
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
        title: "닉네임 설정",
        placeholder: "닉네임을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        if (!value) return;
        this.handleNicknameSubmit(value);
        this.#nicknameForm.state.value = "";
      },
    });

    this.#roomForm = new FormCard({
      $target,
      initialState: {
        title: "방 참가",
        placeholder: "방 제목을 입력하세요",
        text: "참가 / 생성",
        value: "",
      },
      onSubmit: (value) => {
        if (!value) return;
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
        value: "",
        hidden: !!!this.state.room,
      },
      onSubmit: (value) => {
        if (!value) return;
        this.handleChatSubmit(value);
        this.#chatRoom.state.value = "";
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
      this.#webCam,
      this.#videoList,
    ];

    this.handleIce = (ice) => {
      console.log(`send ice candidate to ${ice.target._id}`);
      const {
        candidate,
        target: { _id: id },
      } = ice;
      this.socket.emit("ice", { candidate, id });
    };

    this.handleTrack = (event) => {
      console.log(`got track from ${event.target._id}`);
      const videoStream = this.state.videos.find(
        ({ id }) => id === event.target["_id"]
      )?.srcObject;
      if (!videoStream) {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        const video = {
          srcObject: stream,
          width: 200,
          height: 200,
          id: event.target["_id"],
        };
        this.state.videos = [...this.state.videos, video];
        console.log(this.state.videos);
        return;
      }
      videoStream.addTrack(event.track);
      console.log(this.state.videos);
    };
  }

  setChildrenState(state) {
    const { nickname, room, rooms, chats, videos } = state;
    this.#nicknameSpan.state.text = nickname ?? "Unknown";
    this.#roomSpan.state.text = room ?? "없음";
    this.#roomList.state.state = { rooms, currentRoom: room };
    this.#chatRoom.state.state = { chats, hidden: !!!room };
    this.#videoList.state.videos = videos;
    this.render();
    return this;
  }

  setEvent() {
    // Socket Events
    this.socket.on("announce", async ({ type, nickname, prevNickname, id }) => {
      switch (type) {
        case "join":
          this.appendChat({ chat: `'${nickname}'님이 입장하셨습니다.` });
          const peerConnection = webRTC.makeRTCPeerConnection({
            id,
            videoTrack: this.videoTrack,
            audioTrack: this.audioTrack,
            onIceCandidate: this.handleIce,
            onTrack: this.handleTrack,
          });
          this.peerConnections[id] = peerConnection;

          const offer = await peerConnection.createOffer();
          peerConnection.setLocalDescription(offer);
          console.log(`send offer to ${id}`);
          this.socket.emit("offer", { offer, id });
          break;
        case "leave":
          this.appendChat({ chat: `'${nickname}'님이 퇴장하셨습니다.` });
          this.peerConnections[id]?.close();
          delete this.peerConnections[id];
          this.state.videos = this.state.videos.filter(
            ({ id: videoId }) => videoId !== id
          );
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

    this.socket.on("offer", async ({ offer, id }) => {
      console.log(`got offer from ${id}`);
      const peerConnection = webRTC.makeRTCPeerConnection({
        id,
        videoTrack: this.videoTrack,
        audioTrack: this.audioTrack,
        onIceCandidate: this.handleIce,
        onTrack: this.handleTrack,
      });
      peerConnection.setRemoteDescription(offer);
      this.peerConnections[id] = peerConnection;
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", { answer, id });
      console.log(this.peerConnections[id]);
    });

    this.socket.on("answer", ({ answer, id }) => {
      console.log(`got answer from ${id}`);
      if (!this.peerConnections[id]) {
        alert(`${id}와 수립된 peerConnection이 없습니다!`);
        return;
      }
      this.peerConnections[id].setRemoteDescription(answer);
      console.log(this.peerConnections[id]);
    });

    this.socket.on("ice", async ({ candidate, id }) => {
      console.log(`got ice from ${id}`);
      try {
        await this.peerConnections[id].addIceCandidate(candidate);
      } catch (e) {
        console.log("adding Ice Candidate Failed!");
        console.error(e);
      }
    });
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
      Object.values(this.peerConnections).forEach((peerConnection) =>
        peerConnection.close()
      );
      this.peerConnections = [];
      this.state.videos = [];
      this.socket.emit("leave_room", { room: prevRoom }, () => {
        console.log(`left Room: ${prevRoom}`);
        this.state.room = null;
      });
    }

    this.socket.emit("enter_room", { room: nextRoom }, () => {
      console.log(`entered Room: ${nextRoom}`);
      this.state.room = nextRoom;
    });
  }

  handleChatSubmit(chat) {
    this.socket.emit("new_chat", { chat, room: this.state.room }, () => {
      console.log(`chat sent successfully: ${chat}`);
    });
    this.appendChat({ prefix: "나 : ", chat });
  }
}

export default App;
