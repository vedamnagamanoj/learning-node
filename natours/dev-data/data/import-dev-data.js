const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// const DB =
// 'mongodb+srv://vedamnagamanoj:sagHzpiB5gP9y7se@cluster0.llnde.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => console.log('Database connection successful'));

// Reading JSON file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

// delete all existing data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
