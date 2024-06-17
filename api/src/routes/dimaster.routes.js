import {Router} from "express"
const router = Router()


import { mensajeMQTT , desconectarMqtt, conectarMqtt ,datos} from "../controller/dimaster.controller.js"
import { authRequired } from "../middlewares/validacionToken.middleware.js"
// router.post("/pruebas/:id", pruebas)
 //router.post("/conectar-dimasters/:id", conectarYObtenerDatosDeTodos)
//router.post("/desconectarMqtt/:id", connectAndFetchData)


router.get("/datos",datos)
router.post("/mensajeMQTT/:id",authRequired,mensajeMQTT)
router.post("/conectarMqtt/:id",authRequired, conectarMqtt)
router.post("/desconectarMqtt/:id",authRequired, desconectarMqtt)
//router.get("/getPruebas", getPruebas)



export default router