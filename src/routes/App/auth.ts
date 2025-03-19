import { Router } from "express";
import { loginUser, registerUser } from "../../controllers/App/authController";

const router = Router();

router.put('/', registerUser);
router.post('/login', loginUser);

export default router;