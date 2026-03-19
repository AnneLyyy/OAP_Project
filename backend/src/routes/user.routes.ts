import { Router } from "express";
import wrap from "../infrastructure/wrap.ts";
import * as ctrl from "../controllers/user.stats.controllers.ts";

const router = Router();

router.get("/", wrap(ctrl.getStats));
router.get("/:id", wrap(ctrl.getStatById));
router.post("/", wrap(ctrl.createSnapshot));

export default router;