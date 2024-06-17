import {Router} from "express"
const router = Router()

import {createHabitaciones, getHabitaciones, habitacionesById, actualizarHabitacion, eliminarHabitacion} from "../controller/habitaciones.controller.js"


import { authRequired } from "../middlewares/validacionToken.middleware.js"

router.post("/crearHabitacion/:id", authRequired,createHabitaciones)
router.get("/habitaciones",authRequired, getHabitaciones)
router.get("/habitacion/:id", authRequired,habitacionesById)
router.get("/habitaciones",authRequired, getHabitaciones)
router.delete("/eliminarHabitacion/:id",authRequired, eliminarHabitacion)
router.put("/actualizarHabitacion/:id",authRequired, actualizarHabitacion)


export default router


