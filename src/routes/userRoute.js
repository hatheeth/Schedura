import {userInfo} from "../controllers/usersController.js";

import express from "express";


const router = express.Router();

router.get('/fetchUser', userInfo);

export default router;