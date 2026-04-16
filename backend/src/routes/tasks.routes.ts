import { Router } from "express";
import * as ctrl from "../controllers/tasks.controller.ts";
import wrap from "../infrastructure/wrap.ts";

const router = Router();

router.get("/", wrap(ctrl.getTasks));
router.get("/by-date", wrap(ctrl.getTasksByDate));
router.get("/with-users", wrap(ctrl.getTasksWithUsers));
router.get("/count", wrap(ctrl.getTasksCount));

router.get("/:id", wrap(ctrl.getTask));
router.post("/", wrap(ctrl.createTask));
router.patch("/:id", wrap(ctrl.updateTask));
router.delete("/:id", wrap(ctrl.deleteTask));

export default router;