import { createServer } from 'node:http'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'

import yoga, { schema } from './schema'



const server = createServer(yoga)
const wss = new WebSocketServer({
	server,
	path: yoga.graphqlEndpoint,
})

useServer({ schema: schema }, wss)

server.listen(4000)
