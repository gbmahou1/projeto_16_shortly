import express from "express";
import { authenticate } from '../middlewares/authenticateMiddleware.js';
import { getUsers, signUp, signIn, getUsersId, ranking } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/users', getUsers);
userRouter.post('/signup', signUp);
userRouter.post('/signin', signIn);
userRouter.get('/users/:id', authenticate, getUsersId);
userRouter.get('/ranking', ranking);

export default userRouter;