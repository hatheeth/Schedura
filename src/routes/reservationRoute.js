import { createReservation, getUserReservations } from "../controllers/reservationsController.js";
import express from "express";
const router = express.Router();


router.post("/create", createReservation );
router.get("fetch", getUserReservations);

export default router;