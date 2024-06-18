import {Router} from "express"
const router = Router()

import {getHotel ,crearHotel, hotelById, eliminarHotel, actualizarHotel} from "../controller/hotel.controller.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"
import {validateRolClient} from "../middlewares/validateRol.middleware.js"
router.get("/getHotel", authRequired,validateRolClient,getHotel)
router.get("/hotel/:id",authRequired,validateRolClient, hotelById)
router.post("/crearHotel/:id",authRequired,validateRolClient, crearHotel)
router.put("/updateHotel/:id", authRequired,validateRolClient,actualizarHotel)
router.delete("/deleteHotel/:id",authRequired,validateRolClient, eliminarHotel)


export default router