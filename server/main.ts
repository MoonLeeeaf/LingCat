import { config } from './config.ts'
import { httpServer } from './server.ts'

httpServer.listen(config.port || 3601, config.hostname)
