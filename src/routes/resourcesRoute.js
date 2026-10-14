import express from "express";
import {
  getResources,
  getResourcesUser,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from "../controllers/resourcesController.js";

const router = express.Router();

router.get("/", getResources);
router.get("/user", getResourcesUser);
router.get("/:id", getResourceById);
router.post("/", createResource);
router.patch("/:id", updateResource);
router.delete("/:id", deleteResource);

export default router;
