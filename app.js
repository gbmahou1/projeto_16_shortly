import express from "express";
import dotenv from 'dotenv';
import pg from 'pg';
import router from './routes/index.js';

const app = express();
app.use(express.json());
const { Pool } = pg;
dotenv.config();

const user = 'postgres';
const password = '123456';
const host = 'localhost';
const port = 5432;
const database = 'shortly';

const connection = new Pool({
  user,
  password,
  host,
  port,
  database
});

export { connection };

const portEnv = process.env.PORT;

app.use(router);

app.listen(portEnv, () => {
    console.log(`Listening on ${portEnv}`)
  })