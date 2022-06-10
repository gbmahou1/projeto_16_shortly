import { connection } from '../app.js';
import joi from 'joi';
import { v4 as uuid } from 'uuid';
import { nanoid } from 'nanoid'

export async function shortenUrl (req, res) {
    try
    {
        const { url } = req.body;
        const authorization = req.headers.authorization;
        const activeSession = await connection.query(`SELECT * FROM "public.sessions" WHERE token = $1`, [authorization]);
        const userId = activeSession.rows[0].userId;
        const shortUrl = nanoid(7);
        await connection.query('INSERT INTO "public.urls" (url, shortened, "userId", visits) VALUES ($1, $2, $3, $4)', [url, shortUrl, userId, 0]);
        res.status(201).send(shortUrl);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 

}

export async function urlId (req, res) {
    try
    {
        const {id} = req.params;
        if (!id)
        return res.sendStatus(404);
        const result = await connection.query(`SELECT * FROM "public.urls" WHERE id = $1`, [id]);
        if (result.rows.length === 0)
        return res.sendStatus(404);
        const body = {id: result.rows[0].id, shortUrl: result.rows[0].shortened, url: result.rows[0].url};
        console.log(body);
        return res.status(200).send(body);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}

export async function redirect (req, res) {
    try
    {
        const {shortUrl} = req.params;
        if (!shortUrl)
        return res.sendStatus(404);
        const result = await connection.query(`SELECT * FROM "public.urls" WHERE shortened = $1`, [shortUrl]);
        if (result.rows.length === 0)
        return res.sendStatus(404);
        const url = result.rows[0].url;
        res.redirect(200, url);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}

export async function deleteUrl (req, res) {
    try
    {
        const authorization = req.headers.authorization;
        const {id} = req.params;
        if (!id)
        return res.sendStatus(404);
        const result = await connection.query(`SELECT * FROM "public.urls" WHERE id = $1`, [id]);
        if (result.rows.length === 0)
        return res.sendStatus(404);
        const activeSession = await connection.query(`SELECT * FROM "public.sessions" WHERE token = $1`, [authorization]);
        const userId = activeSession.rows[0].userId;
        if (result.rows[0].userId != userId)
        res.sendStatus(401);
        await connection.query(`DELETE FROM "public.urls" WHERE id = $1;`, [id]);
        return res.sendStatus(204);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}



