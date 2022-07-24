const http = require("http");
const app = require("./app");
require("dotenv").config();

socketEvents = require("./socketEvents");

const port = process.env.PORT || 21138;

const server = http.createServer(app);

const io = require("socket.io")(server, {
  path: "//chatsk/socket.io",
  log: false,
  agent: false,
  origins: "*:*",
  transports: [
    "websocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling",
    "polling"
  ]
});

socketEvents(io);

server.listen(port);

console.log("Online!!");
