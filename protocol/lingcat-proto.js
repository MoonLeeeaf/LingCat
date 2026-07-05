/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $String = $util.global.String, $Array = $util.global.Array, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt;

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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const EncryptedMessage = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            EncryptedMessage.create = function(properties) {
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
            EncryptedMessage.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.seq != null && $Object.hasOwnProperty.call(message, "seq"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.seq);
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.iv);
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                if (message.aad != null && $Object.hasOwnProperty.call(message, "aad"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.aad);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            EncryptedMessage.encodeDelimited = function(message, writer) {
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
            EncryptedMessage.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.EncryptedMessage(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
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
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            EncryptedMessage.decodeDelimited = function(reader) {
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
            EncryptedMessage.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.seq != null && $Object.hasOwnProperty.call(message, "seq"))
                    if (!$util.isInteger(message.seq))
                        return "seq: integer expected";
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    if (!(message.iv && typeof message.iv.length === "number" || $util.isString(message.iv)))
                        return "iv: buffer expected";
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                if (message.aad != null && $Object.hasOwnProperty.call(message, "aad"))
                    if (!(message.aad && typeof message.aad.length === "number" || $util.isString(message.aad)))
                        return "aad: buffer expected";
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
            EncryptedMessage.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.EncryptedMessage)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.EncryptedMessage: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.EncryptedMessage();
                if (object.seq != null)
                    if ($Number(object.seq) !== 0)
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
            EncryptedMessage.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.seq = 0;
                    if (options.bytes === $String)
                        object.iv = "";
                    else {
                        object.iv = [];
                        if (options.bytes !== $Array)
                            object.iv = $util.newBuffer(object.iv);
                    }
                    if (options.bytes === $String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== $Array)
                            object.data = $util.newBuffer(object.data);
                    }
                    if (options.bytes === $String)
                        object.aad = "";
                    else {
                        object.aad = [];
                        if (options.bytes !== $Array)
                            object.aad = $util.newBuffer(object.aad);
                    }
                }
                if (message.seq != null && $Object.hasOwnProperty.call(message, "seq"))
                    object.seq = message.seq;
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv"))
                    object.iv = options.bytes === $String ? $util.base64.encode(message.iv, 0, message.iv.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.iv) : message.iv;
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    object.data = options.bytes === $String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.data) : message.data;
                if (message.aad != null && $Object.hasOwnProperty.call(message, "aad"))
                    object.aad = options.bytes === $String ? $util.base64.encode(message.aad, 0, message.aad.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.aad) : message.aad;
                return object;
            };

            /**
             * Converts this EncryptedMessage to JSON.
             * @function toJSON
             * @memberof lingcat.classes.EncryptedMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EncryptedMessage.prototype.toJSON = function() {
                return EncryptedMessage.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for EncryptedMessage
             * @function getTypeUrl
             * @memberof lingcat.classes.EncryptedMessage
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            EncryptedMessage.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const User = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            $Object.defineProperty(User.prototype, "_username", {
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
            User.create = function(properties) {
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
            User.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            User.encodeDelimited = function(message, writer) {
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
            User.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.User(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.stringVerify();
                            message._username = "username";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.nickname = value;
                            else
                                delete message.nickname;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            User.decodeDelimited = function(reader) {
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
            User.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.username != null && $Object.hasOwnProperty.call(message, "username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
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
            User.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.User)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.User: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.User();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = $String(object.nickname);
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
            User.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.nickname = "";
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
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
            User.prototype.toJSON = function() {
                return User.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User
             * @function getTypeUrl
             * @memberof lingcat.classes.User
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Group = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            $Object.defineProperty(Group.prototype, "_groupUnique", {
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
            Group.create = function(properties) {
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
            Group.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.groupUnique != null && $Object.hasOwnProperty.call(message, "groupUnique"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.groupUnique);
                if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            Group.encodeDelimited = function(message, writer) {
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
            Group.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.Group(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.groupUnique = reader.stringVerify();
                            message._groupUnique = "groupUnique";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.name = value;
                            else
                                delete message.name;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            Group.decodeDelimited = function(reader) {
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
            Group.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.groupUnique != null && $Object.hasOwnProperty.call(message, "groupUnique")) {
                    properties._groupUnique = 1;
                    if (!$util.isString(message.groupUnique))
                        return "groupUnique: string expected";
                }
                if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
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
            Group.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.Group)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.Group: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.Group();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.groupUnique != null)
                    message.groupUnique = $String(object.groupUnique);
                if (object.name != null)
                    if (typeof object.name !== "string" || object.name.length)
                        message.name = $String(object.name);
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
            Group.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.groupUnique != null && $Object.hasOwnProperty.call(message, "groupUnique"))
                    object.groupUnique = message.groupUnique;
                if (message.name != null && $Object.hasOwnProperty.call(message, "name"))
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
            Group.prototype.toJSON = function() {
                return Group.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Group
             * @function getTypeUrl
             * @memberof lingcat.classes.Group
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Group.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Error_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            $Object.defineProperty(Error_Response.prototype, "_message", {
                get: $util.oneOfGetter($oneOfFields = ["message"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Error_Response.prototype, "_code", {
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
            Error_Response.create = function(properties) {
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
            Error_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.requestMethod != null && $Object.hasOwnProperty.call(message, "requestMethod"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.requestMethod);
                if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.code);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            Error_Response.encodeDelimited = function(message, writer) {
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
            Error_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Error_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
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
                            message.message = reader.stringVerify();
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
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            Error_Response.decodeDelimited = function(reader) {
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
            Error_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.requestMethod != null && $Object.hasOwnProperty.call(message, "requestMethod"))
                    if (!$util.isInteger(message.requestMethod))
                        return "requestMethod: integer expected";
                if (message.message != null && $Object.hasOwnProperty.call(message, "message")) {
                    properties._message = 1;
                    if (!$util.isString(message.message))
                        return "message: string expected";
                }
                if (message.code != null && $Object.hasOwnProperty.call(message, "code")) {
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
            Error_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Error_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Error_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Error_Response();
                if (object.requestMethod != null)
                    if ($Number(object.requestMethod) !== 0)
                        message.requestMethod = object.requestMethod >>> 0;
                if (object.message != null)
                    message.message = $String(object.message);
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
            Error_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.requestMethod = 0;
                if (message.requestMethod != null && $Object.hasOwnProperty.call(message, "requestMethod"))
                    object.requestMethod = message.requestMethod;
                if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                    object.message = message.message;
                if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
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
            Error_Response.prototype.toJSON = function() {
                return Error_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Error_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Error_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Error_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Error_Response";
            };

            return Error_Response;
        })();

        methods.HandShake_Request = (function() {

            /**
             * Properties of a HandShake_Request.
             * @typedef {Object} lingcat.methods.HandShake_Request.$Properties
             * @property {Uint8Array|null} [clientPublicKey] HandShake_Request clientPublicKey
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const HandShake_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * HandShake_Request clientPublicKey.
             * @member {Uint8Array} clientPublicKey
             * @memberof lingcat.methods.HandShake_Request
             * @instance
             */
            HandShake_Request.prototype.clientPublicKey = $util.newBuffer([]);

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
            HandShake_Request.create = function(properties) {
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
            HandShake_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.clientPublicKey != null && $Object.hasOwnProperty.call(message, "clientPublicKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.clientPublicKey);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            HandShake_Request.encodeDelimited = function(message, writer) {
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
            HandShake_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.HandShake_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.clientPublicKey = value;
                            else
                                delete message.clientPublicKey;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            HandShake_Request.decodeDelimited = function(reader) {
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
            HandShake_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.clientPublicKey != null && $Object.hasOwnProperty.call(message, "clientPublicKey"))
                    if (!(message.clientPublicKey && typeof message.clientPublicKey.length === "number" || $util.isString(message.clientPublicKey)))
                        return "clientPublicKey: buffer expected";
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
            HandShake_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.HandShake_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.HandShake_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.HandShake_Request();
                if (object.clientPublicKey != null)
                    if (object.clientPublicKey.length)
                        if (typeof object.clientPublicKey === "string")
                            $util.base64.decode(object.clientPublicKey, message.clientPublicKey = $util.newBuffer($util.base64.length(object.clientPublicKey)), 0);
                        else if (object.clientPublicKey.length >= 0)
                            message.clientPublicKey = object.clientPublicKey;
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
            HandShake_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    if (options.bytes === $String)
                        object.clientPublicKey = "";
                    else {
                        object.clientPublicKey = [];
                        if (options.bytes !== $Array)
                            object.clientPublicKey = $util.newBuffer(object.clientPublicKey);
                    }
                if (message.clientPublicKey != null && $Object.hasOwnProperty.call(message, "clientPublicKey"))
                    object.clientPublicKey = options.bytes === $String ? $util.base64.encode(message.clientPublicKey, 0, message.clientPublicKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.clientPublicKey) : message.clientPublicKey;
                return object;
            };

            /**
             * Converts this HandShake_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.HandShake_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            HandShake_Request.prototype.toJSON = function() {
                return HandShake_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for HandShake_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.HandShake_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            HandShake_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Uint8Array|null} [messageToBeVerify] HandShake_Response messageToBeVerify
             * @property {Uint8Array|null} [serverPublicKey] HandShake_Response serverPublicKey
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const HandShake_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * HandShake_Response salt.
             * @member {Uint8Array} salt
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.salt = $util.newBuffer([]);

            /**
             * HandShake_Response messageToBeVerify.
             * @member {Uint8Array} messageToBeVerify
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.messageToBeVerify = $util.newBuffer([]);

            /**
             * HandShake_Response serverPublicKey.
             * @member {Uint8Array} serverPublicKey
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             */
            HandShake_Response.prototype.serverPublicKey = $util.newBuffer([]);

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
            HandShake_Response.create = function(properties) {
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
            HandShake_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.salt);
                if (message.messageToBeVerify != null && $Object.hasOwnProperty.call(message, "messageToBeVerify"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.messageToBeVerify);
                if (message.serverPublicKey != null && $Object.hasOwnProperty.call(message, "serverPublicKey"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.serverPublicKey);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            HandShake_Response.encodeDelimited = function(message, writer) {
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
            HandShake_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.HandShake_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
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
                                message.messageToBeVerify = value;
                            else
                                delete message.messageToBeVerify;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.serverPublicKey = value;
                            else
                                delete message.serverPublicKey;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            HandShake_Response.decodeDelimited = function(reader) {
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
            HandShake_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
                    if (!(message.salt && typeof message.salt.length === "number" || $util.isString(message.salt)))
                        return "salt: buffer expected";
                if (message.messageToBeVerify != null && $Object.hasOwnProperty.call(message, "messageToBeVerify"))
                    if (!(message.messageToBeVerify && typeof message.messageToBeVerify.length === "number" || $util.isString(message.messageToBeVerify)))
                        return "messageToBeVerify: buffer expected";
                if (message.serverPublicKey != null && $Object.hasOwnProperty.call(message, "serverPublicKey"))
                    if (!(message.serverPublicKey && typeof message.serverPublicKey.length === "number" || $util.isString(message.serverPublicKey)))
                        return "serverPublicKey: buffer expected";
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
            HandShake_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.HandShake_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.HandShake_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.HandShake_Response();
                if (object.salt != null)
                    if (object.salt.length)
                        if (typeof object.salt === "string")
                            $util.base64.decode(object.salt, message.salt = $util.newBuffer($util.base64.length(object.salt)), 0);
                        else if (object.salt.length >= 0)
                            message.salt = object.salt;
                if (object.messageToBeVerify != null)
                    if (object.messageToBeVerify.length)
                        if (typeof object.messageToBeVerify === "string")
                            $util.base64.decode(object.messageToBeVerify, message.messageToBeVerify = $util.newBuffer($util.base64.length(object.messageToBeVerify)), 0);
                        else if (object.messageToBeVerify.length >= 0)
                            message.messageToBeVerify = object.messageToBeVerify;
                if (object.serverPublicKey != null)
                    if (object.serverPublicKey.length)
                        if (typeof object.serverPublicKey === "string")
                            $util.base64.decode(object.serverPublicKey, message.serverPublicKey = $util.newBuffer($util.base64.length(object.serverPublicKey)), 0);
                        else if (object.serverPublicKey.length >= 0)
                            message.serverPublicKey = object.serverPublicKey;
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
            HandShake_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    if (options.bytes === $String)
                        object.salt = "";
                    else {
                        object.salt = [];
                        if (options.bytes !== $Array)
                            object.salt = $util.newBuffer(object.salt);
                    }
                    if (options.bytes === $String)
                        object.messageToBeVerify = "";
                    else {
                        object.messageToBeVerify = [];
                        if (options.bytes !== $Array)
                            object.messageToBeVerify = $util.newBuffer(object.messageToBeVerify);
                    }
                    if (options.bytes === $String)
                        object.serverPublicKey = "";
                    else {
                        object.serverPublicKey = [];
                        if (options.bytes !== $Array)
                            object.serverPublicKey = $util.newBuffer(object.serverPublicKey);
                    }
                }
                if (message.salt != null && $Object.hasOwnProperty.call(message, "salt"))
                    object.salt = options.bytes === $String ? $util.base64.encode(message.salt, 0, message.salt.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.salt) : message.salt;
                if (message.messageToBeVerify != null && $Object.hasOwnProperty.call(message, "messageToBeVerify"))
                    object.messageToBeVerify = options.bytes === $String ? $util.base64.encode(message.messageToBeVerify, 0, message.messageToBeVerify.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.messageToBeVerify) : message.messageToBeVerify;
                if (message.serverPublicKey != null && $Object.hasOwnProperty.call(message, "serverPublicKey"))
                    object.serverPublicKey = options.bytes === $String ? $util.base64.encode(message.serverPublicKey, 0, message.serverPublicKey.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.serverPublicKey) : message.serverPublicKey;
                return object;
            };

            /**
             * Converts this HandShake_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.HandShake_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            HandShake_Response.prototype.toJSON = function() {
                return HandShake_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for HandShake_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.HandShake_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            HandShake_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Ping_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Ping_Request time.
             * @member {number|Long} time
             * @memberof lingcat.methods.Ping_Request
             * @instance
             */
            Ping_Request.prototype.time = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

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
            Ping_Request.create = function(properties) {
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
            Ping_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.time);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            Ping_Request.encodeDelimited = function(message, writer) {
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
            Ping_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Ping_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.time = value;
                            else
                                delete message.time;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            Ping_Request.decodeDelimited = function(reader) {
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
            Ping_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
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
            Ping_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Ping_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Ping_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Ping_Request();
                if (object.time != null)
                    if (typeof object.time === "object" ? object.time.low || object.time.high : $Number(object.time) !== 0)
                        if ($util.Long)
                            message.time = $util.Long.fromValue(object.time, true);
                        else if (typeof object.time === "string")
                            message.time = $parseInt(object.time, 10);
                        else if (typeof object.time === "number")
                            message.time = object.time;
                        else if (typeof object.time === "object")
                            message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber(true);
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
            Ping_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.time = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.time = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.time = typeof message.time === "number" ? $BigInt(message.time) : $util.Long.fromBits(message.time.low >>> 0, message.time.high >>> 0, true).toBigInt();
                    else if (typeof message.time === "number")
                        object.time = options.longs === $String ? $String(message.time) : message.time;
                    else
                        object.time = options.longs === $String ? $util.Long.prototype.toString.call(message.time) : options.longs === $Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber(true) : message.time;
                return object;
            };

            /**
             * Converts this Ping_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Ping_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ping_Request.prototype.toJSON = function() {
                return Ping_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Ping_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Ping_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Ping_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Ping_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Ping_Response usage.
             * @member {number|Long} usage
             * @memberof lingcat.methods.Ping_Response
             * @instance
             */
            Ping_Response.prototype.usage = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

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
            Ping_Response.create = function(properties) {
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
            Ping_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.usage != null && $Object.hasOwnProperty.call(message, "usage"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.usage);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            Ping_Response.encodeDelimited = function(message, writer) {
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
            Ping_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Ping_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.usage = value;
                            else
                                delete message.usage;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            Ping_Response.decodeDelimited = function(reader) {
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
            Ping_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.usage != null && $Object.hasOwnProperty.call(message, "usage"))
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
            Ping_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Ping_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Ping_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Ping_Response();
                if (object.usage != null)
                    if (typeof object.usage === "object" ? object.usage.low || object.usage.high : $Number(object.usage) !== 0)
                        if ($util.Long)
                            message.usage = $util.Long.fromValue(object.usage, true);
                        else if (typeof object.usage === "string")
                            message.usage = $parseInt(object.usage, 10);
                        else if (typeof object.usage === "number")
                            message.usage = object.usage;
                        else if (typeof object.usage === "object")
                            message.usage = new $util.LongBits(object.usage.low >>> 0, object.usage.high >>> 0).toNumber(true);
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
            Ping_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.usage = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.usage = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                if (message.usage != null && $Object.hasOwnProperty.call(message, "usage"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.usage = typeof message.usage === "number" ? $BigInt(message.usage) : $util.Long.fromBits(message.usage.low >>> 0, message.usage.high >>> 0, true).toBigInt();
                    else if (typeof message.usage === "number")
                        object.usage = options.longs === $String ? $String(message.usage) : message.usage;
                    else
                        object.usage = options.longs === $String ? $util.Long.prototype.toString.call(message.usage) : options.longs === $Number ? new $util.LongBits(message.usage.low >>> 0, message.usage.high >>> 0).toNumber(true) : message.usage;
                return object;
            };

            /**
             * Converts this Ping_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Ping_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ping_Response.prototype.toJSON = function() {
                return Ping_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Ping_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Ping_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Ping_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const User_Registration_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            $Object.defineProperty(User_Registration_Request.prototype, "_username", {
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
            User_Registration_Request.create = function(properties) {
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
            User_Registration_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.username);
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.password);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            User_Registration_Request.encodeDelimited = function(message, writer) {
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
            User_Registration_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Registration_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.stringVerify();
                            message._username = "username";
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.password = value;
                            else
                                delete message.password;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.nickname = value;
                            else
                                delete message.nickname;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            User_Registration_Request.decodeDelimited = function(reader) {
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
            User_Registration_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.username != null && $Object.hasOwnProperty.call(message, "username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    if (!$util.isString(message.password))
                        return "password: string expected";
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
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
            User_Registration_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Registration_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.User_Registration_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Registration_Request();
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.password != null)
                    if (typeof object.password !== "string" || object.password.length)
                        message.password = $String(object.password);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = $String(object.nickname);
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
            User_Registration_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.password = "";
                    object.nickname = "";
                }
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    object.password = message.password;
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
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
            User_Registration_Request.prototype.toJSON = function() {
                return User_Registration_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Registration_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Registration_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Registration_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
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
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const User_Registration_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

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
            User_Registration_Response.create = function(properties) {
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
            User_Registration_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
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
            User_Registration_Response.encodeDelimited = function(message, writer) {
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
            User_Registration_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Registration_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
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
            User_Registration_Response.decodeDelimited = function(reader) {
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
            User_Registration_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
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
            User_Registration_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Registration_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.User_Registration_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Registration_Response();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
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
            User_Registration_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.id = "";
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
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
            User_Registration_Response.prototype.toJSON = function() {
                return User_Registration_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Registration_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Registration_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Registration_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.User_Registration_Response";
            };

            return User_Registration_Response;
        })();

        methods.User_Login_Request = (function() {

            /**
             * Properties of a User_Login_Request.
             * @typedef {Object} lingcat.methods.User_Login_Request.$Properties
             * @property {string|null} [account] User_Login_Request account
             * @property {string|null} [password] User_Login_Request password
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a User_Login_Request.
             * @memberof lingcat.methods
             * @interface IUser_Login_Request
             * @augments lingcat.methods.User_Login_Request.$Properties
             * @deprecated Use lingcat.methods.User_Login_Request.$Properties instead.
             */

            /**
             * Shape of a User_Login_Request.
             * @typedef {lingcat.methods.User_Login_Request.$Properties} lingcat.methods.User_Login_Request.$Shape
             */

            /**
             * Constructs a new User_Login_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a User_Login_Request.
             * @constructor
             * @param {lingcat.methods.User_Login_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const User_Login_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * User_Login_Request account.
             * @member {string} account
             * @memberof lingcat.methods.User_Login_Request
             * @instance
             */
            User_Login_Request.prototype.account = "";

            /**
             * User_Login_Request password.
             * @member {string} password
             * @memberof lingcat.methods.User_Login_Request
             * @instance
             */
            User_Login_Request.prototype.password = "";

            /**
             * Creates a new User_Login_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {lingcat.methods.User_Login_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.User_Login_Request} User_Login_Request instance
             * @type {{
             *   (properties: lingcat.methods.User_Login_Request.$Shape): lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape;
             *   (properties?: lingcat.methods.User_Login_Request.$Properties): lingcat.methods.User_Login_Request;
             * }}
             */
            User_Login_Request.create = function(properties) {
                return new User_Login_Request(properties);
            };

            /**
             * Encodes the specified User_Login_Request message. Does not implicitly {@link lingcat.methods.User_Login_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {lingcat.methods.User_Login_Request.$Properties} message User_Login_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Login_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.account != null && $Object.hasOwnProperty.call(message, "account"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.account);
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.password);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified User_Login_Request message, length delimited. Does not implicitly {@link lingcat.methods.User_Login_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {lingcat.methods.User_Login_Request.$Properties} message User_Login_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Login_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a User_Login_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape} User_Login_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Login_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Login_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.account = value;
                            else
                                delete message.account;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.password = value;
                            else
                                delete message.password;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a User_Login_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape} User_Login_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Login_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a User_Login_Request message.
             * @function verify
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User_Login_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.account != null && $Object.hasOwnProperty.call(message, "account"))
                    if (!$util.isString(message.account))
                        return "account: string expected";
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    if (!$util.isString(message.password))
                        return "password: string expected";
                return null;
            };

            /**
             * Creates a User_Login_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.User_Login_Request} User_Login_Request
             */
            User_Login_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Login_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.User_Login_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Login_Request();
                if (object.account != null)
                    if (typeof object.account !== "string" || object.account.length)
                        message.account = $String(object.account);
                if (object.password != null)
                    if (typeof object.password !== "string" || object.password.length)
                        message.password = $String(object.password);
                return message;
            };

            /**
             * Creates a plain object from a User_Login_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {lingcat.methods.User_Login_Request} message User_Login_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User_Login_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.account = "";
                    object.password = "";
                }
                if (message.account != null && $Object.hasOwnProperty.call(message, "account"))
                    object.account = message.account;
                if (message.password != null && $Object.hasOwnProperty.call(message, "password"))
                    object.password = message.password;
                return object;
            };

            /**
             * Converts this User_Login_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.User_Login_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User_Login_Request.prototype.toJSON = function() {
                return User_Login_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Login_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Login_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Login_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.User_Login_Request";
            };

            return User_Login_Request;
        })();

        methods.User_Login_Response = (function() {

            /**
             * Properties of a User_Login_Response.
             * @typedef {Object} lingcat.methods.User_Login_Response.$Properties
             * @property {string|null} [accessToken] User_Login_Response accessToken
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a User_Login_Response.
             * @memberof lingcat.methods
             * @interface IUser_Login_Response
             * @augments lingcat.methods.User_Login_Response.$Properties
             * @deprecated Use lingcat.methods.User_Login_Response.$Properties instead.
             */

            /**
             * Shape of a User_Login_Response.
             * @typedef {lingcat.methods.User_Login_Response.$Properties} lingcat.methods.User_Login_Response.$Shape
             */

            /**
             * Constructs a new User_Login_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a User_Login_Response.
             * @constructor
             * @param {lingcat.methods.User_Login_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const User_Login_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * User_Login_Response accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.User_Login_Response
             * @instance
             */
            User_Login_Response.prototype.accessToken = "";

            /**
             * Creates a new User_Login_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {lingcat.methods.User_Login_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.User_Login_Response} User_Login_Response instance
             * @type {{
             *   (properties: lingcat.methods.User_Login_Response.$Shape): lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape;
             *   (properties?: lingcat.methods.User_Login_Response.$Properties): lingcat.methods.User_Login_Response;
             * }}
             */
            User_Login_Response.create = function(properties) {
                return new User_Login_Response(properties);
            };

            /**
             * Encodes the specified User_Login_Response message. Does not implicitly {@link lingcat.methods.User_Login_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {lingcat.methods.User_Login_Response.$Properties} message User_Login_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Login_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified User_Login_Response message, length delimited. Does not implicitly {@link lingcat.methods.User_Login_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {lingcat.methods.User_Login_Response.$Properties} message User_Login_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            User_Login_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a User_Login_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape} User_Login_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Login_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.User_Login_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.accessToken = value;
                            else
                                delete message.accessToken;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a User_Login_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape} User_Login_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            User_Login_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a User_Login_Response message.
             * @function verify
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            User_Login_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                return null;
            };

            /**
             * Creates a User_Login_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.User_Login_Response} User_Login_Response
             */
            User_Login_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.User_Login_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.User_Login_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.User_Login_Response();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                return message;
            };

            /**
             * Creates a plain object from a User_Login_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {lingcat.methods.User_Login_Response} message User_Login_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            User_Login_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.accessToken = "";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                return object;
            };

            /**
             * Converts this User_Login_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.User_Login_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            User_Login_Response.prototype.toJSON = function() {
                return User_Login_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for User_Login_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.User_Login_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            User_Login_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.User_Login_Response";
            };

            return User_Login_Response;
        })();

        methods.Request_File_Upload_Request = (function() {

            /**
             * Properties of a Request_File_Upload_Request.
             * @typedef {Object} lingcat.methods.Request_File_Upload_Request.$Properties
             * @property {string|null} [accessToken] Request_File_Upload_Request accessToken
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Request_File_Upload_Request.
             * @memberof lingcat.methods
             * @interface IRequest_File_Upload_Request
             * @augments lingcat.methods.Request_File_Upload_Request.$Properties
             * @deprecated Use lingcat.methods.Request_File_Upload_Request.$Properties instead.
             */

            /**
             * Shape of a Request_File_Upload_Request.
             * @typedef {lingcat.methods.Request_File_Upload_Request.$Properties} lingcat.methods.Request_File_Upload_Request.$Shape
             */

            /**
             * Constructs a new Request_File_Upload_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Request_File_Upload_Request.
             * @constructor
             * @param {lingcat.methods.Request_File_Upload_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Request_File_Upload_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Request_File_Upload_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @instance
             */
            Request_File_Upload_Request.prototype.accessToken = "";

            /**
             * Creates a new Request_File_Upload_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {lingcat.methods.Request_File_Upload_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Request_File_Upload_Request} Request_File_Upload_Request instance
             * @type {{
             *   (properties: lingcat.methods.Request_File_Upload_Request.$Shape): lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape;
             *   (properties?: lingcat.methods.Request_File_Upload_Request.$Properties): lingcat.methods.Request_File_Upload_Request;
             * }}
             */
            Request_File_Upload_Request.create = function(properties) {
                return new Request_File_Upload_Request(properties);
            };

            /**
             * Encodes the specified Request_File_Upload_Request message. Does not implicitly {@link lingcat.methods.Request_File_Upload_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {lingcat.methods.Request_File_Upload_Request.$Properties} message Request_File_Upload_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Upload_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Request_File_Upload_Request message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Upload_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {lingcat.methods.Request_File_Upload_Request.$Properties} message Request_File_Upload_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Upload_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Request_File_Upload_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape} Request_File_Upload_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Upload_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Request_File_Upload_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.accessToken = value;
                            else
                                delete message.accessToken;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Request_File_Upload_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape} Request_File_Upload_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Upload_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Request_File_Upload_Request message.
             * @function verify
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Request_File_Upload_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                return null;
            };

            /**
             * Creates a Request_File_Upload_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Request_File_Upload_Request} Request_File_Upload_Request
             */
            Request_File_Upload_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Request_File_Upload_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Request_File_Upload_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Request_File_Upload_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                return message;
            };

            /**
             * Creates a plain object from a Request_File_Upload_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {lingcat.methods.Request_File_Upload_Request} message Request_File_Upload_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request_File_Upload_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.accessToken = "";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                return object;
            };

            /**
             * Converts this Request_File_Upload_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request_File_Upload_Request.prototype.toJSON = function() {
                return Request_File_Upload_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Request_File_Upload_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Request_File_Upload_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Request_File_Upload_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Request_File_Upload_Request";
            };

            return Request_File_Upload_Request;
        })();

        methods.Request_File_Upload_Response = (function() {

            /**
             * Properties of a Request_File_Upload_Response.
             * @typedef {Object} lingcat.methods.Request_File_Upload_Response.$Properties
             * @property {string|null} [token] Request_File_Upload_Response token
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Request_File_Upload_Response.
             * @memberof lingcat.methods
             * @interface IRequest_File_Upload_Response
             * @augments lingcat.methods.Request_File_Upload_Response.$Properties
             * @deprecated Use lingcat.methods.Request_File_Upload_Response.$Properties instead.
             */

            /**
             * Shape of a Request_File_Upload_Response.
             * @typedef {lingcat.methods.Request_File_Upload_Response.$Properties} lingcat.methods.Request_File_Upload_Response.$Shape
             */

            /**
             * Constructs a new Request_File_Upload_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Request_File_Upload_Response.
             * @constructor
             * @param {lingcat.methods.Request_File_Upload_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Request_File_Upload_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Request_File_Upload_Response token.
             * @member {string} token
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @instance
             */
            Request_File_Upload_Response.prototype.token = "";

            /**
             * Creates a new Request_File_Upload_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {lingcat.methods.Request_File_Upload_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Request_File_Upload_Response} Request_File_Upload_Response instance
             * @type {{
             *   (properties: lingcat.methods.Request_File_Upload_Response.$Shape): lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape;
             *   (properties?: lingcat.methods.Request_File_Upload_Response.$Properties): lingcat.methods.Request_File_Upload_Response;
             * }}
             */
            Request_File_Upload_Response.create = function(properties) {
                return new Request_File_Upload_Response(properties);
            };

            /**
             * Encodes the specified Request_File_Upload_Response message. Does not implicitly {@link lingcat.methods.Request_File_Upload_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {lingcat.methods.Request_File_Upload_Response.$Properties} message Request_File_Upload_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Upload_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.token);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Request_File_Upload_Response message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Upload_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {lingcat.methods.Request_File_Upload_Response.$Properties} message Request_File_Upload_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Upload_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Request_File_Upload_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape} Request_File_Upload_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Upload_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Request_File_Upload_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.token = value;
                            else
                                delete message.token;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Request_File_Upload_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape} Request_File_Upload_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Upload_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Request_File_Upload_Response message.
             * @function verify
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Request_File_Upload_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                    if (!$util.isString(message.token))
                        return "token: string expected";
                return null;
            };

            /**
             * Creates a Request_File_Upload_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Request_File_Upload_Response} Request_File_Upload_Response
             */
            Request_File_Upload_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Request_File_Upload_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Request_File_Upload_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Request_File_Upload_Response();
                if (object.token != null)
                    if (typeof object.token !== "string" || object.token.length)
                        message.token = $String(object.token);
                return message;
            };

            /**
             * Creates a plain object from a Request_File_Upload_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {lingcat.methods.Request_File_Upload_Response} message Request_File_Upload_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request_File_Upload_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.token = "";
                if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                    object.token = message.token;
                return object;
            };

            /**
             * Converts this Request_File_Upload_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request_File_Upload_Response.prototype.toJSON = function() {
                return Request_File_Upload_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Request_File_Upload_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Request_File_Upload_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Request_File_Upload_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Request_File_Upload_Response";
            };

            return Request_File_Upload_Response;
        })();

        methods.Authorize_Request = (function() {

            /**
             * Properties of an Authorize_Request.
             * @typedef {Object} lingcat.methods.Authorize_Request.$Properties
             * @property {string|null} [accessToken] Authorize_Request accessToken
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Authorize_Request.
             * @memberof lingcat.methods
             * @interface IAuthorize_Request
             * @augments lingcat.methods.Authorize_Request.$Properties
             * @deprecated Use lingcat.methods.Authorize_Request.$Properties instead.
             */

            /**
             * Shape of an Authorize_Request.
             * @typedef {lingcat.methods.Authorize_Request.$Properties} lingcat.methods.Authorize_Request.$Shape
             */

            /**
             * Constructs a new Authorize_Request.
             * @memberof lingcat.methods
             * @classdesc Represents an Authorize_Request.
             * @constructor
             * @param {lingcat.methods.Authorize_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Authorize_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Authorize_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Authorize_Request
             * @instance
             */
            Authorize_Request.prototype.accessToken = "";

            /**
             * Creates a new Authorize_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {lingcat.methods.Authorize_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Authorize_Request} Authorize_Request instance
             * @type {{
             *   (properties: lingcat.methods.Authorize_Request.$Shape): lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape;
             *   (properties?: lingcat.methods.Authorize_Request.$Properties): lingcat.methods.Authorize_Request;
             * }}
             */
            Authorize_Request.create = function(properties) {
                return new Authorize_Request(properties);
            };

            /**
             * Encodes the specified Authorize_Request message. Does not implicitly {@link lingcat.methods.Authorize_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {lingcat.methods.Authorize_Request.$Properties} message Authorize_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Authorize_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Authorize_Request message, length delimited. Does not implicitly {@link lingcat.methods.Authorize_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {lingcat.methods.Authorize_Request.$Properties} message Authorize_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Authorize_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Authorize_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape} Authorize_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Authorize_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Authorize_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.accessToken = value;
                            else
                                delete message.accessToken;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an Authorize_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape} Authorize_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Authorize_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Authorize_Request message.
             * @function verify
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Authorize_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                return null;
            };

            /**
             * Creates an Authorize_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Authorize_Request} Authorize_Request
             */
            Authorize_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Authorize_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Authorize_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Authorize_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                return message;
            };

            /**
             * Creates a plain object from an Authorize_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {lingcat.methods.Authorize_Request} message Authorize_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Authorize_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.accessToken = "";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                return object;
            };

            /**
             * Converts this Authorize_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Authorize_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Authorize_Request.prototype.toJSON = function() {
                return Authorize_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Authorize_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Authorize_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Authorize_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Authorize_Request";
            };

            return Authorize_Request;
        })();

        methods.Authorize_Response = (function() {

            /**
             * Properties of an Authorize_Response.
             * @typedef {Object} lingcat.methods.Authorize_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Authorize_Response.
             * @memberof lingcat.methods
             * @interface IAuthorize_Response
             * @augments lingcat.methods.Authorize_Response.$Properties
             * @deprecated Use lingcat.methods.Authorize_Response.$Properties instead.
             */

            /**
             * Shape of an Authorize_Response.
             * @typedef {lingcat.methods.Authorize_Response.$Properties} lingcat.methods.Authorize_Response.$Shape
             */

            /**
             * Constructs a new Authorize_Response.
             * @memberof lingcat.methods
             * @classdesc Represents an Authorize_Response.
             * @constructor
             * @param {lingcat.methods.Authorize_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Authorize_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Authorize_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {lingcat.methods.Authorize_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Authorize_Response} Authorize_Response instance
             * @type {{
             *   (properties: lingcat.methods.Authorize_Response.$Shape): lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape;
             *   (properties?: lingcat.methods.Authorize_Response.$Properties): lingcat.methods.Authorize_Response;
             * }}
             */
            Authorize_Response.create = function(properties) {
                return new Authorize_Response(properties);
            };

            /**
             * Encodes the specified Authorize_Response message. Does not implicitly {@link lingcat.methods.Authorize_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {lingcat.methods.Authorize_Response.$Properties} message Authorize_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Authorize_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Authorize_Response message, length delimited. Does not implicitly {@link lingcat.methods.Authorize_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {lingcat.methods.Authorize_Response.$Properties} message Authorize_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Authorize_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Authorize_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape} Authorize_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Authorize_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Authorize_Response();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    reader.skipType(tag & 7, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an Authorize_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape} Authorize_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Authorize_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Authorize_Response message.
             * @function verify
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Authorize_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates an Authorize_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Authorize_Response} Authorize_Response
             */
            Authorize_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Authorize_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Authorize_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Authorize_Response();
            };

            /**
             * Creates a plain object from an Authorize_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {lingcat.methods.Authorize_Response} message Authorize_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Authorize_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Authorize_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Authorize_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Authorize_Response.prototype.toJSON = function() {
                return Authorize_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Authorize_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Authorize_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Authorize_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Authorize_Response";
            };

            return Authorize_Response;
        })();

        methods.Query_User_Info_Request = (function() {

            /**
             * Properties of a Query_User_Info_Request.
             * @typedef {Object} lingcat.methods.Query_User_Info_Request.$Properties
             * @property {string|null} [accessToken] Query_User_Info_Request accessToken
             * @property {string|null} [userId] Query_User_Info_Request userId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_User_Info_Request.
             * @memberof lingcat.methods
             * @interface IQuery_User_Info_Request
             * @augments lingcat.methods.Query_User_Info_Request.$Properties
             * @deprecated Use lingcat.methods.Query_User_Info_Request.$Properties instead.
             */

            /**
             * Shape of a Query_User_Info_Request.
             * @typedef {lingcat.methods.Query_User_Info_Request.$Properties} lingcat.methods.Query_User_Info_Request.$Shape
             */

            /**
             * Constructs a new Query_User_Info_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Query_User_Info_Request.
             * @constructor
             * @param {lingcat.methods.Query_User_Info_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_User_Info_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_User_Info_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Query_User_Info_Request
             * @instance
             */
            Query_User_Info_Request.prototype.accessToken = "";

            /**
             * Query_User_Info_Request userId.
             * @member {string} userId
             * @memberof lingcat.methods.Query_User_Info_Request
             * @instance
             */
            Query_User_Info_Request.prototype.userId = "";

            /**
             * Creates a new Query_User_Info_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_User_Info_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_User_Info_Request} Query_User_Info_Request instance
             * @type {{
             *   (properties: lingcat.methods.Query_User_Info_Request.$Shape): lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape;
             *   (properties?: lingcat.methods.Query_User_Info_Request.$Properties): lingcat.methods.Query_User_Info_Request;
             * }}
             */
            Query_User_Info_Request.create = function(properties) {
                return new Query_User_Info_Request(properties);
            };

            /**
             * Encodes the specified Query_User_Info_Request message. Does not implicitly {@link lingcat.methods.Query_User_Info_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_User_Info_Request.$Properties} message Query_User_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_User_Info_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.userId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_User_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_User_Info_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_User_Info_Request.$Properties} message Query_User_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_User_Info_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_User_Info_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape} Query_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_User_Info_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_User_Info_Request(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.accessToken = value;
                            else
                                delete message.accessToken;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.userId = value;
                            else
                                delete message.userId;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Query_User_Info_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape} Query_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_User_Info_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_User_Info_Request message.
             * @function verify
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_User_Info_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    if (!$util.isString(message.userId))
                        return "userId: string expected";
                return null;
            };

            /**
             * Creates a Query_User_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_User_Info_Request} Query_User_Info_Request
             */
            Query_User_Info_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_User_Info_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_User_Info_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_User_Info_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.userId != null)
                    if (typeof object.userId !== "string" || object.userId.length)
                        message.userId = $String(object.userId);
                return message;
            };

            /**
             * Creates a plain object from a Query_User_Info_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_User_Info_Request} message Query_User_Info_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_User_Info_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.userId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    object.userId = message.userId;
                return object;
            };

            /**
             * Converts this Query_User_Info_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_User_Info_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_User_Info_Request.prototype.toJSON = function() {
                return Query_User_Info_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_User_Info_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_User_Info_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_User_Info_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_User_Info_Request";
            };

            return Query_User_Info_Request;
        })();

        methods.Query_User_Info_Response = (function() {

            /**
             * Properties of a Query_User_Info_Response.
             * @typedef {Object} lingcat.methods.Query_User_Info_Response.$Properties
             * @property {string|null} [id] Query_User_Info_Response id
             * @property {string|null} [username] Query_User_Info_Response username
             * @property {string|null} [nickname] Query_User_Info_Response nickname
             * @property {string|null} [avatarFileHash] Query_User_Info_Response avatarFileHash
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_User_Info_Response.
             * @memberof lingcat.methods
             * @interface IQuery_User_Info_Response
             * @augments lingcat.methods.Query_User_Info_Response.$Properties
             * @deprecated Use lingcat.methods.Query_User_Info_Response.$Properties instead.
             */

            /**
             * Shape of a Query_User_Info_Response.
             * @typedef {lingcat.methods.Query_User_Info_Response.$Properties} lingcat.methods.Query_User_Info_Response.$Shape
             */

            /**
             * Constructs a new Query_User_Info_Response.
             * @memberof lingcat.methods
             * @classdesc @see classes-interfaces.ts
             * @constructor
             * @param {lingcat.methods.Query_User_Info_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_User_Info_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_User_Info_Response id.
             * @member {string} id
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             */
            Query_User_Info_Response.prototype.id = "";

            /**
             * Query_User_Info_Response username.
             * @member {string|null|undefined} username
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             */
            Query_User_Info_Response.prototype.username = null;

            /**
             * Query_User_Info_Response nickname.
             * @member {string} nickname
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             */
            Query_User_Info_Response.prototype.nickname = "";

            /**
             * Query_User_Info_Response avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             */
            Query_User_Info_Response.prototype.avatarFileHash = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Query_User_Info_Response.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Query_User_Info_Response.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Query_User_Info_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_User_Info_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_User_Info_Response} Query_User_Info_Response instance
             * @type {{
             *   (properties: lingcat.methods.Query_User_Info_Response.$Shape): lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape;
             *   (properties?: lingcat.methods.Query_User_Info_Response.$Properties): lingcat.methods.Query_User_Info_Response;
             * }}
             */
            Query_User_Info_Response.create = function(properties) {
                return new Query_User_Info_Response(properties);
            };

            /**
             * Encodes the specified Query_User_Info_Response message. Does not implicitly {@link lingcat.methods.Query_User_Info_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_User_Info_Response.$Properties} message Query_User_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_User_Info_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.avatarFileHash);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_User_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_User_Info_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_User_Info_Response.$Properties} message Query_User_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_User_Info_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_User_Info_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape} Query_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_User_Info_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_User_Info_Response(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.stringVerify();
                            message._username = "username";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.nickname = value;
                            else
                                delete message.nickname;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.avatarFileHash = reader.stringVerify();
                            message._avatarFileHash = "avatarFileHash";
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Query_User_Info_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape} Query_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_User_Info_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_User_Info_Response message.
             * @function verify
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_User_Info_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.username != null && $Object.hasOwnProperty.call(message, "username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    if (!$util.isString(message.nickname))
                        return "nickname: string expected";
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                return null;
            };

            /**
             * Creates a Query_User_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_User_Info_Response} Query_User_Info_Response
             */
            Query_User_Info_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_User_Info_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_User_Info_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_User_Info_Response();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = $String(object.nickname);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                return message;
            };

            /**
             * Creates a plain object from a Query_User_Info_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_User_Info_Response} message Query_User_Info_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_User_Info_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.nickname = "";
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    object.nickname = message.nickname;
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                return object;
            };

            /**
             * Converts this Query_User_Info_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_User_Info_Response.prototype.toJSON = function() {
                return Query_User_Info_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_User_Info_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_User_Info_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_User_Info_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_User_Info_Response";
            };

            return Query_User_Info_Response;
        })();

        return methods;
    })();

    return lingcat;
})();

export {
  $root as default
};
