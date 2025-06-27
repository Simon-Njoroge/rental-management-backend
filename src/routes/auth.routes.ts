import { Router } from "express";
import { login, logout, refreshTokens,googleLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/logout/:id", logout);
router.post("/google-login", googleLogin);
router.post("/refresh-tokens", refreshTokens);

export default router;
