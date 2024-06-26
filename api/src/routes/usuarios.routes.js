import {Router} from "express"
const router = Router()

import {registroUsuarios, login,profile, logout, verifyToken, getUsuarios, actualizarUsuarios} from "../controller/usuarios.controller.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"
import {validateRolClient} from "../middlewares/validateRol.middleware.js"

router.post("/registroUser", registroUsuarios)
router.post("/logout", logout)
router.post("/loginUser", login)
router.get("/profile" ,authRequired, profile)
router.get("/verify",verifyToken)
router.get("/usuarios",validateRolClient,getUsuarios)
router.put("/actualizarUser/:id",validateRolClient, actualizarUsuarios)


export default router