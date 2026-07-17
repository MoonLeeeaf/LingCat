import knex from "knex"
import { base_data_path } from "../config.ts"

export const db = knex({
    client: 'sqlite3',
    connection: {
        filename: base_data_path + '/LingCat.db'
    },
    useNullAsDefault: true,
})
