const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
// Connect to hosted DB using mongoose
mongoose
  .connect(DB, {
    useNewUrlParse: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const app = require(`./app`);
// console.log(process.env);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Application running on port: ${port}`);
});
