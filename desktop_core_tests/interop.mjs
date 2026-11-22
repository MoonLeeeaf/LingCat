import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sodium from 'libsodium-wrappers-sumo'
import protobuf from 'protobufjs'

await sodium.ready

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROTO_DIR = path.join(REPO_ROOT, 'protocol')
const VECTORS_DIR = process.argv[2] ?? '/tmp/opencode/lingcat-interop'
const CSHARP_VECTORS = path.join(VECTORS_DIR, 'csharp_vectors.json')
const TS_VECTORS = path.join(VECTORS_DIR, 'ts_vectors.json')

fs.mkdirSync(VECTORS_DIR, { recursive: true })

const root = await protobuf.load([
    path.join(PROTO_DIR, 'classes.proto'),
    path.join(PROTO_DIR, 'methods.proto'),
])
const PackageMessage = root.lookupType('lingcat.classes.Package')

const hex = (bytes) => Buffer.from(bytes).toString('hex')
const fromHex = (text) => Uint8Array.from(Buffer.from(text, 'hex'))

function assert(condition, message) {
    if (!condition) throw new Error(`assertion failed: ${message}`)
}

function assertHex(expected, actual, message) {
    assert(hex(expected) === hex(actual), `${message} (expected ${hex(expected)}, actual ${hex(actual)})`)
}

// 与 protocol/SecureKey.ts 完全相同的 HKDF 实现
function hkdfExtract(salt, ikm) {
    return sodium.crypto_auth_hmacsha256(ikm, salt)
}

function hkdfExpand(prk, info, length) {
    let okm = new Uint8Array(0)
    let previous = new Uint8Array(0)
    let blockIndex = 1
    while (okm.length < length) {
        const input = new Uint8Array(previous.length + info.length + 1)
        input.set(previous, 0)
        input.set(info, previous.length)
        input[input.length - 1] = blockIndex
        const block = sodium.crypto_auth_hmacsha256(input, prk)
        okm = new Uint8Array([...okm, ...block])
        previous = block
        blockIndex++
    }
    return okm.slice(0, length)
}

function hkdf(ikm, salt, info, length) {
    return hkdfExpand(hkdfExtract(salt, ikm), info, length)
}

function concat(...parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0)
    const result = new Uint8Array(total)
    let offset = 0
    for (const part of parts) {
        result.set(part, offset)
        offset += part.length
    }
    return result
}

function decodePackage(bytes) {
    return PackageMessage.decode(bytes)
}

function decryptPackage(pkg, key) {
    assert((pkg.flags & 1) !== 0, 'package should be encrypted')
    return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        concat(pkg.data, pkg.tag),
        pkg.aad,
        pkg.iv,
        key,
    )
}

// ===== 验证 C# 输出 =====
const csharp = JSON.parse(fs.readFileSync(CSHARP_VECTORS, 'utf8'))

{
    const alicePrivate = fromHex(csharp.x25519.alicePrivate)
    const alicePublic = fromHex(csharp.x25519.alicePublic)
    const bobPrivate = fromHex(csharp.x25519.bobPrivate)
    const bobPublic = fromHex(csharp.x25519.bobPublic)
    const expected = fromHex(csharp.x25519.shared)

    assertHex(sodium.crypto_scalarmult_base(alicePrivate), alicePublic, 'c# alice public key')
    assertHex(sodium.crypto_scalarmult_base(bobPrivate), bobPublic, 'c# bob public key')
    assertHex(sodium.crypto_scalarmult(alicePrivate, bobPublic), expected, 'c# shared secret (alice)')
    assertHex(sodium.crypto_scalarmult(bobPrivate, alicePublic), expected, 'c# shared secret (bob)')
    console.log('[ok] C# X25519 与 libsodium 一致')
}

{
    const ikm = fromHex(csharp.hkdf.ikm)
    const salt = fromHex(csharp.hkdf.salt)
    const keyRecv = hkdf(ikm, salt, sodium.from_string('server-to-client'), 32)
    const keySend = hkdf(ikm, salt, sodium.from_string('client-to-server'), 32)

    assertHex(keyRecv, fromHex(csharp.hkdf.keyRecv), 'c# hkdf keyRecv')
    assertHex(keySend, fromHex(csharp.hkdf.keySend), 'c# hkdf keySend')
    console.log('[ok] C# HKDF 与 libsodium 实现一致')
}

{
    const keyPair = sodium.crypto_sign_seed_keypair(fromHex(csharp.ed25519.seed))
    assertHex(keyPair.publicKey, fromHex(csharp.ed25519.longTermPublic), 'c# ed25519 public key')

    const message = concat(
        fromHex(csharp.ed25519.serverPublic),
        fromHex(csharp.ed25519.clientPublic),
    )
    const verified = sodium.crypto_sign_verify_detached(
        fromHex(csharp.ed25519.signature),
        message,
        fromHex(csharp.ed25519.longTermPublic),
    )
    assert(verified, 'c# ed25519 signature should verify')
    console.log('[ok] C# Ed25519 签名可被 libsodium 验证')
}

{
    const pkg = decodePackage(fromHex(csharp.package.bytes))
    const plaintext = decryptPackage(pkg, fromHex(csharp.package.key))
    assertHex(plaintext, fromHex(csharp.package.data), 'c# package plaintext')
    assert(Number(pkg.seq) === csharp.package.seq, 'c# package seq')
    console.log('[ok] libsodium 可解密 C# 加密的 Package')

    const plain = decodePackage(fromHex(csharp.plain.bytes))
    assert(Number(plain.methodId) === csharp.plain.methodId, 'c# plain method id')
    assertHex(plain.requestId, fromHex(csharp.plain.requestId), 'c# plain request id')
    assertHex(plain.data, fromHex(csharp.plain.data), 'c# plain data')
    console.log('[ok] protobufjs 可解析 C# 编码的 Package')
}

// ===== 生成 TypeScript 侧向量，交给 C# 验证 =====
const alice = sodium.crypto_kx_keypair()
const bob = sodium.crypto_kx_keypair()
const shared = sodium.crypto_scalarmult(alice.privateKey, bob.publicKey)

const ikm = sodium.randombytes_buf(32)
const salt = sodium.randombytes_buf(32)
const keyRecv = hkdf(ikm, salt, sodium.from_string('server-to-client'), 32)
const keySend = hkdf(ikm, salt, sodium.from_string('client-to-server'), 32)

const seed = sodium.randombytes_buf(sodium.crypto_sign_SEEDBYTES)
const longTerm = sodium.crypto_sign_seed_keypair(seed)
const edMessage = concat(bob.publicKey, alice.publicKey)
const signature = sodium.crypto_sign_detached(edMessage, longTerm.privateKey)

const packageKey = sodium.randombytes_buf(32)
const packageData = sodium.from_string('hello from typescript')
const packageSeq = 7
const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
const aad = new Uint8Array(4)
new DataView(aad.buffer).setUint32(0, packageSeq, false)
const ciphertextWithTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    packageData,
    aad,
    null,
    nonce,
    packageKey,
)
const ciphertext = ciphertextWithTag.slice(0, ciphertextWithTag.length - 16)
const tag = ciphertextWithTag.slice(ciphertextWithTag.length - 16)

const requestId = Uint8Array.from([9, 8, 7, 6, 5, 4])
const packageBytes = PackageMessage.encode(PackageMessage.create({
    methodId: 3,
    flags: 1,
    requestId,
    seq: packageSeq,
    data: ciphertext,
    iv: nonce,
    aad,
    tag,
    protocolVersion: 2,
})).finish()

const plainData = sodium.from_string('plain payload from typescript')
const plainRequestId = Uint8Array.from([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff])
const plainBytes = PackageMessage.encode(PackageMessage.create({
    methodId: 0x5,
    flags: 0,
    requestId: plainRequestId,
    seq: 0xffffffff,
    data: plainData,
    protocolVersion: 2,
})).finish()

const tsVectors = {
    x25519: {
        alicePrivate: hex(alice.privateKey),
        alicePublic: hex(alice.publicKey),
        bobPrivate: hex(bob.privateKey),
        bobPublic: hex(bob.publicKey),
        shared: hex(shared),
    },
    hkdf: {
        ikm: hex(ikm),
        salt: hex(salt),
        keyRecv: hex(keyRecv),
        keySend: hex(keySend),
    },
    ed25519: {
        seed: hex(seed),
        longTermPublic: hex(longTerm.publicKey),
        serverPublic: hex(bob.publicKey),
        clientPublic: hex(alice.publicKey),
        signature: hex(signature),
    },
    package: {
        key: hex(packageKey),
        seq: packageSeq,
        data: hex(packageData),
        bytes: hex(packageBytes),
    },
    plain: {
        methodId: 0x5,
        requestId: hex(plainRequestId),
        data: hex(plainData),
        bytes: hex(plainBytes),
    },
}

fs.writeFileSync(TS_VECTORS, JSON.stringify(tsVectors, null, 2))
console.log(`[ok] 已写入 ${TS_VECTORS}`)
