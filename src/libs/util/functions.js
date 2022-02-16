export const getEnteredRoom = (rooms, socketId) =>
  rooms
    .filter(
      ([roomId, participantsSet]) =>
        roomId !== socketId && participantsSet.has(socketId)
    )
    .map(([roomId]) => roomId);
