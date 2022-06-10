import { connection } from '../app.js';
import joi from 'joi';
import { v4 as uuid } from 'uuid';

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

export async function signUp (req, res) {
    const userSchema = joi.object({
        name: joi.string().required(),
	    password: joi.string().required(),
        email: joi.string().email().required()
    });
    try
    {
        const { name, email, password, confirmPassword } = req.body;
        const user = { name, email, password };
        if (password != confirmPassword)
        {
            console.log("A senha e a confirmação estão diferentes...")
            return res.sendStatus(422);
        }
        const validation = userSchema.validate(user, { abortEarly: false });
        if (validation.error)
        {
            console.log(validation.error.details);
            return res.sendStatus(422);
        }
        await connection.query('INSERT INTO "public.users" (name, email, password) VALUES ($1, $2, $3)', [name, email, password]);
        res.sendStatus(201);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}

export async function signIn (req, res) {
    const userSchema = joi.object({
        email: joi.string().email().required(),
	    password: joi.string().required()
    });
    try
    {
        const { email, password } = req.body;
        const user = { email, password };
        const validation = userSchema.validate(user, { abortEarly: false });
        if (validation.error)
        {
            console.log(validation.error.details);
            return res.sendStatus(422);
        }
        const loggedUser = await connection.query(`SELECT * FROM "public.users" WHERE email = $1 AND password = $2`, [email, password]);
        if (loggedUser.rows.length === 0)
        {
            return res.sendStatus(401);
        }
        const token = uuid();
        await connection.query(`INSERT INTO "public.sessions" ("userId", token) VALUES ($1, $2)`, [loggedUser.rows[0].id, token]);
        return res.status(200).send(token);
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}

export async function getUsersId (req, res) {
    try
    {
        const {id} = req.params;
        if (!id)
        return res.sendStatus(404);
        const user = await connection.query(`SELECT * FROM "public.users" WHERE id = $1`, [id]);
        if (user.rows.length === 0)
        return res.sendStatus(404);
        const urls = await connection.query(`
        SELECT * FROM "public.urls"
        WHERE "userId" = $1`, [id]);
        let visitCount = 0;
        for (let i=0; i< urls.rows.length; i++)
        {
            visitCount = visitCount + parseInt(urls.rows[i].visits);
        }
        let body = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            visitCount: visitCount,
            shortenedUrls: urls.rows
        }
        res.status(200).send(body); 
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    }
}

export async function ranking (req, res) {
    try
    {
        let result = await connection.query(`
        SELECT "userId",
            SUM(visits) AS "visitCount",
            "public.users".name
        FROM "public.urls"
        JOIN "public.users" ON "public.urls"."userId" = "public.users".id
        GROUP BY "userId", "public.users".name
        ORDER BY SUM(visits) DESC
        `);
        return res.send(result.rows);

    }
    catch(error)
    {
        console.log(error)
        res.status(500).send(error)
    } 
}