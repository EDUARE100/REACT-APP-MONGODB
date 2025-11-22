
import express from "express"

const app = express()
const port = 8080

app.get("/", (req,res) => {
    res.send("Hola mundo")
})

app.listen(port,() => {
    console.log(`Escuchando al puerto: ${port}`)
})