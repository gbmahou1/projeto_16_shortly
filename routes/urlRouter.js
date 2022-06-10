import express from "express";
import { authenticate } from '../middlewares/authenticateMiddleware.js';
import { shortenUrl, urlId, redirect, deleteUrl } from "../controllers/urlController.js";
import { url } from "inspector";

const urlRouter = express.Router();

urlRouter.post('/urls/shorten', authenticate, shortenUrl);
urlRouter.get('/urls/:id', urlId);
urlRouter.get('/urls/open/:shortUrl', redirect);
urlRouter.delete('/urls/:id', authenticate, deleteUrl);


export default urlRouter;