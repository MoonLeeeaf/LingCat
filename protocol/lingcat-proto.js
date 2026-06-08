/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const lingcat = $root.lingcat = (() => {

    /**
     * Namespace lingcat.
     * @exports lingcat
     * @namespace
     */
    const lingcat = {};

    lingcat.classes = (function() {

        /**
         * Namespace classes.
         * @memberof lingcat
         * @namespace
         */
        const classes = {};

        classes.EncryptedMessage = (function() {

            /**
             * Properties of an EncryptedMessage.
             * @typedef {Object} lingcat.classes.EncryptedMessage.$Properties
             * @property {number|null} [seq] EncryptedMessage seq
             * @property {Uint8Array|null} [iv] EncryptedMessage iv
             * @property {Uint8Array|null} [data] EncryptedMessage data
             * @property {Uint8Array|null} [aad] EncryptedMessage aad
             * @property {Uint8Array|null} [tag] EncryptedMessage tag
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an EncryptedMessage.
             * @memberof lingcat.classes
             * @interface IEncryptedMessage
             * @augments lingcat.classes.EncryptedMessage.$Properties
             * @deprecated Use lingcat.classes.EncryptedMessage.$Properties instead.
             */

            /**
             * Shape of an EncryptedMessage.
             * @typedef {lingcat.classes.EncryptedMessage.$Properties} lingcat.classes.EncryptedMessage.$Shape
             */

            /**
             * Constructs a new EncryptedMessage.
             * @memberof lingcat.classes
             * @classdesc Represents an EncryptedMessage.
             * @constructor
             * @param {lingcat.classes.EncryptedMessage.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function EncryptedMessage(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EncryptedMessage seq.
             * @member {number} seq
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             */
            EncryptedMessage.prototype.seq = 0;

            /**
             * EncryptedMessage iv.
             * @member {Uint8Array} iv
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             */
            EncryptedMessage.prototype.iv = $util.newBuffer([]);

            /**
             * EncryptedMessage data.
             * @member {Uint8Array} data
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             */
            EncryptedMessage.prototype.data = $util.newBuffer([]);

            /**
             * EncryptedMessage aad.
             * @member {Uint8Array} aad
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             */
            EncryptedMessage.prototype.aad = $util.newBuffer([]);

            /**
             * EncryptedMessage tag.
             * @member {Uint8Array} tag
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             */
            EncryptedMessage.prototype.tag = $util.newBuffer([]);

            /**
             * Creates a new EncryptedMessage instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {lingcat.classes.EncryptedMessage.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.EncryptedMessage} EncryptedMessage instance
             * @type {{
             *   (properties: lingcat.classes.EncryptedMessage.$Shape): lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape;
             *   (properties?: lingcat.classes.EncryptedMessage.$Properties): lingcat.classes.EncryptedMessage;
             * }}
             */
            EncryptedMessage.create = function create(properties) {
                return new EncryptedMessage(properties);
            };

            /**
             * Encodes the specified EncryptedMessage message. Does not implicitly {@link lingcat.classes.EncryptedMessage.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {lingcat.classes.EncryptedMessage.$Properties} message EncryptedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EncryptedMessage.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.seq);
                if (message.iv != null && Object.hasOwnProperty.call(message, "iv"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.iv);
                if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                if (message.aad != null && Object.hasOwnProperty.call(message, "aad"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.aad);
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.tag);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified EncryptedMessage message, length delimited. Does not implicitly {@link lingcat.classes.EncryptedMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {lingcat.classes.EncryptedMessage.$Properties} message EncryptedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EncryptedMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an EncryptedMessage message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape} EncryptedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EncryptedMessage.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.EncryptedMessage(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.seq = value;
                            else
                                delete message.seq;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.iv = value;
                            else
                                delete message.iv;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.data = value;
                            else
                                delete message.data;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.aad = value;
                            else
                                delete message.aad;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.tag = value;
                            else
                                delete message.tag;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes an EncryptedMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape} EncryptedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EncryptedMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EncryptedMessage message.
             * @function verify
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EncryptedMessage.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.seq != null && message.hasOwnProperty("seq"))
                    if (!$util.isInteger(message.seq))
                        return "seq: integer expected";
                if (message.iv != null && message.hasOwnProperty("iv"))
                    if (!(message.iv && typeof message.iv.length === "number" || $util.isString(message.iv)))
                        return "iv: buffer expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                if (message.aad != null && message.hasOwnProperty("aad"))
                    if (!(message.aad && typeof message.aad.length === "number" || $util.isString(message.aad)))
                        return "aad: buffer expected";
                if (message.tag != null && message.hasOwnProperty("tag"))
                    if (!(message.tag && typeof message.tag.length === "number" || $util.isString(message.tag)))
                        return "tag: buffer expected";
                return null;
            };

            /**
             * Creates an EncryptedMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.EncryptedMessage} EncryptedMessage
             */
            EncryptedMessage.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.classes.EncryptedMessage)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.classes.EncryptedMessage();
                if (object.seq != null)
                    if (Number(object.seq) !== 0)
                        message.seq = object.seq >>> 0;
                if (object.iv != null)
                    if (object.iv.length)
                        if (typeof object.iv === "string")
                            $util.base64.decode(object.iv, message.iv = $util.newBuffer($util.base64.length(object.iv)), 0);
                        else if (object.iv.length >= 0)
                            message.iv = object.iv;
                if (object.data != null)
                    if (object.data.length)
                        if (typeof object.data === "string")
                            $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                        else if (object.data.length >= 0)
                            message.data = object.data;
                if (object.aad != null)
                    if (object.aad.length)
                        if (typeof object.aad === "string")
                            $util.base64.decode(object.aad, message.aad = $util.newBuffer($util.base64.length(object.aad)), 0);
                        else if (object.aad.length >= 0)
                            message.aad = object.aad;
                if (object.tag != null)
                    if (object.tag.length)
                        if (typeof object.tag === "string")
                            $util.base64.decode(object.tag, message.tag = $util.newBuffer($util.base64.length(object.tag)), 0);
                        else if (object.tag.length >= 0)
                            message.tag = object.tag;
                return message;
            };

            /**
             * Creates a plain object from an EncryptedMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {lingcat.classes.EncryptedMessage} message EncryptedMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EncryptedMessage.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.seq = 0;
                    if (options.bytes === String)
                        object.iv = "";
                    else {
                        object.iv = [];
                        if (options.bytes !== Array)
                            object.iv = $util.newBuffer(object.iv);
                    }
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                    if (options.bytes === String)
                        object.aad = "";
                    else {
                        object.aad = [];
                        if (options.bytes !== Array)
                            object.aad = $util.newBuffer(object.aad);
                    }
                    if (options.bytes === String)
                        object.tag = "";
                    else {
                        object.tag = [];
                        if (options.bytes !== Array)
                            object.tag = $util.newBuffer(object.tag);
                    }
                }
                if (message.seq != null && message.hasOwnProperty("seq"))
                    object.seq = message.seq;
                if (message.iv != null && message.hasOwnProperty("iv"))
                    object.iv = options.bytes === String ? $util.base64.encode(message.iv, 0, message.iv.length) : options.bytes === Array ? Array.prototype.slice.call(message.iv) : message.iv;
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                if (message.aad != null && message.hasOwnProperty("aad"))
                    object.aad = options.bytes === String ? $util.base64.encode(message.aad, 0, message.aad.length) : options.bytes === Array ? Array.prototype.slice.call(message.aad) : message.aad;
                if (message.tag != null && message.hasOwnProperty("tag"))
                    object.tag = options.bytes === String ? $util.base64.encode(message.tag, 0, message.tag.length) : options.bytes === Array ? Array.prototype.slice.call(message.tag) : message.tag;
                return object;
            };

            /**
             * Converts this EncryptedMessage to JSON.
             * @function toJSON
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EncryptedMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for EncryptedMessage
             * @function getTypeUrl
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            EncryptedMessage.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.EncryptedMessage";
            };

            return EncryptedMessage;
        })();

        classes.User = (function() {

            /**
             * Properties of a User.
             * @typedef {Object} lingcat.classes.User.$Properties
             * @property {string|null} [id] 用户 ID 在服务端为真实 ID, 在客户端为服务端生成的针对某个客户端的临时 ID
             * @property {string|null} [username] User username
             * @property {string|null} [nickname] User nickname
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a User.
             * @memberof lingcat.classes
             * @interface IUser
             * @augments lingcat.classes.User.$Properties
             * @deprecated Use lingcat.classes.User.$Properties instead.
             */

            /**
             * Shape of a User.
             * @typedef {lingcat.classes.User.$Properties} lingcat.classes.User.$Shape
             */

            /**
             * Constructs a new User.
             * @memberof lingcat.classes
             * @classdesc Represents a User.
             * @constructor
             * @param {lingcat.classes.User.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function User(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * 用户 ID 在服务端为真实 ID, 在客户端为服务端生成的针对某个客户端的临时 ID
             * @member {string} id
             * @memberof lingcat.classes.User
             * @instance
             */
            User.prototype.id = "";

            /**
             * User username.
             * @member {string|null|undefined} username
             * @memberof lingcat.classes.User
             * @instance
             */
            User.prototype.username = null;

            /**
             * User nickname.
             * @member {string} nickname
             * @memberof lingcat.classes.User
             * @instance
             */
            User.prototype.nickname = "";

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(User.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new User instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.User
             * @static
             * @param {lingcat.classes.User.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.User} User instance
             * @type {{
             *   (properties: lingcat.classes.User.$Shape): lingcat.classes.User & lingcat.classes.User.$Shape;
             *   (properties?: lingcat.classes.User.$Properties): lingcat.classes.User;
             * }}
             */
            User.create = function create(properties) {
                return new User(properties);
            };

            /**
             * Encodes the specified User message. Does not implicitly {@link lingcat.classes.User.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.User
             * @static
             * @param {lingcat.classes.User.$Properties} message User message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.nickname != null && Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified User message, length delimited. Does not implicitly {@link lingcat.classes.User.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.User
             * @static
             * @param {lingcat.classes.User.$Properties} message User message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a User message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.User
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.User & lingcat.classes.User.$Shape} User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.User(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.string();
                            message._username = "username";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.nickname = value;
                            else
                                delete message.nickname;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a User message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.User
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.User & lingcat.classes.User.$Shape} User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a User message.
             * @function verify
             * @memberof lingcat.classes.User
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.username != null && message.hasOwnProperty("username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.nickname != null && message.hasOwnProperty("nickname"))
                    if (!$util.isString(message.nickname))
                        return "nickname: string expected";
                return null;
            };

            /**
             * Creates a User message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.User
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.User} User
             */
            User.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.classes.User)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.classes.User();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = String(object.id);
                if (object.username != null)
                    message.username = String(object.username);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = String(object.nickname);
                return message;
            };

            /**
             * Creates a plain object from a User message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.User
             * @static
             * @param {lingcat.classes.User} message User
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.nickname = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.username != null && message.hasOwnProperty("username"))
                    object.username = message.username;
                if (message.nickname != null && message.hasOwnProperty("nickname"))
                    object.nickname = message.nickname;
                return object;
            };

            /**
             * Converts this User to JSON.
             * @function toJSON
             * @memberof lingcat.classes.User
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User
             * @function getTypeUrl
             * @memberof lingcat.classes.User
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.User";
            };

            return User;
        })();

        classes.Group = (function() {

            /**
             * Properties of a Group.
             * @typedef {Object} lingcat.classes.Group.$Properties
             * @property {string|null} [id] Group id
             * @property {string|null} [groupUnique] Group groupUnique
             * @property {string|null} [name] Group name
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a Group.
             * @memberof lingcat.classes
             * @interface IGroup
             * @augments lingcat.classes.Group.$Properties
             * @deprecated Use lingcat.classes.Group.$Properties instead.
             */

            /**
             * Shape of a Group.
             * @typedef {lingcat.classes.Group.$Properties} lingcat.classes.Group.$Shape
             */

            /**
             * Constructs a new Group.
             * @memberof lingcat.classes
             * @classdesc Represents a Group.
             * @constructor
             * @param {lingcat.classes.Group.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function Group(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Group id.
             * @member {string} id
             * @memberof lingcat.classes.Group
             * @instance
             */
            Group.prototype.id = "";

            /**
             * Group groupUnique.
             * @member {string|null|undefined} groupUnique
             * @memberof lingcat.classes.Group
             * @instance
             */
            Group.prototype.groupUnique = null;

            /**
             * Group name.
             * @member {string} name
             * @memberof lingcat.classes.Group
             * @instance
             */
            Group.prototype.name = "";

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(Group.prototype, "_groupUnique", {
                get: $util.oneOfGetter($oneOfFields = ["groupUnique"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Group instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.Group
             * @static
             * @param {lingcat.classes.Group.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.Group} Group instance
             * @type {{
             *   (properties: lingcat.classes.Group.$Shape): lingcat.classes.Group & lingcat.classes.Group.$Shape;
             *   (properties?: lingcat.classes.Group.$Properties): lingcat.classes.Group;
             * }}
             */
            Group.create = function create(properties) {
                return new Group(properties);
            };

            /**
             * Encodes the specified Group message. Does not implicitly {@link lingcat.classes.Group.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.Group
             * @static
             * @param {lingcat.classes.Group.$Properties} message Group message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Group.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.groupUnique != null && Object.hasOwnProperty.call(message, "groupUnique"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.groupUnique);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Group message, length delimited. Does not implicitly {@link lingcat.classes.Group.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.Group
             * @static
             * @param {lingcat.classes.Group.$Properties} message Group message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Group.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Group message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.Group
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.Group & lingcat.classes.Group.$Shape} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Group.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.Group(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.groupUnique = reader.string();
                            message._groupUnique = "groupUnique";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.name = value;
                            else
                                delete message.name;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a Group message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.Group
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.Group & lingcat.classes.Group.$Shape} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Group.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Group message.
             * @function verify
             * @memberof lingcat.classes.Group
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Group.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.groupUnique != null && message.hasOwnProperty("groupUnique")) {
                    properties._groupUnique = 1;
                    if (!$util.isString(message.groupUnique))
                        return "groupUnique: string expected";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                return null;
            };

            /**
             * Creates a Group message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.Group
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.Group} Group
             */
            Group.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.classes.Group)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.classes.Group();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = String(object.id);
                if (object.groupUnique != null)
                    message.groupUnique = String(object.groupUnique);
                if (object.name != null)
                    if (typeof object.name !== "string" || object.name.length)
                        message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from a Group message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.Group
             * @static
             * @param {lingcat.classes.Group} message Group
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Group.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.groupUnique != null && message.hasOwnProperty("groupUnique"))
                    object.groupUnique = message.groupUnique;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                return object;
            };

            /**
             * Converts this Group to JSON.
             * @function toJSON
             * @memberof lingcat.classes.Group
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Group.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Group
             * @function getTypeUrl
             * @memberof lingcat.classes.Group
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Group.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.Group";
            };

            return Group;
        })();

        return classes;
    })();

    lingcat.methods = (function() {

        /**
         * Namespace methods.
         * @memberof lingcat
         * @namespace
         */
        const methods = {};

        methods.Error_Response = (function() {

            /**
             * Properties of an Error_Response.
             * @typedef {Object} lingcat.methods.Error_Response.$Properties
             * @property {number|null} [requestMethod] Error_Response requestMethod
             * @property {string|null} [message] Error_Response message
             * @property {number|null} [code] Error_Response code
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of an Error_Response.
             * @memberof lingcat.methods
             * @interface IError_Response
             * @augments lingcat.methods.Error_Response.$Properties
             * @deprecated Use lingcat.methods.Error_Response.$Properties instead.
             */

            /**
             * Shape of an Error_Response.
             * @typedef {lingcat.methods.Error_Response.$Properties} lingcat.methods.Error_Response.$Shape
             */

            /**
             * Constructs a new Error_Response.
             * @memberof lingcat.methods
             * @classdesc Represents an Error_Response.
             * @constructor
             * @param {lingcat.methods.Error_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function Error_Response(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Error_Response requestMethod.
             * @member {number} requestMethod
             * @memberof lingcat.methods.Error_Response
             * @instance
             */
            Error_Response.prototype.requestMethod = 0;

            /**
             * Error_Response message.
             * @member {string|null|undefined} message
             * @memberof lingcat.methods.Error_Response
             * @instance
             */
            Error_Response.prototype.message = null;

            /**
             * Error_Response code.
             * @member {number|null|undefined} code
             * @memberof lingcat.methods.Error_Response
             * @instance
             */
            Error_Response.prototype.code = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(Error_Response.prototype, "_message", {
                get: $util.oneOfGetter($oneOfFields = ["message"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(Error_Response.prototype, "_code", {
                get: $util.oneOfGetter($oneOfFields = ["code"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Error_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {lingcat.methods.Error_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Error_Response} Error_Response instance
             * @type {{
             *   (properties: lingcat.methods.Error_Response.$Shape): lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape;
             *   (properties?: lingcat.methods.Error_Response.$Properties): lingcat.methods.Error_Response;
             * }}
             */
            Error_Response.create = function create(properties) {
                return new Error_Response(properties);
            };

            /**
             * Encodes the specified Error_Response message. Does not implicitly {@link lingcat.methods.Error_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {lingcat.methods.Error_Response.$Properties} message Error_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error_Response.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.requestMethod != null && Object.hasOwnProperty.call(message, "requestMethod"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.requestMethod);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.code);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Error_Response message, length delimited. Does not implicitly {@link lingcat.methods.Error_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {lingcat.methods.Error_Response.$Properties} message Error_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error_Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Error_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape} Error_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error_Response.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Error_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.requestMethod = value;
                            else
                                delete message.requestMethod;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.message = reader.string();
                            message._message = "message";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.code = reader.uint32();
                            message._code = "code";
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes an Error_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape} Error_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error_Response.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Error_Response message.
             * @function verify
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Error_Response.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.requestMethod != null && message.hasOwnProperty("requestMethod"))
                    if (!$util.isInteger(message.requestMethod))
                        return "requestMethod: integer expected";
                if (message.message != null && message.hasOwnProperty("message")) {
                    properties._message = 1;
                    if (!$util.isString(message.message))
                        return "message: string expected";
                }
                if (message.code != null && message.hasOwnProperty("code")) {
                    properties._code = 1;
                    if (!$util.isInteger(message.code))
                        return "code: integer expected";
                }
                return null;
            };

            /**
             * Creates an Error_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Error_Response} Error_Response
             */
            Error_Response.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.Error_Response)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.Error_Response();
                if (object.requestMethod != null)
                    if (Number(object.requestMethod) !== 0)
                        message.requestMethod = object.requestMethod >>> 0;
                if (object.message != null)
                    message.message = String(object.message);
                if (object.code != null)
                    message.code = object.code >>> 0;
                return message;
            };

            /**
             * Creates a plain object from an Error_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {lingcat.methods.Error_Response} message Error_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Error_Response.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.requestMethod = 0;
                if (message.requestMethod != null && message.hasOwnProperty("requestMethod"))
                    object.requestMethod = message.requestMethod;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.code != null && message.hasOwnProperty("code"))
                    object.code = message.code;
                return object;
            };

            /**
             * Converts this Error_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Error_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Error_Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Error_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Error_Response.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Error_Response";
            };

            return Error_Response;
        })();

        methods.HandShake_Request = (function() {

            /**
             * Properties of a HandShake_Request.
             * @typedef {Object} lingcat.methods.HandShake_Request.$Properties
             * @property {string|null} [publicKey] HandShake_Request publicKey
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a HandShake_Request.
             * @memberof lingcat.methods
             * @interface IHandShake_Request
             * @augments lingcat.methods.HandShake_Request.$Properties
             * @deprecated Use lingcat.methods.HandShake_Request.$Properties instead.
             */

            /**
             * Shape of a HandShake_Request.
             * @typedef {lingcat.methods.HandShake_Request.$Properties} lingcat.methods.HandShake_Request.$Shape
             */

            /**
             * Constructs a new HandShake_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a HandShake_Request.
             * @constructor
             * @param {lingcat.methods.HandShake_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function HandShake_Request(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * HandShake_Request publicKey.
             * @member {string} publicKey
             * @memberof lingcat.methods.HandShake_Request
             * @instance
             */
            HandShake_Request.prototype.publicKey = "";

            /**
             * Creates a new HandShake_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {lingcat.methods.HandShake_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.HandShake_Request} HandShake_Request instance
             * @type {{
             *   (properties: lingcat.methods.HandShake_Request.$Shape): lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape;
             *   (properties?: lingcat.methods.HandShake_Request.$Properties): lingcat.methods.HandShake_Request;
             * }}
             */
            HandShake_Request.create = function create(properties) {
                return new HandShake_Request(properties);
            };

            /**
             * Encodes the specified HandShake_Request message. Does not implicitly {@link lingcat.methods.HandShake_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {lingcat.methods.HandShake_Request.$Properties} message HandShake_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            HandShake_Request.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.publicKey);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified HandShake_Request message, length delimited. Does not implicitly {@link lingcat.methods.HandShake_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {lingcat.methods.HandShake_Request.$Properties} message HandShake_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            HandShake_Request.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a HandShake_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape} HandShake_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            HandShake_Request.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.HandShake_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.publicKey = value;
                            else
                                delete message.publicKey;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a HandShake_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape} HandShake_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            HandShake_Request.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a HandShake_Request message.
             * @function verify
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            HandShake_Request.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    if (!$util.isString(message.publicKey))
                        return "publicKey: string expected";
                return null;
            };

            /**
             * Creates a HandShake_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.HandShake_Request} HandShake_Request
             */
            HandShake_Request.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.HandShake_Request)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.HandShake_Request();
                if (object.publicKey != null)
                    if (typeof object.publicKey !== "string" || object.publicKey.length)
                        message.publicKey = String(object.publicKey);
                return message;
            };

            /**
             * Creates a plain object from a HandShake_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {lingcat.methods.HandShake_Request} message HandShake_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            HandShake_Request.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.publicKey = "";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    object.publicKey = message.publicKey;
                return object;
            };

            /**
             * Converts this HandShake_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.HandShake_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            HandShake_Request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for HandShake_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            HandShake_Request.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.HandShake_Request";
            };

            return HandShake_Request;
        })();

        methods.HandShake_Response = (function() {

            /**
             * Properties of a HandShake_Response.
             * @typedef {Object} lingcat.methods.HandShake_Response.$Properties
             * @property {Uint8Array|null} [salt] HandShake_Response salt
             * @property {Uint8Array|null} [verifyMessage] HandShake_Response verifyMessage
             * @property {string|null} [publicKey] HandShake_Response publicKey
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a HandShake_Response.
             * @memberof lingcat.methods
             * @interface IHandShake_Response
             * @augments lingcat.methods.HandShake_Response.$Properties
             * @deprecated Use lingcat.methods.HandShake_Response.$Properties instead.
             */

            /**
             * Shape of a HandShake_Response.
             * @typedef {lingcat.methods.HandShake_Response.$Properties} lingcat.methods.HandShake_Response.$Shape
             */

            /**
             * Constructs a new HandShake_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a HandShake_Response.
             * @constructor
             * @param {lingcat.methods.HandShake_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function HandShake_Response(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * HandShake_Response salt.
             * @member {Uint8Array} salt
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.salt = $util.newBuffer([]);

            /**
             * HandShake_Response verifyMessage.
             * @member {Uint8Array} verifyMessage
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.verifyMessage = $util.newBuffer([]);

            /**
             * HandShake_Response publicKey.
             * @member {string} publicKey
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.publicKey = "";

            /**
             * Creates a new HandShake_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {lingcat.methods.HandShake_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.HandShake_Response} HandShake_Response instance
             * @type {{
             *   (properties: lingcat.methods.HandShake_Response.$Shape): lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape;
             *   (properties?: lingcat.methods.HandShake_Response.$Properties): lingcat.methods.HandShake_Response;
             * }}
             */
            HandShake_Response.create = function create(properties) {
                return new HandShake_Response(properties);
            };

            /**
             * Encodes the specified HandShake_Response message. Does not implicitly {@link lingcat.methods.HandShake_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {lingcat.methods.HandShake_Response.$Properties} message HandShake_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            HandShake_Response.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.salt != null && Object.hasOwnProperty.call(message, "salt"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.salt);
                if (message.verifyMessage != null && Object.hasOwnProperty.call(message, "verifyMessage"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.verifyMessage);
                if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.publicKey);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified HandShake_Response message, length delimited. Does not implicitly {@link lingcat.methods.HandShake_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {lingcat.methods.HandShake_Response.$Properties} message HandShake_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            HandShake_Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a HandShake_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape} HandShake_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            HandShake_Response.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.HandShake_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.salt = value;
                            else
                                delete message.salt;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.verifyMessage = value;
                            else
                                delete message.verifyMessage;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.publicKey = value;
                            else
                                delete message.publicKey;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a HandShake_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape} HandShake_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            HandShake_Response.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a HandShake_Response message.
             * @function verify
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            HandShake_Response.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.salt != null && message.hasOwnProperty("salt"))
                    if (!(message.salt && typeof message.salt.length === "number" || $util.isString(message.salt)))
                        return "salt: buffer expected";
                if (message.verifyMessage != null && message.hasOwnProperty("verifyMessage"))
                    if (!(message.verifyMessage && typeof message.verifyMessage.length === "number" || $util.isString(message.verifyMessage)))
                        return "verifyMessage: buffer expected";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    if (!$util.isString(message.publicKey))
                        return "publicKey: string expected";
                return null;
            };

            /**
             * Creates a HandShake_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.HandShake_Response} HandShake_Response
             */
            HandShake_Response.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.HandShake_Response)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.HandShake_Response();
                if (object.salt != null)
                    if (object.salt.length)
                        if (typeof object.salt === "string")
                            $util.base64.decode(object.salt, message.salt = $util.newBuffer($util.base64.length(object.salt)), 0);
                        else if (object.salt.length >= 0)
                            message.salt = object.salt;
                if (object.verifyMessage != null)
                    if (object.verifyMessage.length)
                        if (typeof object.verifyMessage === "string")
                            $util.base64.decode(object.verifyMessage, message.verifyMessage = $util.newBuffer($util.base64.length(object.verifyMessage)), 0);
                        else if (object.verifyMessage.length >= 0)
                            message.verifyMessage = object.verifyMessage;
                if (object.publicKey != null)
                    if (typeof object.publicKey !== "string" || object.publicKey.length)
                        message.publicKey = String(object.publicKey);
                return message;
            };

            /**
             * Creates a plain object from a HandShake_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {lingcat.methods.HandShake_Response} message HandShake_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            HandShake_Response.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.salt = "";
                    else {
                        object.salt = [];
                        if (options.bytes !== Array)
                            object.salt = $util.newBuffer(object.salt);
                    }
                    if (options.bytes === String)
                        object.verifyMessage = "";
                    else {
                        object.verifyMessage = [];
                        if (options.bytes !== Array)
                            object.verifyMessage = $util.newBuffer(object.verifyMessage);
                    }
                    object.publicKey = "";
                }
                if (message.salt != null && message.hasOwnProperty("salt"))
                    object.salt = options.bytes === String ? $util.base64.encode(message.salt, 0, message.salt.length) : options.bytes === Array ? Array.prototype.slice.call(message.salt) : message.salt;
                if (message.verifyMessage != null && message.hasOwnProperty("verifyMessage"))
                    object.verifyMessage = options.bytes === String ? $util.base64.encode(message.verifyMessage, 0, message.verifyMessage.length) : options.bytes === Array ? Array.prototype.slice.call(message.verifyMessage) : message.verifyMessage;
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    object.publicKey = message.publicKey;
                return object;
            };

            /**
             * Converts this HandShake_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            HandShake_Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for HandShake_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            HandShake_Response.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.HandShake_Response";
            };

            return HandShake_Response;
        })();

        methods.Ping_Request = (function() {

            /**
             * Properties of a Ping_Request.
             * @typedef {Object} lingcat.methods.Ping_Request.$Properties
             * @property {number|Long|null} [time] Ping_Request time
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a Ping_Request.
             * @memberof lingcat.methods
             * @interface IPing_Request
             * @augments lingcat.methods.Ping_Request.$Properties
             * @deprecated Use lingcat.methods.Ping_Request.$Properties instead.
             */

            /**
             * Shape of a Ping_Request.
             * @typedef {lingcat.methods.Ping_Request.$Properties} lingcat.methods.Ping_Request.$Shape
             */

            /**
             * Constructs a new Ping_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Ping_Request.
             * @constructor
             * @param {lingcat.methods.Ping_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function Ping_Request(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Ping_Request time.
             * @member {number|Long} time
             * @memberof lingcat.methods.Ping_Request
             * @instance
             */
            Ping_Request.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Ping_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {lingcat.methods.Ping_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Ping_Request} Ping_Request instance
             * @type {{
             *   (properties: lingcat.methods.Ping_Request.$Shape): lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape;
             *   (properties?: lingcat.methods.Ping_Request.$Properties): lingcat.methods.Ping_Request;
             * }}
             */
            Ping_Request.create = function create(properties) {
                return new Ping_Request(properties);
            };

            /**
             * Encodes the specified Ping_Request message. Does not implicitly {@link lingcat.methods.Ping_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {lingcat.methods.Ping_Request.$Properties} message Ping_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping_Request.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.time);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Ping_Request message, length delimited. Does not implicitly {@link lingcat.methods.Ping_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {lingcat.methods.Ping_Request.$Properties} message Ping_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping_Request.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Ping_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape} Ping_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping_Request.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Ping_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                message.time = value;
                            else
                                delete message.time;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a Ping_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape} Ping_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping_Request.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Ping_Request message.
             * @function verify
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Ping_Request.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.time != null && message.hasOwnProperty("time"))
                    if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                        return "time: integer|Long expected";
                return null;
            };

            /**
             * Creates a Ping_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Ping_Request} Ping_Request
             */
            Ping_Request.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.Ping_Request)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.Ping_Request();
                if (object.time != null)
                    if (typeof object.time === "object" ? object.time.low || object.time.high : Number(object.time) !== 0)
                        if ($util.Long)
                            message.time = $util.Long.fromValue(object.time, false);
                        else if (typeof object.time === "string")
                            message.time = parseInt(object.time, 10);
                        else if (typeof object.time === "number")
                            message.time = object.time;
                        else if (typeof object.time === "object")
                            message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Ping_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {lingcat.methods.Ping_Request} message Ping_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Ping_Request.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                    } else
                        object.time = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
                if (message.time != null && message.hasOwnProperty("time"))
                    if (typeof BigInt !== "undefined" && options.longs === BigInt)
                        object.time = typeof message.time === "number" ? BigInt(message.time) : $util.Long.fromBits(message.time.low >>> 0, message.time.high >>> 0, false).toBigInt();
                    else if (typeof message.time === "number")
                        object.time = options.longs === String ? String(message.time) : message.time;
                    else
                        object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
                return object;
            };

            /**
             * Converts this Ping_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Ping_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ping_Request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Ping_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Ping_Request.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Ping_Request";
            };

            return Ping_Request;
        })();

        methods.Ping_Response = (function() {

            /**
             * Properties of a Ping_Response.
             * @typedef {Object} lingcat.methods.Ping_Response.$Properties
             * @property {number|Long|null} [usage] Ping_Response usage
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a Ping_Response.
             * @memberof lingcat.methods
             * @interface IPing_Response
             * @augments lingcat.methods.Ping_Response.$Properties
             * @deprecated Use lingcat.methods.Ping_Response.$Properties instead.
             */

            /**
             * Shape of a Ping_Response.
             * @typedef {lingcat.methods.Ping_Response.$Properties} lingcat.methods.Ping_Response.$Shape
             */

            /**
             * Constructs a new Ping_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Ping_Response.
             * @constructor
             * @param {lingcat.methods.Ping_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function Ping_Response(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Ping_Response usage.
             * @member {number|Long} usage
             * @memberof lingcat.methods.Ping_Response
             * @instance
             */
            Ping_Response.prototype.usage = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Ping_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {lingcat.methods.Ping_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Ping_Response} Ping_Response instance
             * @type {{
             *   (properties: lingcat.methods.Ping_Response.$Shape): lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape;
             *   (properties?: lingcat.methods.Ping_Response.$Properties): lingcat.methods.Ping_Response;
             * }}
             */
            Ping_Response.create = function create(properties) {
                return new Ping_Response(properties);
            };

            /**
             * Encodes the specified Ping_Response message. Does not implicitly {@link lingcat.methods.Ping_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {lingcat.methods.Ping_Response.$Properties} message Ping_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping_Response.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.usage != null && Object.hasOwnProperty.call(message, "usage"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.usage);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Ping_Response message, length delimited. Does not implicitly {@link lingcat.methods.Ping_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {lingcat.methods.Ping_Response.$Properties} message Ping_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping_Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Ping_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape} Ping_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping_Response.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Ping_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                message.usage = value;
                            else
                                delete message.usage;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a Ping_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape} Ping_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping_Response.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Ping_Response message.
             * @function verify
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Ping_Response.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.usage != null && message.hasOwnProperty("usage"))
                    if (!$util.isInteger(message.usage) && !(message.usage && $util.isInteger(message.usage.low) && $util.isInteger(message.usage.high)))
                        return "usage: integer|Long expected";
                return null;
            };

            /**
             * Creates a Ping_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Ping_Response} Ping_Response
             */
            Ping_Response.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.Ping_Response)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.Ping_Response();
                if (object.usage != null)
                    if (typeof object.usage === "object" ? object.usage.low || object.usage.high : Number(object.usage) !== 0)
                        if ($util.Long)
                            message.usage = $util.Long.fromValue(object.usage, false);
                        else if (typeof object.usage === "string")
                            message.usage = parseInt(object.usage, 10);
                        else if (typeof object.usage === "number")
                            message.usage = object.usage;
                        else if (typeof object.usage === "object")
                            message.usage = new $util.LongBits(object.usage.low >>> 0, object.usage.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Ping_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {lingcat.methods.Ping_Response} message Ping_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Ping_Response.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.usage = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                    } else
                        object.usage = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
                if (message.usage != null && message.hasOwnProperty("usage"))
                    if (typeof BigInt !== "undefined" && options.longs === BigInt)
                        object.usage = typeof message.usage === "number" ? BigInt(message.usage) : $util.Long.fromBits(message.usage.low >>> 0, message.usage.high >>> 0, false).toBigInt();
                    else if (typeof message.usage === "number")
                        object.usage = options.longs === String ? String(message.usage) : message.usage;
                    else
                        object.usage = options.longs === String ? $util.Long.prototype.toString.call(message.usage) : options.longs === Number ? new $util.LongBits(message.usage.low >>> 0, message.usage.high >>> 0).toNumber() : message.usage;
                return object;
            };

            /**
             * Converts this Ping_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Ping_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ping_Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Ping_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Ping_Response.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Ping_Response";
            };

            return Ping_Response;
        })();

        methods.User_Registration_Request = (function() {

            /**
             * Properties of a User_Registration_Request.
             * @typedef {Object} lingcat.methods.User_Registration_Request.$Properties
             * @property {string|null} [username] User_Registration_Request username
             * @property {string|null} [password] User_Registration_Request password
             * @property {string|null} [nickname] User_Registration_Request nickname
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a User_Registration_Request.
             * @memberof lingcat.methods
             * @interface IUser_Registration_Request
             * @augments lingcat.methods.User_Registration_Request.$Properties
             * @deprecated Use lingcat.methods.User_Registration_Request.$Properties instead.
             */

            /**
             * Shape of a User_Registration_Request.
             * @typedef {lingcat.methods.User_Registration_Request.$Properties} lingcat.methods.User_Registration_Request.$Shape
             */

            /**
             * Constructs a new User_Registration_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a User_Registration_Request.
             * @constructor
             * @param {lingcat.methods.User_Registration_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function User_Registration_Request(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * User_Registration_Request username.
             * @member {string|null|undefined} username
             * @memberof lingcat.methods.User_Registration_Request
             * @instance
             */
            User_Registration_Request.prototype.username = null;

            /**
             * User_Registration_Request password.
             * @member {string} password
             * @memberof lingcat.methods.User_Registration_Request
             * @instance
             */
            User_Registration_Request.prototype.password = "";

            /**
             * User_Registration_Request nickname.
             * @member {string} nickname
             * @memberof lingcat.methods.User_Registration_Request
             * @instance
             */
            User_Registration_Request.prototype.nickname = "";

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(User_Registration_Request.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new User_Registration_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {lingcat.methods.User_Registration_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.User_Registration_Request} User_Registration_Request instance
             * @type {{
             *   (properties: lingcat.methods.User_Registration_Request.$Shape): lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape;
             *   (properties?: lingcat.methods.User_Registration_Request.$Properties): lingcat.methods.User_Registration_Request;
             * }}
             */
            User_Registration_Request.create = function create(properties) {
                return new User_Registration_Request(properties);
            };

            /**
             * Encodes the specified User_Registration_Request message. Does not implicitly {@link lingcat.methods.User_Registration_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {lingcat.methods.User_Registration_Request.$Properties} message User_Registration_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Registration_Request.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.username);
                if (message.password != null && Object.hasOwnProperty.call(message, "password"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.password);
                if (message.nickname != null && Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified User_Registration_Request message, length delimited. Does not implicitly {@link lingcat.methods.User_Registration_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {lingcat.methods.User_Registration_Request.$Properties} message User_Registration_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Registration_Request.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a User_Registration_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape} User_Registration_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Registration_Request.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Registration_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.string();
                            message._username = "username";
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.password = value;
                            else
                                delete message.password;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.nickname = value;
                            else
                                delete message.nickname;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a User_Registration_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape} User_Registration_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Registration_Request.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a User_Registration_Request message.
             * @function verify
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User_Registration_Request.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.username != null && message.hasOwnProperty("username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.password != null && message.hasOwnProperty("password"))
                    if (!$util.isString(message.password))
                        return "password: string expected";
                if (message.nickname != null && message.hasOwnProperty("nickname"))
                    if (!$util.isString(message.nickname))
                        return "nickname: string expected";
                return null;
            };

            /**
             * Creates a User_Registration_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.User_Registration_Request} User_Registration_Request
             */
            User_Registration_Request.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Registration_Request)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Registration_Request();
                if (object.username != null)
                    message.username = String(object.username);
                if (object.password != null)
                    if (typeof object.password !== "string" || object.password.length)
                        message.password = String(object.password);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = String(object.nickname);
                return message;
            };

            /**
             * Creates a plain object from a User_Registration_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {lingcat.methods.User_Registration_Request} message User_Registration_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User_Registration_Request.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.password = "";
                    object.nickname = "";
                }
                if (message.username != null && message.hasOwnProperty("username"))
                    object.username = message.username;
                if (message.password != null && message.hasOwnProperty("password"))
                    object.password = message.password;
                if (message.nickname != null && message.hasOwnProperty("nickname"))
                    object.nickname = message.nickname;
                return object;
            };

            /**
             * Converts this User_Registration_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.User_Registration_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User_Registration_Request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Registration_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Registration_Request.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.User_Registration_Request";
            };

            return User_Registration_Request;
        })();

        methods.User_Registration_Response = (function() {

            /**
             * Properties of a User_Registration_Response.
             * @typedef {Object} lingcat.methods.User_Registration_Response.$Properties
             * @property {string|null} [id] User_Registration_Response id
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */

            /**
             * Properties of a User_Registration_Response.
             * @memberof lingcat.methods
             * @interface IUser_Registration_Response
             * @augments lingcat.methods.User_Registration_Response.$Properties
             * @deprecated Use lingcat.methods.User_Registration_Response.$Properties instead.
             */

            /**
             * Shape of a User_Registration_Response.
             * @typedef {lingcat.methods.User_Registration_Response.$Properties} lingcat.methods.User_Registration_Response.$Shape
             */

            /**
             * Constructs a new User_Registration_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a User_Registration_Response.
             * @constructor
             * @param {lingcat.methods.User_Registration_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
             */
            function User_Registration_Response(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * User_Registration_Response id.
             * @member {string} id
             * @memberof lingcat.methods.User_Registration_Response
             * @instance
             */
            User_Registration_Response.prototype.id = "";

            /**
             * Creates a new User_Registration_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {lingcat.methods.User_Registration_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.User_Registration_Response} User_Registration_Response instance
             * @type {{
             *   (properties: lingcat.methods.User_Registration_Response.$Shape): lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape;
             *   (properties?: lingcat.methods.User_Registration_Response.$Properties): lingcat.methods.User_Registration_Response;
             * }}
             */
            User_Registration_Response.create = function create(properties) {
                return new User_Registration_Response(properties);
            };

            /**
             * Encodes the specified User_Registration_Response message. Does not implicitly {@link lingcat.methods.User_Registration_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {lingcat.methods.User_Registration_Response.$Properties} message User_Registration_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Registration_Response.encode = function encode(message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified User_Registration_Response message, length delimited. Does not implicitly {@link lingcat.methods.User_Registration_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {lingcat.methods.User_Registration_Response.$Properties} message User_Registration_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Registration_Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a User_Registration_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape} User_Registration_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Registration_Response.decode = function decode(reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw Error("max depth exceeded");
                let end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Registration_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.string()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
                if (_end !== undefined)
                    throw Error("missing end group");
                return message;
            };

            /**
             * Decodes a User_Registration_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape} User_Registration_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Registration_Response.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a User_Registration_Response message.
             * @function verify
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User_Registration_Response.verify = function verify(message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a User_Registration_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.User_Registration_Response} User_Registration_Response
             */
            User_Registration_Response.fromObject = function fromObject(object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Registration_Response)
                    return object;
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Registration_Response();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a User_Registration_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {lingcat.methods.User_Registration_Response} message User_Registration_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User_Registration_Response.toObject = function toObject(message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.id = "";
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this User_Registration_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.User_Registration_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User_Registration_Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Registration_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Registration_Response.getTypeUrl = function getTypeUrl(prefix) {
                if (prefix === undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.User_Registration_Response";
            };

            return User_Registration_Response;
        })();

        return methods;
    })();

    return lingcat;
})();

export {
  $root as default
};
