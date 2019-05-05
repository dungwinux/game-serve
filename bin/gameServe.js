#!/usr/bin/env node

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 5000;
console.log(`Hosting from ${process.cwd()}`);
app.use(require("express").static(process.cwd()));

var roomno = 0;
const roomLimit = parseInt(process.env.ROOM_LIMIT) || 2;

io.of("/game").on("connection", (socket) => {
    console.log(`${socket.client.id} connected`);

    let roomList = io.nsps["/game"].adapter.rooms;

    if (
        roomList["room" + roomno] &&
        roomList["room" + roomno].length >= roomLimit
    )
        roomno++;

    let myRoom = "room" + roomno;
    socket.join(myRoom);

    console.log(`${socket.client.id} in ${myRoom}`);

    socket.on("disconnect", () => {
        console.log(`${socket.client.id} disconnected`);
        socket.leaveAll();
    });
    socket.on("data", (msg) => {
        io.of("/game").emit("data", msg);
    });
    socket.on("ready", (_) => {
        // TODO: Do something with msg
        if (roomList[myRoom])
            io.of("/game").emit("ready", roomList[myRoom].length);
    });
});

http.on("error", () => {
    let listener = http.listen(0, () => {
        console.log(`Cannot host on ${PORT}. Using random port...`);
        console.log(`Listening on localhost:${listener.address().port}`);
    });
});

http.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);
});
