import express from 'express'
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import {json} from 'body-parser'
import { createAdapter } from 'socket.io-redis'
import { RedisClient } from 'redis'
import jwt from "jsonwebtoken"


const app = express();
app.use(json())
app.use(cors())

const server = createServer(app)

app.get('/', function(req, res) {
    res.send('this is server')
})

app.get('/api', function(req, res) {
    res.send('this is /api server')
})

server.listen(3000, ()=>{
    console.log('app running 3000')
})