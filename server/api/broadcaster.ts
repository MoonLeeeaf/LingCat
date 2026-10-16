import { Package } from "lingcat-protocol";

export function broadcastToUserClients(clients_emiter: { [k: string]: { [k: string]: (mPackage: Package) => void } }, user_id: string, func: (func: (mPackage: Package) => void) => void) {
    Object.values(clients_emiter[user_id] || []).forEach(func)
}