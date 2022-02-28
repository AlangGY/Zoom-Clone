<h1 align="center">알랑 채팅방(Zoom Clone)</h1>

## 📄배포

Loading...😅

## 📄개요

### WebRTC 와 WebSockets를 활용한 채팅 및 화상채팅 웹 애플리케이션 입니다.

WebSocket과 WebRTC의 기술 구현을 위한 튜토리얼 레포지토리입니다.
SocketIO 라이브러리를 통해 NodeJS 서버, 브라우저 클라이언트 간에 WebSocket을 구현하여 실시간 채팅기능을 구현하였으며,
WebSocket을 Signaling Server로서 활용하여 WebRTC를 통해 브라우저간의 실시간 통신을 통해 화상채팅을 구현하였습니다.

### **컴포넌트 패턴**, **flux 패턴**, **옵저버 패턴**을 통해 프론트 개발

- [컴포넌트 패턴](https://ansohxxn.github.io/design%20pattern/chapter1/)을 통해 기능 분담을 분산 시켜, 기능을 파악하기 용이하고, 유지보수가 편해집니다. 동일 기능의 재사용성을 향상 시켰습니다.
- render를 위한 상태 관리를 [flux 패턴](https://facebook.github.io/flux/docs/in-depth-overview/)으로 구현하여, 데이터의 흐름이 단방향으로 흐름에 따라, 보다 정확한 데이터에 따른 rendering과, 데이터 관리, 추적이 수월합니다.
- [옵저버 패턴](https://refactoring.guru/design-patterns/observer)을 구현하기 위해, JavaScript의 Proxy 객체를 활용하였습니다. 이는 React 보다는 Vue의 상태관리 방식에 가까우며, state의 프로퍼티를 변경함에 따라 변화된 데이터로 render()메소드와 setChildState() 메소드를 호출 시키도록 자동화 시켰습니다.

## [지식 WIKI](https://github.com/AlangGY/Zoom-Clone/wiki)

## 📄로컬에서 테스트 하기

- Repository Clone 후,

```
yarn dev // recommended
// or
npm start dev
```

## 📄기술 스택

### Front

- Vanilla JS
- SocketIO (WebSockets + HTTP long polling)
- WebRTC

### Back

- NodeJS
- SocketIO

## 📄디렉토리 구조

```
src
├── libs
│   └── util
│       └── functions.js
├── public
│   └── js
│       ├── Component.template.js
│       ├── app.js
│       ├── components
│       │   ├── Button.js
│       │   ├── ChatRoom.js
│       │   ├── Container.js
│       │   ├── Form.js
│       │   ├── FormCard
│       │   │   ├── FormCardTitle.js
│       │   │   └── index.js
│       │   ├── Header.js
│       │   ├── Input.js
│       │   ├── PrefixContent.js
│       │   ├── RoomList
│       │   │   └── index.js
│       │   ├── Select.js
│       │   ├── Video.js
│       │   ├── VideoList.js
│       │   └── WebCam
│       │       ├── WebCamAudioToggle.js
│       │       ├── WebCamSelect.js
│       │       ├── WebCamVideo.js
│       │       ├── WebCamVideoToggle.js
│       │       └── index.js
│       ├── compounds
│       │   └── Settings.js
│       ├── index.js
│       ├── util
│       │   └── validator
│       │       ├── isMobile.js
│       │       └── validateComponent.js
│       └── webRTC.js
├── server.js
└── views
    ├── css
    │   ├── components
    │   │   ├── Button.css
    │   │   ├── ChatRoom.css
    │   │   ├── FormCard.css
    │   │   ├── Header.css
    │   │   ├── Input.css
    │   │   ├── RoomList.css
    │   │   ├── VideoList.css
    │   │   └── WebCam.css
    │   ├── compounds
    │   │   ├── CamAndChat.css
    │   │   ├── Settings.css
    │   │   └── SideBar.css
    │   └── styles.css
    └── home.pug
```

## 기능
- 룸 기능
- 실시간 채팅 기능
- 실시간 화상채팅 기능

|기능 시연|
|--|
|![화면 기록 2022-02-26 오후 3 23 11](https://user-images.githubusercontent.com/75013334/155917598-00f02c78-e9b2-4f44-b988-2c9d6cbdd478.gif)|
|![화면 기록 2022-02-26 오후 3 24 14](https://user-images.githubusercontent.com/75013334/155917841-7bf3606e-f2a5-4439-83f6-211ac54552ae.gif)|




