exports = module.exports = function(io) {
  // Set socket.io listeners.
  
  var clients = {};
  io.on("connection", socket => {
    console.log('a user connected');
    console.log("cliente conected");
    console.log(socket.adapter.rooms);
    // On conversation entry, join broadcast channel
    socket.on("join", parm => {
      

      clients[socket.id] = parm.name;
      socket.join(parm.room);
      //console.log(socket.id)
      var sendParams =
      {
        msg: parm.name + " entrou na sala.",
        quant: socket.adapter.rooms[parm.room].length
      }
      socket.broadcast.to(parm.room).emit('update', sendParams);
      //console.log('joined ' + parm);  
      sendParams.msg = "Você entrou na sala."
      console.log("voce entrou na sala", parm.room);
      console.log(socket.adapter.rooms);
      socket.emit('update', sendParams);
      
  
    });

    socket.on("leave", room => {
      
      socket.leave(room);
      console.log('saiu', room);
      console.log(socket.adapter.rooms);
      var sendParams;
      if(typeof socket.adapter.rooms[room] == "undefined" || socket.adapter.rooms[room] == null){
        sendParams = {
          msg:  clients[socket.id] + " saiu da sala.",
          quant: 0
        }
      }else{
        sendParams = {
          msg:  clients[socket.id] + " saiu da sala.",
          quant: socket.adapter.rooms[room].length
        }
      } 
      socket.broadcast.to(room).emit('update', sendParams);
      delete clients[socket.id];
      // console.log('left ' + conversation);
    });

    socket.on("send", parms => {
      parms.name = clients[socket.id];
      console.log(parms);
      socket.broadcast.to(parms.room).emit('chat', parms);
      //socket.in(parms.room).emit("chat", parms);
      //io.sockets.in(room).emit("update", room);
    });
  });
};
