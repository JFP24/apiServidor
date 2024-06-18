import {Router} from "express"
const router = Router()

import {createHabitaciones, getHabitaciones, habitacionesById, actualizarHabitacion, eliminarHabitacion} from "../controller/habitaciones.controller.js"

import {validateRolClient}  from "../middlewares/validateRol.middleware.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"

router.post("/crearHabitacion/:id", authRequired,validateRolClient,createHabitaciones)
router.get("/habitaciones",authRequired, validateRolClient,getHabitaciones)
//router.get("/habitacion/:id", authRequired,habitacionesById)
router.get("/habitaciones",authRequired, validateRolClient,getHabitaciones)
router.delete("/eliminarHabitacion/:id",authRequired,validateRolClient, eliminarHabitacion)
router.put("/actualizarHabitacion/:id",authRequired,validateRolClient, actualizarHabitacion)


export default router


