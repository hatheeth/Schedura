import { createReservation, getUserReservations, cancelReservation } from "../controllers/reservationsController.js";
import express from "express";
const router = express.Router();


router.post("/create", createReservation );
router.get("/fetch", getUserReservations);
router.put("/cancel", cancelReservation);

export default router;