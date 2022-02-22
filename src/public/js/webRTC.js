const makeRTCPeerConnection = ({
  id,
  videoTrack,
  audioTrack,
  onIceCandidate,
  onTrack,
}) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  peerConnection["_id"] = id;
  if (videoTrack instanceof MediaStreamTrack)
    peerConnection.addTrack(videoTrack);
  if (audioTrack instanceof MediaStreamTrack)
    peerConnection.addTrack(audioTrack);
  peerConnection.onicecandidate = onIceCandidate;
  peerConnection.ontrack = onTrack;

  return peerConnection;
};

export default { makeRTCPeerConnection };
