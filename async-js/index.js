const fs = require("fs");
const superagent = require("superagent");
const { reject } = require("superagent/lib/request-base");

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject("I could not find the file 🥲");
      resolve(data);
    });
  });
};

const writeFilePromise = (fileName, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (err) => {
      if (err) reject("Cannot write file");
      resolve("Success");
    });
  });

const getDogPic = async () => {
  try {
    const response1 = await readFilePromise(`${__dirname}/dog.txt`);
    const response2 = await superagent.get(
      `https://dog.ceo/api/breed/${response1}/images/random`
    );
    const response3 = await writeFilePromise(
      "dog-img.txt",
      response2.body.message
    );
    console.log(response3);
  } catch (err) {
    throw err;
  }
  return "2. Ready";
};

(async () => {
  try {
    console.log("1. will get dog pics");

    const result = await readFilePromise(`${__dirname}/dog.txt`);

    const response1 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    const response2 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    const response3 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );

    const all = await Promise.all([response1, response2, response3]);

    const data = all.map((el) => el.body.message).join("\n");

    const finalResult = await writeFilePromise("dogs-img.txt", data);
    console.log(finalResult);

    console.log("3. done getting dog pics");
  } catch (err) {
    console.log(err);
  }
})();
// (async () => {
//   try {
//     console.log("1. will get dog pics");

//     const response = await getDogPic();
//     console.log(response);
//     console.log("3. done getting dog pics");
//   } catch (err) {
//     console.log(err);
//   }
// })();

// Promise.all([getDogPic(), getDogPic(), getDogPic()]);

// console.log("1. will get dog pics");
// getDogPic()
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));
// console.log("3. done getting dog pics");
// readFilePromise(`${__dirname}/dog.txt`)
//   .then((result) => {
//     console.log(`Breed: ${result}`);
//     superagent
//       .get(`https://dog.ceo/api/breed/${result}/images/random`)
//       .then((res) => {
//         console.log(res.body.message);

//         writeFilePromise("dog-img.txt", res.body.message)
//           .then((result) => console.log(result))
//           .catch((err) => console.log(err));
//       })
//       .catch((err) => console.log(err.message));
//   })
//   .catch((err) => console.log(err));

// readFilePromise(`${__dirname}/dog.txt`)
//   .then((result) => {
//     console.log(`Breed: ${result}`);
//     return superagent.get(`https://dog.ceo/api/breed/${result}/images/random`);
//   })
//   .then((result) => {
//     console.log(result.body.message);
//     return writeFilePromise("dog-img.txt", result.body.message);
//   })
//   .then((result) => console.log(result))
//   .catch((err) => console.log(err.message));

// readFilePromise(`${__dirname}/dog.txt`)
//   .then((result) => {
//     console.log(`Breed: ${result}`);
//     superagent
//       .get(`https://dog.ceo/api/breed/${result}/images/random`)
//       .then((res) => {
//         console.log(res.body.message);

//         fs.writeFile("dog-img.txt", res.body.message, (err) => {
//           if (err) return console.log(err.message);
//           console.log("Random dog image saved to file!");
//         });
//       })
//       .catch((err) => console.log(err.message));
//   })
//   .catch((err) => console.log(err));

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);
//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((response) => {
//       console.log(response);

//       fs.writeFile("dog-img.txt", response.body.message, (err) => {
//         if (err) return console.log(err.message);
//         console.log("Random dog image saved to file");
//       });
//     })
//     .catch((err) => console.log(err.message));
// });

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//   console.log(`Breed: ${data}`);
//   getDog(data);
// });

// async function getDog(breed) {
//   const response = await fetch(
//     `https://dog.ceo/api/breed/${breed}/images/random`
//   );

//   const data = await response.json();

//   console.log(data);
// }

// getDog();
