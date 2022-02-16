export const getEnteredRoom = (rooms, socketId) =>
  rooms.filter((roomId) => roomId !== socketId);

export const getPublicRooms = (rooms, socketIds) =>
  rooms
    .filter(([roomId, _]) => !socketIds.has(roomId))
    .map(([roomId, participantIdsSet]) => ({
      room: roomId,
      participants: [...participantIdsSet],
    }));
