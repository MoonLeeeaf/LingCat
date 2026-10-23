/**
 * 通用 IndexedDB 键值存储封装。
 * 一个实例对应一个数据库 + 一个 object store。
 */
export default class IndexedDBStore<T = unknown> {
    private dbPromise: Promise<IDBDatabase> | null = null

    constructor(
        private readonly dbName: string,
        private readonly storeName: string,
        private readonly version = 1,
    ) { }

    private open(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise

        this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new Error('IndexedDB 不可用'))
                return
            }

            const req = indexedDB.open(this.dbName, this.version)
            req.onupgradeneeded = () => {
                const db = req.result
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName)
                }
            }
            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })

        return this.dbPromise
    }

    private async run<R>(
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => IDBRequest<R>,
    ): Promise<R> {
        const db = await this.open()

        return new Promise<R>((resolve, reject) => {
            const tx = db.transaction(this.storeName, mode)
            let result!: R

            const req = operation(tx.objectStore(this.storeName))
            req.onsuccess = () => { result = req.result }
            req.onerror = () => reject(req.error)

            tx.oncomplete = () => resolve(result)
            tx.onabort = () => reject(tx.error)
            tx.onerror = () => reject(tx.error)
        })
    }

    get(key: IDBValidKey): Promise<T | undefined> {
        return this.run('readonly', (store) => store.get(key))
    }

    set(key: IDBValidKey, value: T): Promise<void> {
        return this.run('readwrite', (store) => store.put(value, key)).then(() => { })
    }

    delete(key: IDBValidKey): Promise<void> {
        return this.run('readwrite', (store) => store.delete(key)).then(() => { })
    }

    clear(): Promise<void> {
        return this.run('readwrite', (store) => store.clear()).then(() => { })
    }

    keys(): Promise<IDBValidKey[]> {
        return this.run('readonly', (store) => store.getAllKeys())
    }
}
