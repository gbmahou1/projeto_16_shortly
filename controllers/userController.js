import { connection } from '../app.js';

export async function getUsers (req, res) {
    try
    {
        const categories = await connection.query(`SELECT * FROM "public.users"`)
        res.send(categories.rows)
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
};