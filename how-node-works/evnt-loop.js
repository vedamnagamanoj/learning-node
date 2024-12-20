const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();

setTimeout(() => {
  console.log("timer 1 finished"), 0;
});

setImmediate(() => console.log("immediate 1 finished"));

fs.readFile("./test-file.txt", "utf-8", (err, data) => {
  console.log("I/O finished");
  setTimeout(() => console.log("timer 2 finished"), 0);
  setTimeout(() => console.log("timer 3 finished"), 3000);
  setImmediate(() => console.log("immediate 2 finished"));
  process.nextTick(() => console.log("Process.nextTick"));
  crypto.pbkdf2("Password", "salt", 100000, 1024, "sha512", () => {
    console.log("password encrypted", Date.now() - start);
  });
  crypto.pbkdf2("Password", "salt", 100000, 1024, "sha512", () => {
    console.log("password encrypted", Date.now() - start);
  });
  crypto.pbkdf2("Password", "salt", 100000, 1024, "sha512", () => {
    console.log("password encrypted", Date.now() - start);
  });
  crypto.pbkdf2("Password", "salt", 100000, 1024, "sha512", () => {
    console.log("password encrypted", Date.now() - start);
  });
});

console.log("Hello from the top level code");
