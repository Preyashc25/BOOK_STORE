const http = require('http')
const app = require('./app')


const server = http.createServer(app)

server.listen(process.env.PORT_NO,()=>{
    console.log('The server is Running on PORT 3000')
})
