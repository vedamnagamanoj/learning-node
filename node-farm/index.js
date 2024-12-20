const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');
// Blocking, Synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// // console.log(textIn);

// const textOut = `This is what we know about the avacado: ${textIn}.
// Created on ${new Date().toISOString()}`;

// fs.writeFileSync("./txt/output.txt", textOut);

// const newText = fs.readFileSync("./txt/output.txt", "utf-8");

// console.log(newText);

// Non Blocking Async way
// fs.readFile("./txt/input.txt", "utf-8", (error, data) => {
//   if (error) console.log(error);
//   else console.log(data);
// });
// console.log("Reading input");
// fs.readFile("./txt/output.txt", "utf-8", (error, data) => {
//   if (error) console.log(error);
//   else console.log(data);
// });
// console.log("Reading output");

// fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
//   if (error) return console.log("Error! 💥");
//   console.log(data1);
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (error, data3) => {
//       console.log(data3);
//       fs.writeFile(
//         "./txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         (error) => {
//           console.log("your file has been written. 😄");
//         }
//       );
//     });
//   });
// });
// console.log("Will read file!");

// SERVER

const homepageTemplate = fs.readFileSync(
  `${__dirname}/templates/menu.html`,
  'utf-8'
);
const overviewTemplate = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const cardsTemplate = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const productTemplate = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const apiData = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const apiDataObj = JSON.parse(apiData);

const slugs = apiDataObj.map((obj) =>
  slugify(obj.productName, { lower: true })
);

console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  switch (pathname) {
    case '/':
      res.writeHead(200, {
        'Content-type': 'text/html',
      });

      res.end(homepageTemplate);
      break;
    // Overview Page
    case '/overview': {
      res.writeHead(200, {
        'Content-type': 'text/html',
      });

      const cardsHtml = apiDataObj
        .map((data) => replaceTemplate(cardsTemplate, data))
        .join('');

      const output = overviewTemplate.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

      res.end(output);
      break;
    }
    // Product page
    case '/product': {
      const data = apiDataObj[query.id];
      res.writeHead(200, {
        'Content-type': 'text/html',
      });
      const output = replaceTemplate(productTemplate, data);
      res.end(output);
      break;
    }
    // api

    case '/api':
      res.writeHead(200, {
        'Content-type': 'application/json',
      });
      res.end(apiData);
    // Page not found
    default:
      res.writeHead(404, {
        'Content-type': 'text/html',
        'my-own-header': 'hello-world',
      });
      res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000...');
});
