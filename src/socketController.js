import events from "./events";

let sockets = [];
let inProgress = false;

const socketController = io => socket => {
  const startGame = () => {
    inProgress = true;
    io.emit(events.starting);
  };

  socket.on(events.login, ({ nickname }) => {
    socket.nickname = nickname;
    sockets.push({ id: socket.id, nickname, points: 0 });
    socket.broadcast.emit(events.newUser, { nickname });
    socket.broadcast.emit(events.pong, { sockets });
    if (sockets.length > 1 && inProgress === false) {
      console.log("will start game");
    }
  });

  socket.on(events.sendMessage, ({ message }) => {
    socket.broadcast.emit(events.receiveMessage, {
      message,
      nickname: socket.nickname
    });
  });

  socket.on(events.disconnect, () => {
    socket.broadcast.emit(events.disconnected, { nickname: socket.nickname });
    sockets = sockets.filter(aSocket => aSocket.id !== socket.id);
    socket.broadcast.emit(events.pong, { sockets });
  });

  socket.on(events.moving, ({ x, y }) =>
    socket.broadcast.emit(events.moved, { x, y })
  );
  socket.on(events.painting, ({ x, y }) =>
    socket.broadcast.emit(events.painted, { x, y })
  );
  socket.on(events.filling, ({ color }) =>
    socket.broadcast.emit(events.filled, { color })
  );
  socket.on(events.ping, () => {
    socket.emit(events.pong, { sockets });
  });
};

export default socketController;
