import Component from "./Component.template.js";
import ChatRoom from "./components/ChatRoom.js";
import Header from "./components/Header.js";
import RoomList from "./components/RoomList/index.js";
import VideoList from "./components/VideoList.js";
import WebCam from "./components/WebCam/index.js";
import PrefixContent from "./components/PrefixContent.js";
import webRTC from "./webRTC.js";
import Settings from "./compounds/Settings.js";
import Container from "./components/Container.js";

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
  #webCam;
  #videoList;

  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.#header = new Header({
      $target,
      initialState: { title: "알랑 채팅 방" },
    });

    this.#settings = new Settings({
      $target: this.#sideBar.node,
      initialState: {
        nickname: this.state.nickname,
      },
      onNicknameSubmit: (value) => {
        if (!value) return;
        this.handleNicknameSubmit(value);
      },
      onRoomSubmit: (value) => {
        if (!value) return;
        if (!this.state.nickname) {
          alert("닉네임을 먼저 설정해주세요!");
          return;
        }
        this.handleRoomSubmit(value);
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
        hidden: !!!this.state.room,
      },
      onSubmit: (value) => {
        if (!value) return;
        this.handleChatSubmit(value);
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
      onVideoToggled: (on) => {
        if (this.videoTrack) {
          this.videoTrack.enabled = on;
        }
        Object.values(this.peerConnections).forEach(async (peerConnection) => {
          const videoSender = peerConnection
            .getSenders()
            .find((sender) => sender.track?.kind === "video");
          if (videoSender?.track) {
            videoSender.track.enabled = on;
          }
        });
      },
      onAudioToggled: (muted) => {
        if (this.audioTrack) {
          this.audioTrack.enabled = !muted;
        }
        Object.values(this.peerConnections).forEach(async (peerConnection) => {
          const audioSender = peerConnection
            .getSenders()
            .find((sender) => sender.track?.kind === "audio");
          if (audioSender?.track) {
            audioSender.track.enabled = !muted;
          }
        });
      },
      onChangeStream: ({ stream, muted, on }) => {
        console.log("change Stream!");

        const tracks = stream.getTracks();

        const videoTrack = tracks?.find((track) => track.kind === "video");
        videoTrack.enabled = on;
        const audioTrack = tracks?.find((track) => track.kind === "audio");
        audioTrack.enabled = !muted;

        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;

        Object.values(this.peerConnections).forEach(async (peerConnection) => {
          const senders = peerConnection.getSenders();
          console.log(senders);
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
              : peerConnection.addTrack(videoTrack, stream);
          }
          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
          } else if (audioTrack instanceof MediaStreamTrack) {
            const emptySender = senders.find((sender) => !sender.track);
            emptySender
              ? await emptySender.replaceTrack(audioTrack)
              : peerConnection.addTrack(audioTrack, stream);
          }

          console.log(peerConnection.getSenders());
        });
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
      this.#settings,
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
    this.#settings.state.nickname = nickname;
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
      this.peerConnections = {};
      this.state.state = { videos: [], chats: [] };
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
