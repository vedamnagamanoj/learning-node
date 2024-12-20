const EventEmitter = require("events");
const http = require("http");

// class Sales extends EventEmitter {
//   constructor() {
//     super();
//   }
// }

// const myEmmitter = new Sales();

// myEmmitter.on("newSale", () => {
//   console.log("There was an new sale!");
// });

// myEmmitter.on("newOrder", (data) => {
//   console.log("Customer name: Jonas", data);
// });

// // myEmmitter.emit("newSale");
// myEmmitter.emit("newOrder", 23);

/////////////////////////

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request recived");
  res.end("Request Received");
});

server.on("request", (req, res) => {
  console.log("Another request 😄");
});

server.on("close", () => {
  console.log("server closed");
  res.end("server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for request");
});
