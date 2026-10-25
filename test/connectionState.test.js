import assert from 'node:assert/strict'
import test from 'node:test'
import LingCatClient from '../client_protocol/LingCatClient.ts'
import { LingCatProto, Methods, Package, SecureKey } from 'lingcat-protocol'

class Socket extends EventTarget {
    static instances = []
    static OPEN = 1
    readyState = Socket.OPEN
    constructor() { super(); Socket.instances.push(this) }
    send() {}
    close() { this.dispatchEvent(new Event('close')) }
    handshake() {
        this.dispatchEvent(new Event('open'))
        const event = new Event('message')
        event.data = new ArrayBuffer(0)
        this.dispatchEvent(event)
    }
}

function setup(t, verified = true) {
    const original = globalThis.WebSocket
    globalThis.WebSocket = Socket
    Socket.instances = []
    const client = new LingCatClient({
        server_ws: 'ws://localhost', server_http: 'http://localhost', server_public_key: new Uint8Array(32),
    })
    t.after(() => { client.disconnect(); globalThis.WebSocket = original })
    t.mock.method(Package, 'decode', () => ({
        seq: 0, isDecrypted: false, method_id: Methods.HandShake_Response,
        data: new Uint8Array(), request_id: new Uint8Array(16), flags: 0, length: 0,
    }))
    t.mock.method(LingCatProto.methods.HandShake_Response, 'decode', () => ({
        serverPublicKey: new Uint8Array(32), messageToBeVerify: new Uint8Array(), salt: new Uint8Array(32),
    }))
    t.mock.method(SecureKey, 'Client_checkSignedMessage', () => verified)
    t.mock.method(SecureKey, 'All_getSharedSecret', () => new Uint8Array(32))
    t.mock.method(SecureKey, 'Client_hkdf', () => ({ keyRecv: new Uint8Array(32), keySend: new Uint8Array(32) }))
    return client
}

test('connection notices follow verified handshake, reconnect and manual disconnect', t => {
    const client = setup(t)
    const states = []
    const unsubscribe = client.subscribeConnectionState(() => states.push(client.connectionState))
    client.init()
    const first = Socket.instances[0]
    assert.equal(client.connectionState, 'connecting')
    first.handshake()
    assert.equal(client.connectionState, 'connected')
    first.close()
    assert.equal(client.connectionState, 'reconnecting')
    assert.equal(Socket.instances.length, 2)
    const second = Socket.instances[1]
    second.handshake()
    assert.equal(client.connectionState, 'connected')
    // A stale socket must not change the replacement connection's status.
    first.close()
    assert.equal(client.connectionState, 'connected')
    client.disconnect()
    assert.equal(Socket.instances.length, 2)
    assert.deepEqual(states, ['connecting', 'connected', 'reconnecting', 'connected', 'disconnected'])
    unsubscribe()
    client.init()
    assert.equal(states.length, 5)
})

test('failed server verification never reports connected or starts reconnecting', t => {
    const client = setup(t, false)
    const states = []
    let reason
    client.onHandshakeFailed = value => { reason = value }
    client.subscribeConnectionState(() => states.push(client.connectionState))
    client.init()
    Socket.instances[0].handshake()
    assert.equal(reason, 'server_public_key_mismatch')
    assert.equal(client.connectionState, 'disconnected')
    assert.equal(Socket.instances.length, 1)
    assert.deepEqual(states, ['connecting', 'disconnected'])
})
