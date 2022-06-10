import { connection } from '../app.js';

export async function authenticate(req, res, next) {
    try
    {
        const authorization = req.headers.authorization;
        const token = authorization?.replace("Bearer", "").trim();
        if (!authorization)
        return res.sendStatus(401);
        const activeSession = await connection.query(`SELECT * FROM "public.sessions" WHERE token = $1`, [authorization]);
        if (activeSession.rows.length === 0)
        return res.sendStatus(401);
        next();
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}