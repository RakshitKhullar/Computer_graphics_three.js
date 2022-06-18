const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;  

app.use(express.static(path.join(__dirname,"/public")));
app.get('/',function(req, res) {
  res.sendFile(__dirname+"/index.html"); 
});

io.sockets.on('connection', function(socket){
	socket.userData = { x:0, y:0, z:0, heading:0 };
 
	console.log(`${socket.id} connected`);
	socket.emit('setId', { id:socket.id });
	
    socket.on('disconnect', function(){
		socket.broadcast.emit('deletePlayer', { id: socket.id });
    });	
	
	socket.on('init', function(data){
		console.log(`socket.init ${data.model}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = "Idle";
	});
	
	socket.on('update', function(data){
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = data.action;
	});
	
	socket.on('chat message', function(data){
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	})
});

http.listen(PORT,()=>{
    console.log(`Listening to the port ${PORT}`);
})

setInterval(function(){
	const nsp = io.of('/');
    let pack = [];
	
    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		if (socket.userData.model!==undefined){
			pack.push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});    
		}
    }
	if (pack.length>0) io.emit('remoteData', pack);
}, 40);











// const express = require('express')
// const app = express()  
// const http = require('http').createServer(app)
// const io = require("socket.io")(http)
// const util = require('util')

// const PORT = process.env.PORT || 3000;  

// app.get("/",(req,res)=>{
//     res.sendFile(__dirname+"/index.html"); 
// })

// io.on('connection', function(socket){
//     console.log('a user connected ');
//     io.emit('rooms', getRooms('connected'));
//     socket.on('disconnect', function(){
//       console.log('user disconnected');
//     });
//     socket.on('new room', function(room){
//         console.log(`A new room is created ${room}`);
//         socket.room = room;
//         socket.join(room);
//           io.emit('rooms', getRooms('new room'));
//     });
//     socket.on('join room', function(room){
//         console.log(`A new user joined room ${room}`);
//         socket.room = room;
//         socket.join(room);
//           io.emit('rooms', getRooms('joined room'));
//     });
//     socket.on('chat message', function(data){
//       io.in(data.room).emit('chat message', `${data.name}: ${data.msg}` );
//     });
//     socket.on('set username', function(name){ 
//         console.log(`username set to ${name}(${socket.id})`);
//         socket.username = name; 
//     });
//   });

// http.listen(PORT,()=>{
//     console.log(`Listening to the port ${PORT}`);
// })


// function getRooms(msg){
//     const nsp = io.of('/');
//     const rooms = nsp.adapter.rooms;
//     /*Returns data in this form
//     {
//       'roomid1': { 'socketid1', socketid2', ...},
//       ...
//     }
//     */
//     //console.log('getRooms rooms>>' + util.inspect(rooms));
  
//     const list = {};
      
//     for(let roomId in rooms){
//         const room = rooms[roomId];
//         if (room===undefined) continue;
//         const sockets = [];
//         let roomName = "";
//         //console.log('getRooms room>>' + util.inspect(room));
//         for(let socketId in room.sockets){
//             const socket = nsp.connected[socketId];
//             if (socket===undefined || socket.username===undefined || socket.room===undefined) continue;
//             //console.log(`getRooms socket(${socketId})>>${socket.username}:${socket.room}`);
//             sockets.push(socket.username);
//             if (roomName=="") roomName = socket.room;
//         }
//         if (roomName!="") list[roomName] = sockets;
//     }
      
//     console.log(`getRooms: ${msg} >>` + util.inspect(list));
      
//     return list;
//   }