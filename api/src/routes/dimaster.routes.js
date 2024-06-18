import {Router} from "express"
const router = Router()


import { mensajeMQTT , desconectarMqtt, conectarMqtt ,datos} from "../controller/dimaster.controller.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"
import {validateRolClient}  from "../middlewares/validateRol.middleware.js"
// router.post("/pruebas/:id", pruebas)
 //router.post("/conectar-dimasters/:id", conectarYObtenerDatosDeTodos)
//router.post("/desconectarMqtt/:id", connectAndFetchData)


router.get("/datos",validateRolClient,datos)
router.post("/mensajeMQTT/:id",authRequired,validateRolClient,mensajeMQTT)
router.post("/conectarMqtt/:id",authRequired,validateRolClient, conectarMqtt)
router.post("/desconectarMqtt/:id",authRequired, validateRolClient,desconectarMqtt)
//router.get("/getPruebas", getPruebas)



export default router