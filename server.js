const express = require('express');
const app = express();
const httpSrv = require('http').Server(app);
const io = require('socket.io')(httpSrv);
const conf = require('./config.json');
const port = conf.API_SERVER_LISTEN_PORT;
const cors = require('cors');
const errHandler = require('./utils/error-handler');

app.use(cors());
app.use(errHandler);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('index'));

const server = httpSrv.listen(port, () => {
    console.log('\x1b[36mChatServer listening on port %s\x1b[0m', port);
  });

let roomList = [];
let defaultRoom = 'General'

const addRoomToList = room => {
  let unique = true;
  for(let i=0; i<roomList.length; i++){
    if(roomList[i] === room) {
      unique = false;
      break;
    }
  }
  if(unique) roomList.push(room);
};

const getTimeStamp = () => {
  let date = new Date();
  let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  let timeStamp = date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + minutes;
  timeStamp = `<i>${timeStamp}&ensp;</i>`;
  return timeStamp
};

addRoomToList(defaultRoom);

io.sockets.on('connection', socket => {
  io.emit('update_room_list', roomList);

  socket.on('choose_username', username => {
    // Leave the auto-generated room and join the pre-defined general channel
    let currentRoom = Object.keys(socket.rooms)[0];
    socket.username = username;
    socket.join(defaultRoom);
    socket.leave(currentRoom)
  io.to(defaultRoom).emit('is_online', `${getTimeStamp()}<i>${socket.username} joined room: ${defaultRoom}</i>`);
  });

  socket.on('disconnect', () => {
    let currentRoom = Object.keys(socket.rooms)[0];
    io.to(currentRoom).emit('is_online', `${getTimeStamp()}<i>${socket.username} left the chat!</i>`);
  });

  socket.on('send_message', message => {
    let currentRoom = Object.keys(socket.rooms)[0];
    // Emojies
    let msg = message
      .replace(':)', '&#x1F600')
      .replace('<3', '&#x1F496')
      .replace(':tub', '&#x1F44D');
    io.to(currentRoom).emit('send_message', `${getTimeStamp()}<strong>${socket.username}</strong>: ${msg}`);
  });

  // users may only belong to one room at a time
  socket.on('join_room', room => {
    let currentRoom = Object.keys(socket.rooms)[0];
    if(currentRoom !== room && room !== '') {
      socket.leave(currentRoom)
      socket.join(room);
      addRoomToList(room);
      io.to(room).emit('join_room', `${getTimeStamp()}<i>${socket.username} joined room: ${room}</i>`);
      io.emit('update_room_list', roomList);
    }
  })
});