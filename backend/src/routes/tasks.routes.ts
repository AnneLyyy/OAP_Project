import { Router } from "express";
import wrap from "../infrastructure/wrap.ts";
import * as controller from "../controllers/tasks.controller.ts";

const router = Router();

router.get("/", wrap(controller.getTasks));
router.get("/:id", wrap(controller.getTask));
router.post("/", wrap(controller.createTask));

router.put("/:id", wrap(controller.replaceTask));
router.patch("/:id", wrap(controller.updateTask));
router.put("/", wrap(controller.bulkReplaceTasks));

router.delete("/:id", wrap(controller.deleteTask));

export default router;