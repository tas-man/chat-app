// Initialize io connection
let socket = io();
// Message form
$("#chatForm").submit(e => {
  e.preventDefault();
  if($("#msgInput").val().length > 0) {
    socket.emit("send_message", $("#msgInput").val());
    $("#msgInput").val("");
  }
});
// Room form
$("#roomForm").submit(e => {
  e.preventDefault();
  socket.emit("join_room", $("#roomInput").val());
  $("#roomInput").val("");
  $("#roomModal").modal("toggle");
  return false;
});
// Room list items
$(document).on("click", ".roomListBtn", e => {
  $("#roomInput").val(e.target.innerHTML);
  return false;
});
// Emoji selection
$(document).on("click", ".emojiBtn", e => {
  $("#msgInput").val($("#msgInput").val() + e.target.value);
  return false;
});

// SOCKET IO events

// Choose name
let username = prompt("Choose a nickname") || "Anonymous";
socket.emit("choose_username", username);
// Notify of new connections
socket.on("is_online", data => {
  $("#messages").append($('<li class="list-group-item teal lighten-4 border-0">').html(data));
});
// Send messages
socket.on("send_message", msg => {
  $("#messages").append($('<li class="list-group-item border-0">').html(msg));
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
});
// Notify of new connections to room
socket.on("join_room", data => {
  $("#messages").append($('<li class="list-group-item teal lighten-4 border-0">').html(data));
});
// Update room list
socket.on("update_room_list", data => {
  $("#roomList").children().remove();
  data.forEach(room => {
    $("#roomList").append($('<button class="btn teal lighten-4 roomListBtn">').html(room).val(room));
  });
});

