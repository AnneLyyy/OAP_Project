import { Router } from "express";
import wrap from "../infrastructure/wrap.ts";
import * as ctrl from "../controllers/users.controllers.ts";

const router = Router();
router.get("/", wrap(ctrl.getUsers));
router.get("/:id", wrap(ctrl.getUser));
router.post("/", wrap(ctrl.createUser));
router.put("/:id", wrap(ctrl.updateUser));
router.delete("/:id", wrap(ctrl.deleteUser));
export default router;