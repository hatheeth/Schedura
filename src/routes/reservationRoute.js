import { createReservation } from "../controllers/reservationsController.js";
import express from "express";
const router = express.Router();


router.post("/create", createReservation );

export default router;