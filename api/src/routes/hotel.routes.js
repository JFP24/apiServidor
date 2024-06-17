import {Router} from "express"
const router = Router()

import {getHotel ,crearHotel, hotelById, eliminarHotel, actualizarHotel} from "../controller/hotel.controller.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"
router.get("/getHotel", authRequired,getHotel)
router.get("/hotel/:id",authRequired, hotelById)
router.post("/crearHotel/:id",authRequired, crearHotel)
router.put("/updateHotel/:id", authRequired,actualizarHotel)
router.delete("/deleteHotel/:id",authRequired, eliminarHotel)


export default router