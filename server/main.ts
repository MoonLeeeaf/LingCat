import { base_data_path, config } from './config.ts'
import createLingCatServer from './server.ts'

createLingCatServer(base_data_path).httpServer.listen(config.port || 3601, config.hostname)
