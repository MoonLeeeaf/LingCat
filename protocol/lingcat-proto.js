/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $String = $util.global.String, $Array = $util.global.Array, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt, $Boolean = $util.global.Boolean;

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
                if (message.seq != null && $Object.hasOwnProperty.call(message, "seq") && message.seq !== 0)
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.seq);
                if (message.iv != null && $Object.hasOwnProperty.call(message, "iv") && message.iv.length)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.iv);
                if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                if (message.aad != null && $Object.hasOwnProperty.call(message, "aad") && message.aad.length)
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

        classes.IUser = (function() {

            /**
             * Properties of a IUser.
             * @typedef {Object} lingcat.classes.IUser.$Properties
             * @property {string|null} [id] IUser id
             * @property {string|null} [username] IUser username
             * @property {string|null} [nickname] IUser nickname
             * @property {string|null} [description] IUser description
             * @property {string|null} [avatarFileHash] IUser avatarFileHash
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a IUser.
             * @memberof lingcat.classes
             * @interface IIUser
             * @augments lingcat.classes.IUser.$Properties
             * @deprecated Use lingcat.classes.IUser.$Properties instead.
             */

            /**
             * Shape of a IUser.
             * @typedef {lingcat.classes.IUser.$Properties} lingcat.classes.IUser.$Shape
             */

            /**
             * Constructs a new IUser.
             * @memberof lingcat.classes
             * @classdesc Represents a IUser.
             * @constructor
             * @param {lingcat.classes.IUser.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const IUser = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * IUser id.
             * @member {string} id
             * @memberof lingcat.classes.IUser
             * @instance
             */
            IUser.prototype.id = "";

            /**
             * IUser username.
             * @member {string|null|undefined} username
             * @memberof lingcat.classes.IUser
             * @instance
             */
            IUser.prototype.username = null;

            /**
             * IUser nickname.
             * @member {string} nickname
             * @memberof lingcat.classes.IUser
             * @instance
             */
            IUser.prototype.nickname = "";

            /**
             * IUser description.
             * @member {string|null|undefined} description
             * @memberof lingcat.classes.IUser
             * @instance
             */
            IUser.prototype.description = null;

            /**
             * IUser avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.classes.IUser
             * @instance
             */
            IUser.prototype.avatarFileHash = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IUser.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IUser.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IUser.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new IUser instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.IUser
             * @static
             * @param {lingcat.classes.IUser.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.IUser} IUser instance
             * @type {{
             *   (properties: lingcat.classes.IUser.$Shape): lingcat.classes.IUser & lingcat.classes.IUser.$Shape;
             *   (properties?: lingcat.classes.IUser.$Properties): lingcat.classes.IUser;
             * }}
             */
            IUser.create = function(properties) {
                return new IUser(properties);
            };

            /**
             * Encodes the specified IUser message. Does not implicitly {@link lingcat.classes.IUser.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.IUser
             * @static
             * @param {lingcat.classes.IUser.$Properties} message IUser message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IUser.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname") && message.nickname !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.avatarFileHash);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified IUser message, length delimited. Does not implicitly {@link lingcat.classes.IUser.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.IUser
             * @static
             * @param {lingcat.classes.IUser.$Properties} message IUser message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IUser.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a IUser message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.IUser
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.IUser & lingcat.classes.IUser.$Shape} IUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IUser.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.IUser(), value;
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
                            message.description = reader.stringVerify();
                            message._description = "description";
                            continue;
                        }
                    case 5: {
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
             * Decodes a IUser message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.IUser
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.IUser & lingcat.classes.IUser.$Shape} IUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IUser.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a IUser message.
             * @function verify
             * @memberof lingcat.classes.IUser
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            IUser.verify = function (message, _depth) {
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
                if (message.description != null && $Object.hasOwnProperty.call(message, "description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                return null;
            };

            /**
             * Creates a IUser message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.IUser
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.IUser} IUser
             */
            IUser.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.IUser)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.IUser: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.IUser();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = $String(object.nickname);
                if (object.description != null)
                    message.description = $String(object.description);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                return message;
            };

            /**
             * Creates a plain object from a IUser message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.IUser
             * @static
             * @param {lingcat.classes.IUser} message IUser
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            IUser.toObject = function (message, options, _depth) {
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
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    object.description = message.description;
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                return object;
            };

            /**
             * Converts this IUser to JSON.
             * @function toJSON
             * @memberof lingcat.classes.IUser
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            IUser.prototype.toJSON = function() {
                return IUser.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for IUser
             * @function getTypeUrl
             * @memberof lingcat.classes.IUser
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            IUser.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.IUser";
            };

            return IUser;
        })();

        classes.IChatAdmin = (function() {

            /**
             * Properties of a IChatAdmin.
             * @typedef {Object} lingcat.classes.IChatAdmin.$Properties
             * @property {string|null} [id] IChatAdmin id
             * @property {string|null} [username] IChatAdmin username
             * @property {string|null} [nickname] IChatAdmin nickname
             * @property {string|null} [description] IChatAdmin description
             * @property {string|null} [avatarFileHash] IChatAdmin avatarFileHash
             * @property {string|null} [role] IChatAdmin role
             * @property {string|null} [permissions] IChatAdmin permissions
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a IChatAdmin.
             * @memberof lingcat.classes
             * @interface IIChatAdmin
             * @augments lingcat.classes.IChatAdmin.$Properties
             * @deprecated Use lingcat.classes.IChatAdmin.$Properties instead.
             */

            /**
             * Shape of a IChatAdmin.
             * @typedef {lingcat.classes.IChatAdmin.$Properties} lingcat.classes.IChatAdmin.$Shape
             */

            /**
             * Constructs a new IChatAdmin.
             * @memberof lingcat.classes
             * @classdesc Represents a IChatAdmin.
             * @constructor
             * @param {lingcat.classes.IChatAdmin.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const IChatAdmin = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * IChatAdmin id.
             * @member {string} id
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.id = "";

            /**
             * IChatAdmin username.
             * @member {string|null|undefined} username
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.username = null;

            /**
             * IChatAdmin nickname.
             * @member {string} nickname
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.nickname = "";

            /**
             * IChatAdmin description.
             * @member {string|null|undefined} description
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.description = null;

            /**
             * IChatAdmin avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.avatarFileHash = null;

            /**
             * IChatAdmin role.
             * @member {string} role
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.role = "";

            /**
             * IChatAdmin permissions.
             * @member {string} permissions
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             */
            IChatAdmin.prototype.permissions = "";

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChatAdmin.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChatAdmin.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChatAdmin.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new IChatAdmin instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {lingcat.classes.IChatAdmin.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.IChatAdmin} IChatAdmin instance
             * @type {{
             *   (properties: lingcat.classes.IChatAdmin.$Shape): lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape;
             *   (properties?: lingcat.classes.IChatAdmin.$Properties): lingcat.classes.IChatAdmin;
             * }}
             */
            IChatAdmin.create = function(properties) {
                return new IChatAdmin(properties);
            };

            /**
             * Encodes the specified IChatAdmin message. Does not implicitly {@link lingcat.classes.IChatAdmin.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {lingcat.classes.IChatAdmin.$Properties} message IChatAdmin message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IChatAdmin.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname") && message.nickname !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.avatarFileHash);
                if (message.role != null && $Object.hasOwnProperty.call(message, "role") && message.role !== "")
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.role);
                if (message.permissions != null && $Object.hasOwnProperty.call(message, "permissions") && message.permissions !== "")
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.permissions);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified IChatAdmin message, length delimited. Does not implicitly {@link lingcat.classes.IChatAdmin.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {lingcat.classes.IChatAdmin.$Properties} message IChatAdmin message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IChatAdmin.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a IChatAdmin message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape} IChatAdmin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IChatAdmin.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.IChatAdmin(), value;
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
                            message.description = reader.stringVerify();
                            message._description = "description";
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.avatarFileHash = reader.stringVerify();
                            message._avatarFileHash = "avatarFileHash";
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.role = value;
                            else
                                delete message.role;
                            continue;
                        }
                    case 7: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.permissions = value;
                            else
                                delete message.permissions;
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
             * Decodes a IChatAdmin message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape} IChatAdmin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IChatAdmin.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a IChatAdmin message.
             * @function verify
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            IChatAdmin.verify = function (message, _depth) {
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
                if (message.description != null && $Object.hasOwnProperty.call(message, "description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                if (message.role != null && $Object.hasOwnProperty.call(message, "role"))
                    if (!$util.isString(message.role))
                        return "role: string expected";
                if (message.permissions != null && $Object.hasOwnProperty.call(message, "permissions"))
                    if (!$util.isString(message.permissions))
                        return "permissions: string expected";
                return null;
            };

            /**
             * Creates a IChatAdmin message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.IChatAdmin} IChatAdmin
             */
            IChatAdmin.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.IChatAdmin)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.IChatAdmin: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.IChatAdmin();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.nickname != null)
                    if (typeof object.nickname !== "string" || object.nickname.length)
                        message.nickname = $String(object.nickname);
                if (object.description != null)
                    message.description = $String(object.description);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                if (object.role != null)
                    if (typeof object.role !== "string" || object.role.length)
                        message.role = $String(object.role);
                if (object.permissions != null)
                    if (typeof object.permissions !== "string" || object.permissions.length)
                        message.permissions = $String(object.permissions);
                return message;
            };

            /**
             * Creates a plain object from a IChatAdmin message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {lingcat.classes.IChatAdmin} message IChatAdmin
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            IChatAdmin.toObject = function (message, options, _depth) {
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
                    object.role = "";
                    object.permissions = "";
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    object.nickname = message.nickname;
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    object.description = message.description;
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                if (message.role != null && $Object.hasOwnProperty.call(message, "role"))
                    object.role = message.role;
                if (message.permissions != null && $Object.hasOwnProperty.call(message, "permissions"))
                    object.permissions = message.permissions;
                return object;
            };

            /**
             * Converts this IChatAdmin to JSON.
             * @function toJSON
             * @memberof lingcat.classes.IChatAdmin
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            IChatAdmin.prototype.toJSON = function() {
                return IChatAdmin.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for IChatAdmin
             * @function getTypeUrl
             * @memberof lingcat.classes.IChatAdmin
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            IChatAdmin.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.IChatAdmin";
            };

            return IChatAdmin;
        })();

        classes.IChat = (function() {

            /**
             * Properties of a IChat.
             * @typedef {Object} lingcat.classes.IChat.$Properties
             * @property {string|null} [id] IChat id
             * @property {string|null} [title] IChat title
             * @property {string|null} [chatUnique] IChat chatUnique
             * @property {string|null} [type] IChat type
             * @property {string|null} [avatarFileHash] IChat avatarFileHash
             * @property {string|null} [settings] IChat settings
             * @property {number|null} [lastMessageId] IChat lastMessageId
             * @property {number|Long|null} [lastMessageTime] IChat lastMessageTime
             * @property {string|null} [description] IChat description
             * @property {string|null} [lastMessageText] IChat lastMessageText
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a IChat.
             * @memberof lingcat.classes
             * @interface IIChat
             * @augments lingcat.classes.IChat.$Properties
             * @deprecated Use lingcat.classes.IChat.$Properties instead.
             */

            /**
             * Shape of a IChat.
             * @typedef {lingcat.classes.IChat.$Properties} lingcat.classes.IChat.$Shape
             */

            /**
             * Constructs a new IChat.
             * @memberof lingcat.classes
             * @classdesc Represents a IChat.
             * @constructor
             * @param {lingcat.classes.IChat.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const IChat = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * IChat id.
             * @member {string} id
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.id = "";

            /**
             * IChat title.
             * @member {string|null|undefined} title
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.title = null;

            /**
             * IChat chatUnique.
             * @member {string|null|undefined} chatUnique
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.chatUnique = null;

            /**
             * IChat type.
             * @member {string} type
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.type = "";

            /**
             * IChat avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.avatarFileHash = null;

            /**
             * IChat settings.
             * @member {string} settings
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.settings = "";

            /**
             * IChat lastMessageId.
             * @member {number} lastMessageId
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.lastMessageId = 0;

            /**
             * IChat lastMessageTime.
             * @member {number|Long} lastMessageTime
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.lastMessageTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * IChat description.
             * @member {string|null|undefined} description
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.description = null;

            /**
             * IChat lastMessageText.
             * @member {string|null|undefined} lastMessageText
             * @memberof lingcat.classes.IChat
             * @instance
             */
            IChat.prototype.lastMessageText = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChat.prototype, "_title", {
                get: $util.oneOfGetter($oneOfFields = ["title"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChat.prototype, "_chatUnique", {
                get: $util.oneOfGetter($oneOfFields = ["chatUnique"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChat.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChat.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IChat.prototype, "_lastMessageText", {
                get: $util.oneOfGetter($oneOfFields = ["lastMessageText"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new IChat instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.IChat
             * @static
             * @param {lingcat.classes.IChat.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.IChat} IChat instance
             * @type {{
             *   (properties: lingcat.classes.IChat.$Shape): lingcat.classes.IChat & lingcat.classes.IChat.$Shape;
             *   (properties?: lingcat.classes.IChat.$Properties): lingcat.classes.IChat;
             * }}
             */
            IChat.create = function(properties) {
                return new IChat(properties);
            };

            /**
             * Encodes the specified IChat message. Does not implicitly {@link lingcat.classes.IChat.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.IChat
             * @static
             * @param {lingcat.classes.IChat.$Properties} message IChat message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IChat.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.chatUnique != null && $Object.hasOwnProperty.call(message, "chatUnique"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.chatUnique);
                if (message.type != null && $Object.hasOwnProperty.call(message, "type") && message.type !== "")
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.type);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.avatarFileHash);
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings") && message.settings !== "")
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.settings);
                if (message.lastMessageId != null && $Object.hasOwnProperty.call(message, "lastMessageId") && message.lastMessageId !== 0)
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.lastMessageId);
                if (message.lastMessageTime != null && $Object.hasOwnProperty.call(message, "lastMessageTime") && (typeof message.lastMessageTime === "object" ? message.lastMessageTime.low || message.lastMessageTime.high : message.lastMessageTime !== 0))
                    writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.lastMessageTime);
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.description);
                if (message.lastMessageText != null && $Object.hasOwnProperty.call(message, "lastMessageText"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.lastMessageText);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified IChat message, length delimited. Does not implicitly {@link lingcat.classes.IChat.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.IChat
             * @static
             * @param {lingcat.classes.IChat.$Properties} message IChat message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IChat.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a IChat message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.IChat
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.IChat & lingcat.classes.IChat.$Shape} IChat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IChat.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.IChat(), value;
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
                            message.title = reader.stringVerify();
                            message._title = "title";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.chatUnique = reader.stringVerify();
                            message._chatUnique = "chatUnique";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.type = value;
                            else
                                delete message.type;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.avatarFileHash = reader.stringVerify();
                            message._avatarFileHash = "avatarFileHash";
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.settings = value;
                            else
                                delete message.settings;
                            continue;
                        }
                    case 7: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.lastMessageId = value;
                            else
                                delete message.lastMessageId;
                            continue;
                        }
                    case 8: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.lastMessageTime = value;
                            else
                                delete message.lastMessageTime;
                            continue;
                        }
                    case 9: {
                            if (wireType !== 2)
                                break;
                            message.description = reader.stringVerify();
                            message._description = "description";
                            continue;
                        }
                    case 10: {
                            if (wireType !== 2)
                                break;
                            message.lastMessageText = reader.stringVerify();
                            message._lastMessageText = "lastMessageText";
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
             * Decodes a IChat message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.IChat
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.IChat & lingcat.classes.IChat.$Shape} IChat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IChat.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a IChat message.
             * @function verify
             * @memberof lingcat.classes.IChat
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            IChat.verify = function (message, _depth) {
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
                if (message.title != null && $Object.hasOwnProperty.call(message, "title")) {
                    properties._title = 1;
                    if (!$util.isString(message.title))
                        return "title: string expected";
                }
                if (message.chatUnique != null && $Object.hasOwnProperty.call(message, "chatUnique")) {
                    properties._chatUnique = 1;
                    if (!$util.isString(message.chatUnique))
                        return "chatUnique: string expected";
                }
                if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings"))
                    if (!$util.isString(message.settings))
                        return "settings: string expected";
                if (message.lastMessageId != null && $Object.hasOwnProperty.call(message, "lastMessageId"))
                    if (!$util.isInteger(message.lastMessageId))
                        return "lastMessageId: integer expected";
                if (message.lastMessageTime != null && $Object.hasOwnProperty.call(message, "lastMessageTime"))
                    if (!$util.isInteger(message.lastMessageTime) && !(message.lastMessageTime && $util.isInteger(message.lastMessageTime.low) && $util.isInteger(message.lastMessageTime.high)))
                        return "lastMessageTime: integer|Long expected";
                if (message.description != null && $Object.hasOwnProperty.call(message, "description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                if (message.lastMessageText != null && $Object.hasOwnProperty.call(message, "lastMessageText")) {
                    properties._lastMessageText = 1;
                    if (!$util.isString(message.lastMessageText))
                        return "lastMessageText: string expected";
                }
                return null;
            };

            /**
             * Creates a IChat message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.IChat
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.IChat} IChat
             */
            IChat.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.IChat)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.IChat: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.IChat();
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.title != null)
                    message.title = $String(object.title);
                if (object.chatUnique != null)
                    message.chatUnique = $String(object.chatUnique);
                if (object.type != null)
                    if (typeof object.type !== "string" || object.type.length)
                        message.type = $String(object.type);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                if (object.settings != null)
                    if (typeof object.settings !== "string" || object.settings.length)
                        message.settings = $String(object.settings);
                if (object.lastMessageId != null)
                    if ($Number(object.lastMessageId) !== 0)
                        message.lastMessageId = object.lastMessageId >>> 0;
                if (object.lastMessageTime != null)
                    if (typeof object.lastMessageTime === "object" ? object.lastMessageTime.low || object.lastMessageTime.high : $Number(object.lastMessageTime) !== 0)
                        if ($util.Long)
                            message.lastMessageTime = $util.Long.fromValue(object.lastMessageTime, true);
                        else if (typeof object.lastMessageTime === "string")
                            message.lastMessageTime = $parseInt(object.lastMessageTime, 10);
                        else if (typeof object.lastMessageTime === "number")
                            message.lastMessageTime = object.lastMessageTime;
                        else if (typeof object.lastMessageTime === "object")
                            message.lastMessageTime = new $util.LongBits(object.lastMessageTime.low >>> 0, object.lastMessageTime.high >>> 0).toNumber(true);
                if (object.description != null)
                    message.description = $String(object.description);
                if (object.lastMessageText != null)
                    message.lastMessageText = $String(object.lastMessageText);
                return message;
            };

            /**
             * Creates a plain object from a IChat message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.IChat
             * @static
             * @param {lingcat.classes.IChat} message IChat
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            IChat.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.type = "";
                    object.settings = "";
                    object.lastMessageId = 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.lastMessageTime = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.lastMessageTime = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    object.title = message.title;
                if (message.chatUnique != null && $Object.hasOwnProperty.call(message, "chatUnique"))
                    object.chatUnique = message.chatUnique;
                if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                    object.type = message.type;
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings"))
                    object.settings = message.settings;
                if (message.lastMessageId != null && $Object.hasOwnProperty.call(message, "lastMessageId"))
                    object.lastMessageId = message.lastMessageId;
                if (message.lastMessageTime != null && $Object.hasOwnProperty.call(message, "lastMessageTime"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.lastMessageTime = typeof message.lastMessageTime === "number" ? $BigInt(message.lastMessageTime) : $util.Long.fromBits(message.lastMessageTime.low >>> 0, message.lastMessageTime.high >>> 0, true).toBigInt();
                    else if (typeof message.lastMessageTime === "number")
                        object.lastMessageTime = options.longs === $String ? $String(message.lastMessageTime) : message.lastMessageTime;
                    else
                        object.lastMessageTime = options.longs === $String ? $util.Long.prototype.toString.call(message.lastMessageTime) : options.longs === $Number ? new $util.LongBits(message.lastMessageTime.low >>> 0, message.lastMessageTime.high >>> 0).toNumber(true) : message.lastMessageTime;
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    object.description = message.description;
                if (message.lastMessageText != null && $Object.hasOwnProperty.call(message, "lastMessageText"))
                    object.lastMessageText = message.lastMessageText;
                return object;
            };

            /**
             * Converts this IChat to JSON.
             * @function toJSON
             * @memberof lingcat.classes.IChat
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            IChat.prototype.toJSON = function() {
                return IChat.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for IChat
             * @function getTypeUrl
             * @memberof lingcat.classes.IChat
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            IChat.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.IChat";
            };

            return IChat;
        })();

        classes.IFile = (function() {

            /**
             * Properties of a IFile.
             * @typedef {Object} lingcat.classes.IFile.$Properties
             * @property {string|null} [hash] IFile hash
             * @property {string|null} [firstUploadFileName] IFile firstUploadFileName
             * @property {string|null} [belongToChatId] IFile belongToChatId
             * @property {string|null} [mime] IFile mime
             * @property {number|Long|null} [uploadedAt] IFile uploadedAt
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a IFile.
             * @memberof lingcat.classes
             * @interface IIFile
             * @augments lingcat.classes.IFile.$Properties
             * @deprecated Use lingcat.classes.IFile.$Properties instead.
             */

            /**
             * Shape of a IFile.
             * @typedef {lingcat.classes.IFile.$Properties} lingcat.classes.IFile.$Shape
             */

            /**
             * Constructs a new IFile.
             * @memberof lingcat.classes
             * @classdesc Represents a IFile.
             * @constructor
             * @param {lingcat.classes.IFile.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const IFile = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * IFile hash.
             * @member {string} hash
             * @memberof lingcat.classes.IFile
             * @instance
             */
            IFile.prototype.hash = "";

            /**
             * IFile firstUploadFileName.
             * @member {string|null|undefined} firstUploadFileName
             * @memberof lingcat.classes.IFile
             * @instance
             */
            IFile.prototype.firstUploadFileName = null;

            /**
             * IFile belongToChatId.
             * @member {string|null|undefined} belongToChatId
             * @memberof lingcat.classes.IFile
             * @instance
             */
            IFile.prototype.belongToChatId = null;

            /**
             * IFile mime.
             * @member {string} mime
             * @memberof lingcat.classes.IFile
             * @instance
             */
            IFile.prototype.mime = "";

            /**
             * IFile uploadedAt.
             * @member {number|Long} uploadedAt
             * @memberof lingcat.classes.IFile
             * @instance
             */
            IFile.prototype.uploadedAt = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IFile.prototype, "_firstUploadFileName", {
                get: $util.oneOfGetter($oneOfFields = ["firstUploadFileName"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IFile.prototype, "_belongToChatId", {
                get: $util.oneOfGetter($oneOfFields = ["belongToChatId"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new IFile instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.IFile
             * @static
             * @param {lingcat.classes.IFile.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.IFile} IFile instance
             * @type {{
             *   (properties: lingcat.classes.IFile.$Shape): lingcat.classes.IFile & lingcat.classes.IFile.$Shape;
             *   (properties?: lingcat.classes.IFile.$Properties): lingcat.classes.IFile;
             * }}
             */
            IFile.create = function(properties) {
                return new IFile(properties);
            };

            /**
             * Encodes the specified IFile message. Does not implicitly {@link lingcat.classes.IFile.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.IFile
             * @static
             * @param {lingcat.classes.IFile.$Properties} message IFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IFile.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.hash != null && $Object.hasOwnProperty.call(message, "hash") && message.hash !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.hash);
                if (message.firstUploadFileName != null && $Object.hasOwnProperty.call(message, "firstUploadFileName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.firstUploadFileName);
                if (message.belongToChatId != null && $Object.hasOwnProperty.call(message, "belongToChatId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.belongToChatId);
                if (message.mime != null && $Object.hasOwnProperty.call(message, "mime") && message.mime !== "")
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.mime);
                if (message.uploadedAt != null && $Object.hasOwnProperty.call(message, "uploadedAt") && (typeof message.uploadedAt === "object" ? message.uploadedAt.low || message.uploadedAt.high : message.uploadedAt !== 0))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.uploadedAt);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified IFile message, length delimited. Does not implicitly {@link lingcat.classes.IFile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.IFile
             * @static
             * @param {lingcat.classes.IFile.$Properties} message IFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IFile.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a IFile message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.IFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.IFile & lingcat.classes.IFile.$Shape} IFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IFile.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.IFile(), value;
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
                                message.hash = value;
                            else
                                delete message.hash;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.firstUploadFileName = reader.stringVerify();
                            message._firstUploadFileName = "firstUploadFileName";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.belongToChatId = reader.stringVerify();
                            message._belongToChatId = "belongToChatId";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.mime = value;
                            else
                                delete message.mime;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.uploadedAt = value;
                            else
                                delete message.uploadedAt;
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
             * Decodes a IFile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.IFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.IFile & lingcat.classes.IFile.$Shape} IFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IFile.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a IFile message.
             * @function verify
             * @memberof lingcat.classes.IFile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            IFile.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.hash != null && $Object.hasOwnProperty.call(message, "hash"))
                    if (!$util.isString(message.hash))
                        return "hash: string expected";
                if (message.firstUploadFileName != null && $Object.hasOwnProperty.call(message, "firstUploadFileName")) {
                    properties._firstUploadFileName = 1;
                    if (!$util.isString(message.firstUploadFileName))
                        return "firstUploadFileName: string expected";
                }
                if (message.belongToChatId != null && $Object.hasOwnProperty.call(message, "belongToChatId")) {
                    properties._belongToChatId = 1;
                    if (!$util.isString(message.belongToChatId))
                        return "belongToChatId: string expected";
                }
                if (message.mime != null && $Object.hasOwnProperty.call(message, "mime"))
                    if (!$util.isString(message.mime))
                        return "mime: string expected";
                if (message.uploadedAt != null && $Object.hasOwnProperty.call(message, "uploadedAt"))
                    if (!$util.isInteger(message.uploadedAt) && !(message.uploadedAt && $util.isInteger(message.uploadedAt.low) && $util.isInteger(message.uploadedAt.high)))
                        return "uploadedAt: integer|Long expected";
                return null;
            };

            /**
             * Creates a IFile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.IFile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.IFile} IFile
             */
            IFile.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.IFile)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.IFile: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.IFile();
                if (object.hash != null)
                    if (typeof object.hash !== "string" || object.hash.length)
                        message.hash = $String(object.hash);
                if (object.firstUploadFileName != null)
                    message.firstUploadFileName = $String(object.firstUploadFileName);
                if (object.belongToChatId != null)
                    message.belongToChatId = $String(object.belongToChatId);
                if (object.mime != null)
                    if (typeof object.mime !== "string" || object.mime.length)
                        message.mime = $String(object.mime);
                if (object.uploadedAt != null)
                    if (typeof object.uploadedAt === "object" ? object.uploadedAt.low || object.uploadedAt.high : $Number(object.uploadedAt) !== 0)
                        if ($util.Long)
                            message.uploadedAt = $util.Long.fromValue(object.uploadedAt, true);
                        else if (typeof object.uploadedAt === "string")
                            message.uploadedAt = $parseInt(object.uploadedAt, 10);
                        else if (typeof object.uploadedAt === "number")
                            message.uploadedAt = object.uploadedAt;
                        else if (typeof object.uploadedAt === "object")
                            message.uploadedAt = new $util.LongBits(object.uploadedAt.low >>> 0, object.uploadedAt.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a IFile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.IFile
             * @static
             * @param {lingcat.classes.IFile} message IFile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            IFile.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.hash = "";
                    object.mime = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.uploadedAt = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.uploadedAt = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.hash != null && $Object.hasOwnProperty.call(message, "hash"))
                    object.hash = message.hash;
                if (message.firstUploadFileName != null && $Object.hasOwnProperty.call(message, "firstUploadFileName"))
                    object.firstUploadFileName = message.firstUploadFileName;
                if (message.belongToChatId != null && $Object.hasOwnProperty.call(message, "belongToChatId"))
                    object.belongToChatId = message.belongToChatId;
                if (message.mime != null && $Object.hasOwnProperty.call(message, "mime"))
                    object.mime = message.mime;
                if (message.uploadedAt != null && $Object.hasOwnProperty.call(message, "uploadedAt"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.uploadedAt = typeof message.uploadedAt === "number" ? $BigInt(message.uploadedAt) : $util.Long.fromBits(message.uploadedAt.low >>> 0, message.uploadedAt.high >>> 0, true).toBigInt();
                    else if (typeof message.uploadedAt === "number")
                        object.uploadedAt = options.longs === $String ? $String(message.uploadedAt) : message.uploadedAt;
                    else
                        object.uploadedAt = options.longs === $String ? $util.Long.prototype.toString.call(message.uploadedAt) : options.longs === $Number ? new $util.LongBits(message.uploadedAt.low >>> 0, message.uploadedAt.high >>> 0).toNumber(true) : message.uploadedAt;
                return object;
            };

            /**
             * Converts this IFile to JSON.
             * @function toJSON
             * @memberof lingcat.classes.IFile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            IFile.prototype.toJSON = function() {
                return IFile.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for IFile
             * @function getTypeUrl
             * @memberof lingcat.classes.IFile
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            IFile.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.IFile";
            };

            return IFile;
        })();

        classes.IMessage = (function() {

            /**
             * Properties of a IMessage.
             * @typedef {Object} lingcat.classes.IMessage.$Properties
             * @property {number|null} [id] IMessage id
             * @property {string|null} [senderUserId] IMessage senderUserId
             * @property {boolean|null} [system] IMessage system
             * @property {string|null} [chatId] IMessage chatId
             * @property {string|null} [text] IMessage text
             * @property {number|Long|null} [time] IMessage time
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a IMessage.
             * @memberof lingcat.classes
             * @interface IIMessage
             * @augments lingcat.classes.IMessage.$Properties
             * @deprecated Use lingcat.classes.IMessage.$Properties instead.
             */

            /**
             * Shape of a IMessage.
             * @typedef {lingcat.classes.IMessage.$Properties} lingcat.classes.IMessage.$Shape
             */

            /**
             * Constructs a new IMessage.
             * @memberof lingcat.classes
             * @classdesc Represents a IMessage.
             * @constructor
             * @param {lingcat.classes.IMessage.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const IMessage = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * IMessage id.
             * @member {number} id
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.id = 0;

            /**
             * IMessage senderUserId.
             * @member {string|null|undefined} senderUserId
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.senderUserId = null;

            /**
             * IMessage system.
             * @member {boolean|null|undefined} system
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.system = null;

            /**
             * IMessage chatId.
             * @member {string} chatId
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.chatId = "";

            /**
             * IMessage text.
             * @member {string} text
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.text = "";

            /**
             * IMessage time.
             * @member {number|Long} time
             * @memberof lingcat.classes.IMessage
             * @instance
             */
            IMessage.prototype.time = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IMessage.prototype, "_senderUserId", {
                get: $util.oneOfGetter($oneOfFields = ["senderUserId"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(IMessage.prototype, "_system", {
                get: $util.oneOfGetter($oneOfFields = ["system"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new IMessage instance using the specified properties.
             * @function create
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {lingcat.classes.IMessage.$Properties=} [properties] Properties to set
             * @returns {lingcat.classes.IMessage} IMessage instance
             * @type {{
             *   (properties: lingcat.classes.IMessage.$Shape): lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape;
             *   (properties?: lingcat.classes.IMessage.$Properties): lingcat.classes.IMessage;
             * }}
             */
            IMessage.create = function(properties) {
                return new IMessage(properties);
            };

            /**
             * Encodes the specified IMessage message. Does not implicitly {@link lingcat.classes.IMessage.verify|verify} messages.
             * @function encode
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {lingcat.classes.IMessage.$Properties} message IMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IMessage.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== 0)
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
                if (message.senderUserId != null && $Object.hasOwnProperty.call(message, "senderUserId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.senderUserId);
                if (message.system != null && $Object.hasOwnProperty.call(message, "system"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.system);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.chatId);
                if (message.text != null && $Object.hasOwnProperty.call(message, "text") && message.text !== "")
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.text);
                if (message.time != null && $Object.hasOwnProperty.call(message, "time") && (typeof message.time === "object" ? message.time.low || message.time.high : message.time !== 0))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.time);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified IMessage message, length delimited. Does not implicitly {@link lingcat.classes.IMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {lingcat.classes.IMessage.$Properties} message IMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            IMessage.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a IMessage message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape} IMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IMessage.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.classes.IMessage(), value;
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
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.senderUserId = reader.stringVerify();
                            message._senderUserId = "senderUserId";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.system = reader.bool();
                            message._system = "system";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.text = value;
                            else
                                delete message.text;
                            continue;
                        }
                    case 6: {
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
             * Decodes a IMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape} IMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            IMessage.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a IMessage message.
             * @function verify
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            IMessage.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                if (message.senderUserId != null && $Object.hasOwnProperty.call(message, "senderUserId")) {
                    properties._senderUserId = 1;
                    if (!$util.isString(message.senderUserId))
                        return "senderUserId: string expected";
                }
                if (message.system != null && $Object.hasOwnProperty.call(message, "system")) {
                    properties._system = 1;
                    if (typeof message.system !== "boolean")
                        return "system: boolean expected";
                }
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.text != null && $Object.hasOwnProperty.call(message, "text"))
                    if (!$util.isString(message.text))
                        return "text: string expected";
                if (message.time != null && $Object.hasOwnProperty.call(message, "time"))
                    if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                        return "time: integer|Long expected";
                return null;
            };

            /**
             * Creates a IMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.classes.IMessage} IMessage
             */
            IMessage.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.classes.IMessage)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.classes.IMessage: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.classes.IMessage();
                if (object.id != null)
                    if ($Number(object.id) !== 0)
                        message.id = object.id >>> 0;
                if (object.senderUserId != null)
                    message.senderUserId = $String(object.senderUserId);
                if (object.system != null)
                    message.system = $Boolean(object.system);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.text != null)
                    if (typeof object.text !== "string" || object.text.length)
                        message.text = $String(object.text);
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
             * Creates a plain object from a IMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {lingcat.classes.IMessage} message IMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            IMessage.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.id = 0;
                    object.chatId = "";
                    object.text = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.time = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.time = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.senderUserId != null && $Object.hasOwnProperty.call(message, "senderUserId"))
                    object.senderUserId = message.senderUserId;
                if (message.system != null && $Object.hasOwnProperty.call(message, "system"))
                    object.system = message.system;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.text != null && $Object.hasOwnProperty.call(message, "text"))
                    object.text = message.text;
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
             * Converts this IMessage to JSON.
             * @function toJSON
             * @memberof lingcat.classes.IMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            IMessage.prototype.toJSON = function() {
                return IMessage.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for IMessage
             * @function getTypeUrl
             * @memberof lingcat.classes.IMessage
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            IMessage.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.classes.IMessage";
            };

            return IMessage;
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
                if (message.requestMethod != null && $Object.hasOwnProperty.call(message, "requestMethod") && message.requestMethod !== 0)
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
                if (message.clientPublicKey != null && $Object.hasOwnProperty.call(message, "clientPublicKey") && message.clientPublicKey.length)
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
                if (message.salt != null && $Object.hasOwnProperty.call(message, "salt") && message.salt.length)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.salt);
                if (message.messageToBeVerify != null && $Object.hasOwnProperty.call(message, "messageToBeVerify") && message.messageToBeVerify.length)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.messageToBeVerify);
                if (message.serverPublicKey != null && $Object.hasOwnProperty.call(message, "serverPublicKey") && message.serverPublicKey.length)
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
                if (message.time != null && $Object.hasOwnProperty.call(message, "time") && (typeof message.time === "object" ? message.time.low || message.time.high : message.time !== 0))
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
                if (message.usage != null && $Object.hasOwnProperty.call(message, "usage") && (typeof message.usage === "object" ? message.usage.low || message.usage.high : message.usage !== 0))
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
                if (message.password != null && $Object.hasOwnProperty.call(message, "password") && message.password !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.password);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname") && message.nickname !== "")
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
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== "")
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
                if (message.account != null && $Object.hasOwnProperty.call(message, "account") && message.account !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.account);
                if (message.password != null && $Object.hasOwnProperty.call(message, "password") && message.password !== "")
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
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
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
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
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
                if (message.token != null && $Object.hasOwnProperty.call(message, "token") && message.token !== "")
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

        methods.Request_File_Access_Request = (function() {

            /**
             * Properties of a Request_File_Access_Request.
             * @typedef {Object} lingcat.methods.Request_File_Access_Request.$Properties
             * @property {string|null} [accessToken] Request_File_Access_Request accessToken
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Request_File_Access_Request.
             * @memberof lingcat.methods
             * @interface IRequest_File_Access_Request
             * @augments lingcat.methods.Request_File_Access_Request.$Properties
             * @deprecated Use lingcat.methods.Request_File_Access_Request.$Properties instead.
             */

            /**
             * Shape of a Request_File_Access_Request.
             * @typedef {lingcat.methods.Request_File_Access_Request.$Properties} lingcat.methods.Request_File_Access_Request.$Shape
             */

            /**
             * Constructs a new Request_File_Access_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Request_File_Access_Request.
             * @constructor
             * @param {lingcat.methods.Request_File_Access_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Request_File_Access_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Request_File_Access_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Request_File_Access_Request
             * @instance
             */
            Request_File_Access_Request.prototype.accessToken = "";

            /**
             * Creates a new Request_File_Access_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {lingcat.methods.Request_File_Access_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Request_File_Access_Request} Request_File_Access_Request instance
             * @type {{
             *   (properties: lingcat.methods.Request_File_Access_Request.$Shape): lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape;
             *   (properties?: lingcat.methods.Request_File_Access_Request.$Properties): lingcat.methods.Request_File_Access_Request;
             * }}
             */
            Request_File_Access_Request.create = function(properties) {
                return new Request_File_Access_Request(properties);
            };

            /**
             * Encodes the specified Request_File_Access_Request message. Does not implicitly {@link lingcat.methods.Request_File_Access_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {lingcat.methods.Request_File_Access_Request.$Properties} message Request_File_Access_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Access_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Request_File_Access_Request message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Access_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {lingcat.methods.Request_File_Access_Request.$Properties} message Request_File_Access_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Access_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Request_File_Access_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape} Request_File_Access_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Access_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Request_File_Access_Request(), value;
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
             * Decodes a Request_File_Access_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape} Request_File_Access_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Access_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Request_File_Access_Request message.
             * @function verify
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Request_File_Access_Request.verify = function (message, _depth) {
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
             * Creates a Request_File_Access_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Request_File_Access_Request} Request_File_Access_Request
             */
            Request_File_Access_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Request_File_Access_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Request_File_Access_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Request_File_Access_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                return message;
            };

            /**
             * Creates a plain object from a Request_File_Access_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {lingcat.methods.Request_File_Access_Request} message Request_File_Access_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request_File_Access_Request.toObject = function (message, options, _depth) {
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
             * Converts this Request_File_Access_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Request_File_Access_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request_File_Access_Request.prototype.toJSON = function() {
                return Request_File_Access_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Request_File_Access_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Request_File_Access_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Request_File_Access_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Request_File_Access_Request";
            };

            return Request_File_Access_Request;
        })();

        methods.Request_File_Access_Response = (function() {

            /**
             * Properties of a Request_File_Access_Response.
             * @typedef {Object} lingcat.methods.Request_File_Access_Response.$Properties
             * @property {string|null} [token] Request_File_Access_Response token
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Request_File_Access_Response.
             * @memberof lingcat.methods
             * @interface IRequest_File_Access_Response
             * @augments lingcat.methods.Request_File_Access_Response.$Properties
             * @deprecated Use lingcat.methods.Request_File_Access_Response.$Properties instead.
             */

            /**
             * Shape of a Request_File_Access_Response.
             * @typedef {lingcat.methods.Request_File_Access_Response.$Properties} lingcat.methods.Request_File_Access_Response.$Shape
             */

            /**
             * Constructs a new Request_File_Access_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Request_File_Access_Response.
             * @constructor
             * @param {lingcat.methods.Request_File_Access_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Request_File_Access_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Request_File_Access_Response token.
             * @member {string} token
             * @memberof lingcat.methods.Request_File_Access_Response
             * @instance
             */
            Request_File_Access_Response.prototype.token = "";

            /**
             * Creates a new Request_File_Access_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {lingcat.methods.Request_File_Access_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Request_File_Access_Response} Request_File_Access_Response instance
             * @type {{
             *   (properties: lingcat.methods.Request_File_Access_Response.$Shape): lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape;
             *   (properties?: lingcat.methods.Request_File_Access_Response.$Properties): lingcat.methods.Request_File_Access_Response;
             * }}
             */
            Request_File_Access_Response.create = function(properties) {
                return new Request_File_Access_Response(properties);
            };

            /**
             * Encodes the specified Request_File_Access_Response message. Does not implicitly {@link lingcat.methods.Request_File_Access_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {lingcat.methods.Request_File_Access_Response.$Properties} message Request_File_Access_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Access_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.token != null && $Object.hasOwnProperty.call(message, "token") && message.token !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.token);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Request_File_Access_Response message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Access_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {lingcat.methods.Request_File_Access_Response.$Properties} message Request_File_Access_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request_File_Access_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Request_File_Access_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape} Request_File_Access_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Access_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Request_File_Access_Response(), value;
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
             * Decodes a Request_File_Access_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape} Request_File_Access_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request_File_Access_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Request_File_Access_Response message.
             * @function verify
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Request_File_Access_Response.verify = function (message, _depth) {
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
             * Creates a Request_File_Access_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Request_File_Access_Response} Request_File_Access_Response
             */
            Request_File_Access_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Request_File_Access_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Request_File_Access_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Request_File_Access_Response();
                if (object.token != null)
                    if (typeof object.token !== "string" || object.token.length)
                        message.token = $String(object.token);
                return message;
            };

            /**
             * Creates a plain object from a Request_File_Access_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {lingcat.methods.Request_File_Access_Response} message Request_File_Access_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request_File_Access_Response.toObject = function (message, options, _depth) {
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
             * Converts this Request_File_Access_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Request_File_Access_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request_File_Access_Response.prototype.toJSON = function() {
                return Request_File_Access_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Request_File_Access_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Request_File_Access_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Request_File_Access_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Request_File_Access_Response";
            };

            return Request_File_Access_Response;
        })();

        methods.Authorize_Request = (function() {

            /**
             * Properties of an Authorize_Request.
             * @typedef {Object} lingcat.methods.Authorize_Request.$Properties
             * @property {string|null} [accessToken] Authorize_Request accessToken
             * @property {string|null} [sessionId] Authorize_Request sessionId
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
             * Authorize_Request sessionId.
             * @member {string} sessionId
             * @memberof lingcat.methods.Authorize_Request
             * @instance
             */
            Authorize_Request.prototype.sessionId = "";

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
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.sessionId);
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
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
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
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
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
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
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
                if (options.defaults) {
                    object.accessToken = "";
                    object.sessionId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
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
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId") && message.userId !== "")
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

        methods.Query_My_User_Info_Request = (function() {

            /**
             * Properties of a Query_My_User_Info_Request.
             * @typedef {Object} lingcat.methods.Query_My_User_Info_Request.$Properties
             * @property {string|null} [accessToken] Query_My_User_Info_Request accessToken
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_My_User_Info_Request.
             * @memberof lingcat.methods
             * @interface IQuery_My_User_Info_Request
             * @augments lingcat.methods.Query_My_User_Info_Request.$Properties
             * @deprecated Use lingcat.methods.Query_My_User_Info_Request.$Properties instead.
             */

            /**
             * Shape of a Query_My_User_Info_Request.
             * @typedef {lingcat.methods.Query_My_User_Info_Request.$Properties} lingcat.methods.Query_My_User_Info_Request.$Shape
             */

            /**
             * Constructs a new Query_My_User_Info_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Query_My_User_Info_Request.
             * @constructor
             * @param {lingcat.methods.Query_My_User_Info_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_My_User_Info_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_My_User_Info_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @instance
             */
            Query_My_User_Info_Request.prototype.accessToken = "";

            /**
             * Creates a new Query_My_User_Info_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_My_User_Info_Request} Query_My_User_Info_Request instance
             * @type {{
             *   (properties: lingcat.methods.Query_My_User_Info_Request.$Shape): lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape;
             *   (properties?: lingcat.methods.Query_My_User_Info_Request.$Properties): lingcat.methods.Query_My_User_Info_Request;
             * }}
             */
            Query_My_User_Info_Request.create = function(properties) {
                return new Query_My_User_Info_Request(properties);
            };

            /**
             * Encodes the specified Query_My_User_Info_Request message. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Request.$Properties} message Query_My_User_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_My_User_Info_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_My_User_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Request.$Properties} message Query_My_User_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_My_User_Info_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_My_User_Info_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape} Query_My_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_My_User_Info_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_My_User_Info_Request(), value;
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
             * Decodes a Query_My_User_Info_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape} Query_My_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_My_User_Info_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_My_User_Info_Request message.
             * @function verify
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_My_User_Info_Request.verify = function (message, _depth) {
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
             * Creates a Query_My_User_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_My_User_Info_Request} Query_My_User_Info_Request
             */
            Query_My_User_Info_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_My_User_Info_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_My_User_Info_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_My_User_Info_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                return message;
            };

            /**
             * Creates a plain object from a Query_My_User_Info_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Request} message Query_My_User_Info_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_My_User_Info_Request.toObject = function (message, options, _depth) {
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
             * Converts this Query_My_User_Info_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_My_User_Info_Request.prototype.toJSON = function() {
                return Query_My_User_Info_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_My_User_Info_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_My_User_Info_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_My_User_Info_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_My_User_Info_Request";
            };

            return Query_My_User_Info_Request;
        })();

        methods.Query_User_Info_Response = (function() {

            /**
             * Properties of a Query_User_Info_Response.
             * @typedef {Object} lingcat.methods.Query_User_Info_Response.$Properties
             * @property {lingcat.classes.IUser.$Properties|null} [info] Query_User_Info_Response info
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
             * @classdesc see { @link classes-interfaces.ts }
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
             * Query_User_Info_Response info.
             * @member {lingcat.classes.IUser.$Properties|null|undefined} info
             * @memberof lingcat.methods.Query_User_Info_Response
             * @instance
             */
            Query_User_Info_Response.prototype.info = null;

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
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.lingcat.classes.IUser.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
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
                            message.info = $root.lingcat.classes.IUser.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
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
                if (message.info != null && $Object.hasOwnProperty.call(message, "info")) {
                    let error = $root.lingcat.classes.IUser.verify(message.info, _depth + 1);
                    if (error)
                        return "info." + error;
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
                if (object.info != null) {
                    if (!$util.isObject(object.info))
                        throw $TypeError(".lingcat.methods.Query_User_Info_Response.info: object expected");
                    message.info = $root.lingcat.classes.IUser.fromObject(object.info, _depth + 1);
                }
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
                if (options.defaults)
                    object.info = null;
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    object.info = $root.lingcat.classes.IUser.toObject(message.info, options, _depth + 1);
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

        methods.Query_My_User_Info_Response = (function() {

            /**
             * Properties of a Query_My_User_Info_Response.
             * @typedef {Object} lingcat.methods.Query_My_User_Info_Response.$Properties
             * @property {lingcat.classes.IUser.$Properties|null} [info] Query_My_User_Info_Response info
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_My_User_Info_Response.
             * @memberof lingcat.methods
             * @interface IQuery_My_User_Info_Response
             * @augments lingcat.methods.Query_My_User_Info_Response.$Properties
             * @deprecated Use lingcat.methods.Query_My_User_Info_Response.$Properties instead.
             */

            /**
             * Shape of a Query_My_User_Info_Response.
             * @typedef {lingcat.methods.Query_My_User_Info_Response.$Properties} lingcat.methods.Query_My_User_Info_Response.$Shape
             */

            /**
             * Constructs a new Query_My_User_Info_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Query_My_User_Info_Response.
             * @constructor
             * @param {lingcat.methods.Query_My_User_Info_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_My_User_Info_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_My_User_Info_Response info.
             * @member {lingcat.classes.IUser.$Properties|null|undefined} info
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @instance
             */
            Query_My_User_Info_Response.prototype.info = null;

            /**
             * Creates a new Query_My_User_Info_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_My_User_Info_Response} Query_My_User_Info_Response instance
             * @type {{
             *   (properties: lingcat.methods.Query_My_User_Info_Response.$Shape): lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape;
             *   (properties?: lingcat.methods.Query_My_User_Info_Response.$Properties): lingcat.methods.Query_My_User_Info_Response;
             * }}
             */
            Query_My_User_Info_Response.create = function(properties) {
                return new Query_My_User_Info_Response(properties);
            };

            /**
             * Encodes the specified Query_My_User_Info_Response message. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Response.$Properties} message Query_My_User_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_My_User_Info_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.lingcat.classes.IUser.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_My_User_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Response.$Properties} message Query_My_User_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_My_User_Info_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_My_User_Info_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape} Query_My_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_My_User_Info_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_My_User_Info_Response(), value;
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
                            message.info = $root.lingcat.classes.IUser.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
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
             * Decodes a Query_My_User_Info_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape} Query_My_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_My_User_Info_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_My_User_Info_Response message.
             * @function verify
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_My_User_Info_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.info != null && $Object.hasOwnProperty.call(message, "info")) {
                    let error = $root.lingcat.classes.IUser.verify(message.info, _depth + 1);
                    if (error)
                        return "info." + error;
                }
                return null;
            };

            /**
             * Creates a Query_My_User_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_My_User_Info_Response} Query_My_User_Info_Response
             */
            Query_My_User_Info_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_My_User_Info_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_My_User_Info_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_My_User_Info_Response();
                if (object.info != null) {
                    if (!$util.isObject(object.info))
                        throw $TypeError(".lingcat.methods.Query_My_User_Info_Response.info: object expected");
                    message.info = $root.lingcat.classes.IUser.fromObject(object.info, _depth + 1);
                }
                return message;
            };

            /**
             * Creates a plain object from a Query_My_User_Info_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {lingcat.methods.Query_My_User_Info_Response} message Query_My_User_Info_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_My_User_Info_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.info = null;
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    object.info = $root.lingcat.classes.IUser.toObject(message.info, options, _depth + 1);
                return object;
            };

            /**
             * Converts this Query_My_User_Info_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_My_User_Info_Response.prototype.toJSON = function() {
                return Query_My_User_Info_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_My_User_Info_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_My_User_Info_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_My_User_Info_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_My_User_Info_Response";
            };

            return Query_My_User_Info_Response;
        })();

        methods.Update_My_Profile_Request = (function() {

            /**
             * Properties of an Update_My_Profile_Request.
             * @typedef {Object} lingcat.methods.Update_My_Profile_Request.$Properties
             * @property {string|null} [accessToken] Update_My_Profile_Request accessToken
             * @property {string|null} [avatarFileHash] Update_My_Profile_Request avatarFileHash
             * @property {string|null} [username] Update_My_Profile_Request username
             * @property {string|null} [nickname] Update_My_Profile_Request nickname
             * @property {string|null} [description] Update_My_Profile_Request description
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_My_Profile_Request.
             * @memberof lingcat.methods
             * @interface IUpdate_My_Profile_Request
             * @augments lingcat.methods.Update_My_Profile_Request.$Properties
             * @deprecated Use lingcat.methods.Update_My_Profile_Request.$Properties instead.
             */

            /**
             * Shape of an Update_My_Profile_Request.
             * @typedef {lingcat.methods.Update_My_Profile_Request.$Properties} lingcat.methods.Update_My_Profile_Request.$Shape
             */

            /**
             * Constructs a new Update_My_Profile_Request.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_My_Profile_Request.
             * @constructor
             * @param {lingcat.methods.Update_My_Profile_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_My_Profile_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Update_My_Profile_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             */
            Update_My_Profile_Request.prototype.accessToken = "";

            /**
             * Update_My_Profile_Request avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             */
            Update_My_Profile_Request.prototype.avatarFileHash = null;

            /**
             * Update_My_Profile_Request username.
             * @member {string|null|undefined} username
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             */
            Update_My_Profile_Request.prototype.username = null;

            /**
             * Update_My_Profile_Request nickname.
             * @member {string|null|undefined} nickname
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             */
            Update_My_Profile_Request.prototype.nickname = null;

            /**
             * Update_My_Profile_Request description.
             * @member {string|null|undefined} description
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             */
            Update_My_Profile_Request.prototype.description = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_My_Profile_Request.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_My_Profile_Request.prototype, "_username", {
                get: $util.oneOfGetter($oneOfFields = ["username"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_My_Profile_Request.prototype, "_nickname", {
                get: $util.oneOfGetter($oneOfFields = ["nickname"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_My_Profile_Request.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Update_My_Profile_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {lingcat.methods.Update_My_Profile_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_My_Profile_Request} Update_My_Profile_Request instance
             * @type {{
             *   (properties: lingcat.methods.Update_My_Profile_Request.$Shape): lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape;
             *   (properties?: lingcat.methods.Update_My_Profile_Request.$Properties): lingcat.methods.Update_My_Profile_Request;
             * }}
             */
            Update_My_Profile_Request.create = function(properties) {
                return new Update_My_Profile_Request(properties);
            };

            /**
             * Encodes the specified Update_My_Profile_Request message. Does not implicitly {@link lingcat.methods.Update_My_Profile_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {lingcat.methods.Update_My_Profile_Request.$Properties} message Update_My_Profile_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Profile_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.avatarFileHash);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.username);
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.nickname);
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Update_My_Profile_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Profile_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {lingcat.methods.Update_My_Profile_Request.$Properties} message Update_My_Profile_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Profile_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_My_Profile_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape} Update_My_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Profile_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_My_Profile_Request(), value;
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
                            message.avatarFileHash = reader.stringVerify();
                            message._avatarFileHash = "avatarFileHash";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.username = reader.stringVerify();
                            message._username = "username";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.nickname = reader.stringVerify();
                            message._nickname = "nickname";
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.description = reader.stringVerify();
                            message._description = "description";
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
             * Decodes an Update_My_Profile_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape} Update_My_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Profile_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_My_Profile_Request message.
             * @function verify
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_My_Profile_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                if (message.username != null && $Object.hasOwnProperty.call(message, "username")) {
                    properties._username = 1;
                    if (!$util.isString(message.username))
                        return "username: string expected";
                }
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname")) {
                    properties._nickname = 1;
                    if (!$util.isString(message.nickname))
                        return "nickname: string expected";
                }
                if (message.description != null && $Object.hasOwnProperty.call(message, "description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                return null;
            };

            /**
             * Creates an Update_My_Profile_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_My_Profile_Request} Update_My_Profile_Request
             */
            Update_My_Profile_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_My_Profile_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_My_Profile_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Update_My_Profile_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                if (object.username != null)
                    message.username = $String(object.username);
                if (object.nickname != null)
                    message.nickname = $String(object.nickname);
                if (object.description != null)
                    message.description = $String(object.description);
                return message;
            };

            /**
             * Creates a plain object from an Update_My_Profile_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {lingcat.methods.Update_My_Profile_Request} message Update_My_Profile_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_My_Profile_Request.toObject = function (message, options, _depth) {
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
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                if (message.nickname != null && $Object.hasOwnProperty.call(message, "nickname"))
                    object.nickname = message.nickname;
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    object.description = message.description;
                return object;
            };

            /**
             * Converts this Update_My_Profile_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_My_Profile_Request.prototype.toJSON = function() {
                return Update_My_Profile_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_My_Profile_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_My_Profile_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_My_Profile_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_My_Profile_Request";
            };

            return Update_My_Profile_Request;
        })();

        methods.Update_My_Profile_Response = (function() {

            /**
             * Properties of an Update_My_Profile_Response.
             * @typedef {Object} lingcat.methods.Update_My_Profile_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_My_Profile_Response.
             * @memberof lingcat.methods
             * @interface IUpdate_My_Profile_Response
             * @augments lingcat.methods.Update_My_Profile_Response.$Properties
             * @deprecated Use lingcat.methods.Update_My_Profile_Response.$Properties instead.
             */

            /**
             * Shape of an Update_My_Profile_Response.
             * @typedef {lingcat.methods.Update_My_Profile_Response.$Properties} lingcat.methods.Update_My_Profile_Response.$Shape
             */

            /**
             * Constructs a new Update_My_Profile_Response.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_My_Profile_Response.
             * @constructor
             * @param {lingcat.methods.Update_My_Profile_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_My_Profile_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Update_My_Profile_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {lingcat.methods.Update_My_Profile_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_My_Profile_Response} Update_My_Profile_Response instance
             * @type {{
             *   (properties: lingcat.methods.Update_My_Profile_Response.$Shape): lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape;
             *   (properties?: lingcat.methods.Update_My_Profile_Response.$Properties): lingcat.methods.Update_My_Profile_Response;
             * }}
             */
            Update_My_Profile_Response.create = function(properties) {
                return new Update_My_Profile_Response(properties);
            };

            /**
             * Encodes the specified Update_My_Profile_Response message. Does not implicitly {@link lingcat.methods.Update_My_Profile_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {lingcat.methods.Update_My_Profile_Response.$Properties} message Update_My_Profile_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Profile_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Update_My_Profile_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Profile_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {lingcat.methods.Update_My_Profile_Response.$Properties} message Update_My_Profile_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Profile_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_My_Profile_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape} Update_My_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Profile_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_My_Profile_Response();
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
             * Decodes an Update_My_Profile_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape} Update_My_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Profile_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_My_Profile_Response message.
             * @function verify
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_My_Profile_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates an Update_My_Profile_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_My_Profile_Response} Update_My_Profile_Response
             */
            Update_My_Profile_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_My_Profile_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_My_Profile_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Update_My_Profile_Response();
            };

            /**
             * Creates a plain object from an Update_My_Profile_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {lingcat.methods.Update_My_Profile_Response} message Update_My_Profile_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_My_Profile_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Update_My_Profile_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_My_Profile_Response.prototype.toJSON = function() {
                return Update_My_Profile_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_My_Profile_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_My_Profile_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_My_Profile_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_My_Profile_Response";
            };

            return Update_My_Profile_Response;
        })();

        methods.Update_Chat_Profile_Request = (function() {

            /**
             * Properties of an Update_Chat_Profile_Request.
             * @typedef {Object} lingcat.methods.Update_Chat_Profile_Request.$Properties
             * @property {string|null} [accessToken] Update_Chat_Profile_Request accessToken
             * @property {string|null} [chatId] Update_Chat_Profile_Request chatId
             * @property {string|null} [avatarFileHash] Update_Chat_Profile_Request avatarFileHash
             * @property {string|null} [title] Update_Chat_Profile_Request title
             * @property {string|null} [description] Update_Chat_Profile_Request description
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_Chat_Profile_Request.
             * @memberof lingcat.methods
             * @interface IUpdate_Chat_Profile_Request
             * @augments lingcat.methods.Update_Chat_Profile_Request.$Properties
             * @deprecated Use lingcat.methods.Update_Chat_Profile_Request.$Properties instead.
             */

            /**
             * Shape of an Update_Chat_Profile_Request.
             * @typedef {lingcat.methods.Update_Chat_Profile_Request.$Properties} lingcat.methods.Update_Chat_Profile_Request.$Shape
             */

            /**
             * Constructs a new Update_Chat_Profile_Request.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_Chat_Profile_Request.
             * @constructor
             * @param {lingcat.methods.Update_Chat_Profile_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_Chat_Profile_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Update_Chat_Profile_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             */
            Update_Chat_Profile_Request.prototype.accessToken = "";

            /**
             * Update_Chat_Profile_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             */
            Update_Chat_Profile_Request.prototype.chatId = "";

            /**
             * Update_Chat_Profile_Request avatarFileHash.
             * @member {string|null|undefined} avatarFileHash
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             */
            Update_Chat_Profile_Request.prototype.avatarFileHash = null;

            /**
             * Update_Chat_Profile_Request title.
             * @member {string|null|undefined} title
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             */
            Update_Chat_Profile_Request.prototype.title = null;

            /**
             * Update_Chat_Profile_Request description.
             * @member {string|null|undefined} description
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             */
            Update_Chat_Profile_Request.prototype.description = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_Chat_Profile_Request.prototype, "_avatarFileHash", {
                get: $util.oneOfGetter($oneOfFields = ["avatarFileHash"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_Chat_Profile_Request.prototype, "_title", {
                get: $util.oneOfGetter($oneOfFields = ["title"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Update_Chat_Profile_Request.prototype, "_description", {
                get: $util.oneOfGetter($oneOfFields = ["description"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Update_Chat_Profile_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_Chat_Profile_Request} Update_Chat_Profile_Request instance
             * @type {{
             *   (properties: lingcat.methods.Update_Chat_Profile_Request.$Shape): lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape;
             *   (properties?: lingcat.methods.Update_Chat_Profile_Request.$Properties): lingcat.methods.Update_Chat_Profile_Request;
             * }}
             */
            Update_Chat_Profile_Request.create = function(properties) {
                return new Update_Chat_Profile_Request(properties);
            };

            /**
             * Encodes the specified Update_Chat_Profile_Request message. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Request.$Properties} message Update_Chat_Profile_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Profile_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.avatarFileHash);
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.title);
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Update_Chat_Profile_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Request.$Properties} message Update_Chat_Profile_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Profile_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_Chat_Profile_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape} Update_Chat_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Profile_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_Chat_Profile_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.avatarFileHash = reader.stringVerify();
                            message._avatarFileHash = "avatarFileHash";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.title = reader.stringVerify();
                            message._title = "title";
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.description = reader.stringVerify();
                            message._description = "description";
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
             * Decodes an Update_Chat_Profile_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape} Update_Chat_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Profile_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_Chat_Profile_Request message.
             * @function verify
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_Chat_Profile_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash")) {
                    properties._avatarFileHash = 1;
                    if (!$util.isString(message.avatarFileHash))
                        return "avatarFileHash: string expected";
                }
                if (message.title != null && $Object.hasOwnProperty.call(message, "title")) {
                    properties._title = 1;
                    if (!$util.isString(message.title))
                        return "title: string expected";
                }
                if (message.description != null && $Object.hasOwnProperty.call(message, "description")) {
                    properties._description = 1;
                    if (!$util.isString(message.description))
                        return "description: string expected";
                }
                return null;
            };

            /**
             * Creates an Update_Chat_Profile_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_Chat_Profile_Request} Update_Chat_Profile_Request
             */
            Update_Chat_Profile_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_Chat_Profile_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_Chat_Profile_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Update_Chat_Profile_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.avatarFileHash != null)
                    message.avatarFileHash = $String(object.avatarFileHash);
                if (object.title != null)
                    message.title = $String(object.title);
                if (object.description != null)
                    message.description = $String(object.description);
                return message;
            };

            /**
             * Creates a plain object from an Update_Chat_Profile_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Request} message Update_Chat_Profile_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_Chat_Profile_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.avatarFileHash != null && $Object.hasOwnProperty.call(message, "avatarFileHash"))
                    object.avatarFileHash = message.avatarFileHash;
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    object.title = message.title;
                if (message.description != null && $Object.hasOwnProperty.call(message, "description"))
                    object.description = message.description;
                return object;
            };

            /**
             * Converts this Update_Chat_Profile_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_Chat_Profile_Request.prototype.toJSON = function() {
                return Update_Chat_Profile_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_Chat_Profile_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_Chat_Profile_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_Chat_Profile_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_Chat_Profile_Request";
            };

            return Update_Chat_Profile_Request;
        })();

        methods.Update_Chat_Profile_Response = (function() {

            /**
             * Properties of an Update_Chat_Profile_Response.
             * @typedef {Object} lingcat.methods.Update_Chat_Profile_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_Chat_Profile_Response.
             * @memberof lingcat.methods
             * @interface IUpdate_Chat_Profile_Response
             * @augments lingcat.methods.Update_Chat_Profile_Response.$Properties
             * @deprecated Use lingcat.methods.Update_Chat_Profile_Response.$Properties instead.
             */

            /**
             * Shape of an Update_Chat_Profile_Response.
             * @typedef {lingcat.methods.Update_Chat_Profile_Response.$Properties} lingcat.methods.Update_Chat_Profile_Response.$Shape
             */

            /**
             * Constructs a new Update_Chat_Profile_Response.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_Chat_Profile_Response.
             * @constructor
             * @param {lingcat.methods.Update_Chat_Profile_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_Chat_Profile_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Update_Chat_Profile_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_Chat_Profile_Response} Update_Chat_Profile_Response instance
             * @type {{
             *   (properties: lingcat.methods.Update_Chat_Profile_Response.$Shape): lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape;
             *   (properties?: lingcat.methods.Update_Chat_Profile_Response.$Properties): lingcat.methods.Update_Chat_Profile_Response;
             * }}
             */
            Update_Chat_Profile_Response.create = function(properties) {
                return new Update_Chat_Profile_Response(properties);
            };

            /**
             * Encodes the specified Update_Chat_Profile_Response message. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Response.$Properties} message Update_Chat_Profile_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Profile_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Update_Chat_Profile_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Response.$Properties} message Update_Chat_Profile_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Profile_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_Chat_Profile_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape} Update_Chat_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Profile_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_Chat_Profile_Response();
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
             * Decodes an Update_Chat_Profile_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape} Update_Chat_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Profile_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_Chat_Profile_Response message.
             * @function verify
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_Chat_Profile_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates an Update_Chat_Profile_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_Chat_Profile_Response} Update_Chat_Profile_Response
             */
            Update_Chat_Profile_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_Chat_Profile_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_Chat_Profile_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Update_Chat_Profile_Response();
            };

            /**
             * Creates a plain object from an Update_Chat_Profile_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Profile_Response} message Update_Chat_Profile_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_Chat_Profile_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Update_Chat_Profile_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_Chat_Profile_Response.prototype.toJSON = function() {
                return Update_Chat_Profile_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_Chat_Profile_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_Chat_Profile_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_Chat_Profile_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_Chat_Profile_Response";
            };

            return Update_Chat_Profile_Response;
        })();

        methods.Send_Chat_Message_Request = (function() {

            /**
             * Properties of a Send_Chat_Message_Request.
             * @typedef {Object} lingcat.methods.Send_Chat_Message_Request.$Properties
             * @property {string|null} [accessToken] Send_Chat_Message_Request accessToken
             * @property {string|null} [chatId] Send_Chat_Message_Request chatId
             * @property {string|null} [text] Send_Chat_Message_Request text
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Send_Chat_Message_Request.
             * @memberof lingcat.methods
             * @interface ISend_Chat_Message_Request
             * @augments lingcat.methods.Send_Chat_Message_Request.$Properties
             * @deprecated Use lingcat.methods.Send_Chat_Message_Request.$Properties instead.
             */

            /**
             * Shape of a Send_Chat_Message_Request.
             * @typedef {lingcat.methods.Send_Chat_Message_Request.$Properties} lingcat.methods.Send_Chat_Message_Request.$Shape
             */

            /**
             * Constructs a new Send_Chat_Message_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Send_Chat_Message_Request.
             * @constructor
             * @param {lingcat.methods.Send_Chat_Message_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Send_Chat_Message_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Send_Chat_Message_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @instance
             */
            Send_Chat_Message_Request.prototype.accessToken = "";

            /**
             * Send_Chat_Message_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @instance
             */
            Send_Chat_Message_Request.prototype.chatId = "";

            /**
             * Send_Chat_Message_Request text.
             * @member {string} text
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @instance
             */
            Send_Chat_Message_Request.prototype.text = "";

            /**
             * Creates a new Send_Chat_Message_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Send_Chat_Message_Request} Send_Chat_Message_Request instance
             * @type {{
             *   (properties: lingcat.methods.Send_Chat_Message_Request.$Shape): lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape;
             *   (properties?: lingcat.methods.Send_Chat_Message_Request.$Properties): lingcat.methods.Send_Chat_Message_Request;
             * }}
             */
            Send_Chat_Message_Request.create = function(properties) {
                return new Send_Chat_Message_Request(properties);
            };

            /**
             * Encodes the specified Send_Chat_Message_Request message. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Request.$Properties} message Send_Chat_Message_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Send_Chat_Message_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.text != null && $Object.hasOwnProperty.call(message, "text") && message.text !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.text);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Send_Chat_Message_Request message, length delimited. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Request.$Properties} message Send_Chat_Message_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Send_Chat_Message_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Send_Chat_Message_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape} Send_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Send_Chat_Message_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Send_Chat_Message_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.text = value;
                            else
                                delete message.text;
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
             * Decodes a Send_Chat_Message_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape} Send_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Send_Chat_Message_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Send_Chat_Message_Request message.
             * @function verify
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Send_Chat_Message_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.text != null && $Object.hasOwnProperty.call(message, "text"))
                    if (!$util.isString(message.text))
                        return "text: string expected";
                return null;
            };

            /**
             * Creates a Send_Chat_Message_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Send_Chat_Message_Request} Send_Chat_Message_Request
             */
            Send_Chat_Message_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Send_Chat_Message_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Send_Chat_Message_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Send_Chat_Message_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.text != null)
                    if (typeof object.text !== "string" || object.text.length)
                        message.text = $String(object.text);
                return message;
            };

            /**
             * Creates a plain object from a Send_Chat_Message_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Request} message Send_Chat_Message_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Send_Chat_Message_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                    object.text = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.text != null && $Object.hasOwnProperty.call(message, "text"))
                    object.text = message.text;
                return object;
            };

            /**
             * Converts this Send_Chat_Message_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Send_Chat_Message_Request.prototype.toJSON = function() {
                return Send_Chat_Message_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Send_Chat_Message_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Send_Chat_Message_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Send_Chat_Message_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Send_Chat_Message_Request";
            };

            return Send_Chat_Message_Request;
        })();

        methods.Send_Chat_Message_Response = (function() {

            /**
             * Properties of a Send_Chat_Message_Response.
             * @typedef {Object} lingcat.methods.Send_Chat_Message_Response.$Properties
             * @property {number|null} [id] Send_Chat_Message_Response id
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Send_Chat_Message_Response.
             * @memberof lingcat.methods
             * @interface ISend_Chat_Message_Response
             * @augments lingcat.methods.Send_Chat_Message_Response.$Properties
             * @deprecated Use lingcat.methods.Send_Chat_Message_Response.$Properties instead.
             */

            /**
             * Shape of a Send_Chat_Message_Response.
             * @typedef {lingcat.methods.Send_Chat_Message_Response.$Properties} lingcat.methods.Send_Chat_Message_Response.$Shape
             */

            /**
             * Constructs a new Send_Chat_Message_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Send_Chat_Message_Response.
             * @constructor
             * @param {lingcat.methods.Send_Chat_Message_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Send_Chat_Message_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Send_Chat_Message_Response id.
             * @member {number} id
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @instance
             */
            Send_Chat_Message_Response.prototype.id = 0;

            /**
             * Creates a new Send_Chat_Message_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Send_Chat_Message_Response} Send_Chat_Message_Response instance
             * @type {{
             *   (properties: lingcat.methods.Send_Chat_Message_Response.$Shape): lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape;
             *   (properties?: lingcat.methods.Send_Chat_Message_Response.$Properties): lingcat.methods.Send_Chat_Message_Response;
             * }}
             */
            Send_Chat_Message_Response.create = function(properties) {
                return new Send_Chat_Message_Response(properties);
            };

            /**
             * Encodes the specified Send_Chat_Message_Response message. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Response.$Properties} message Send_Chat_Message_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Send_Chat_Message_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== 0)
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Send_Chat_Message_Response message, length delimited. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Response.$Properties} message Send_Chat_Message_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Send_Chat_Message_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Send_Chat_Message_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape} Send_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Send_Chat_Message_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Send_Chat_Message_Response(), value;
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
             * Decodes a Send_Chat_Message_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape} Send_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Send_Chat_Message_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Send_Chat_Message_Response message.
             * @function verify
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Send_Chat_Message_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                return null;
            };

            /**
             * Creates a Send_Chat_Message_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Send_Chat_Message_Response} Send_Chat_Message_Response
             */
            Send_Chat_Message_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Send_Chat_Message_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Send_Chat_Message_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Send_Chat_Message_Response();
                if (object.id != null)
                    if ($Number(object.id) !== 0)
                        message.id = object.id >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a Send_Chat_Message_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {lingcat.methods.Send_Chat_Message_Response} message Send_Chat_Message_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Send_Chat_Message_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.id = 0;
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this Send_Chat_Message_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Send_Chat_Message_Response.prototype.toJSON = function() {
                return Send_Chat_Message_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Send_Chat_Message_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Send_Chat_Message_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Send_Chat_Message_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Send_Chat_Message_Response";
            };

            return Send_Chat_Message_Response;
        })();

        methods.Receive_Chat_Message_Event = (function() {

            /**
             * Properties of a Receive_Chat_Message_Event.
             * @typedef {Object} lingcat.methods.Receive_Chat_Message_Event.$Properties
             * @property {lingcat.classes.IMessage.$Properties|null} [msg] Receive_Chat_Message_Event msg
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Receive_Chat_Message_Event.
             * @memberof lingcat.methods
             * @interface IReceive_Chat_Message_Event
             * @augments lingcat.methods.Receive_Chat_Message_Event.$Properties
             * @deprecated Use lingcat.methods.Receive_Chat_Message_Event.$Properties instead.
             */

            /**
             * Shape of a Receive_Chat_Message_Event.
             * @typedef {lingcat.methods.Receive_Chat_Message_Event.$Properties} lingcat.methods.Receive_Chat_Message_Event.$Shape
             */

            /**
             * Constructs a new Receive_Chat_Message_Event.
             * @memberof lingcat.methods
             * @classdesc Represents a Receive_Chat_Message_Event.
             * @constructor
             * @param {lingcat.methods.Receive_Chat_Message_Event.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Receive_Chat_Message_Event = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Receive_Chat_Message_Event msg.
             * @member {lingcat.classes.IMessage.$Properties|null|undefined} msg
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @instance
             */
            Receive_Chat_Message_Event.prototype.msg = null;

            /**
             * Creates a new Receive_Chat_Message_Event instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {lingcat.methods.Receive_Chat_Message_Event.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Receive_Chat_Message_Event} Receive_Chat_Message_Event instance
             * @type {{
             *   (properties: lingcat.methods.Receive_Chat_Message_Event.$Shape): lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape;
             *   (properties?: lingcat.methods.Receive_Chat_Message_Event.$Properties): lingcat.methods.Receive_Chat_Message_Event;
             * }}
             */
            Receive_Chat_Message_Event.create = function(properties) {
                return new Receive_Chat_Message_Event(properties);
            };

            /**
             * Encodes the specified Receive_Chat_Message_Event message. Does not implicitly {@link lingcat.methods.Receive_Chat_Message_Event.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {lingcat.methods.Receive_Chat_Message_Event.$Properties} message Receive_Chat_Message_Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receive_Chat_Message_Event.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.msg != null && $Object.hasOwnProperty.call(message, "msg"))
                    $root.lingcat.classes.IMessage.encode(message.msg, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Receive_Chat_Message_Event message, length delimited. Does not implicitly {@link lingcat.methods.Receive_Chat_Message_Event.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {lingcat.methods.Receive_Chat_Message_Event.$Properties} message Receive_Chat_Message_Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receive_Chat_Message_Event.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Receive_Chat_Message_Event message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape} Receive_Chat_Message_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receive_Chat_Message_Event.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Receive_Chat_Message_Event(), value;
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
                            message.msg = $root.lingcat.classes.IMessage.decode(reader, reader.uint32(), $undefined, _depth + 1, message.msg);
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
             * Decodes a Receive_Chat_Message_Event message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape} Receive_Chat_Message_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receive_Chat_Message_Event.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Receive_Chat_Message_Event message.
             * @function verify
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Receive_Chat_Message_Event.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.msg != null && $Object.hasOwnProperty.call(message, "msg")) {
                    let error = $root.lingcat.classes.IMessage.verify(message.msg, _depth + 1);
                    if (error)
                        return "msg." + error;
                }
                return null;
            };

            /**
             * Creates a Receive_Chat_Message_Event message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Receive_Chat_Message_Event} Receive_Chat_Message_Event
             */
            Receive_Chat_Message_Event.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Receive_Chat_Message_Event)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Receive_Chat_Message_Event: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Receive_Chat_Message_Event();
                if (object.msg != null) {
                    if (!$util.isObject(object.msg))
                        throw $TypeError(".lingcat.methods.Receive_Chat_Message_Event.msg: object expected");
                    message.msg = $root.lingcat.classes.IMessage.fromObject(object.msg, _depth + 1);
                }
                return message;
            };

            /**
             * Creates a plain object from a Receive_Chat_Message_Event message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {lingcat.methods.Receive_Chat_Message_Event} message Receive_Chat_Message_Event
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Receive_Chat_Message_Event.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.msg = null;
                if (message.msg != null && $Object.hasOwnProperty.call(message, "msg"))
                    object.msg = $root.lingcat.classes.IMessage.toObject(message.msg, options, _depth + 1);
                return object;
            };

            /**
             * Converts this Receive_Chat_Message_Event to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Receive_Chat_Message_Event.prototype.toJSON = function() {
                return Receive_Chat_Message_Event.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Receive_Chat_Message_Event
             * @function getTypeUrl
             * @memberof lingcat.methods.Receive_Chat_Message_Event
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Receive_Chat_Message_Event.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Receive_Chat_Message_Event";
            };

            return Receive_Chat_Message_Event;
        })();

        methods.Get_Chat_Messages_Request = (function() {

            /**
             * Properties of a Get_Chat_Messages_Request.
             * @typedef {Object} lingcat.methods.Get_Chat_Messages_Request.$Properties
             * @property {string|null} [accessToken] Get_Chat_Messages_Request accessToken
             * @property {string|null} [chatId] Get_Chat_Messages_Request chatId
             * @property {number|null} [before] Get_Chat_Messages_Request before
             * @property {number|null} [after] Get_Chat_Messages_Request after
             * @property {number|null} [limit] Get_Chat_Messages_Request limit
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Messages_Request.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Messages_Request
             * @augments lingcat.methods.Get_Chat_Messages_Request.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Messages_Request.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Messages_Request.
             * @typedef {lingcat.methods.Get_Chat_Messages_Request.$Properties} lingcat.methods.Get_Chat_Messages_Request.$Shape
             */

            /**
             * Constructs a new Get_Chat_Messages_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Messages_Request.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Messages_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Messages_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Messages_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             */
            Get_Chat_Messages_Request.prototype.accessToken = "";

            /**
             * Get_Chat_Messages_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             */
            Get_Chat_Messages_Request.prototype.chatId = "";

            /**
             * Get_Chat_Messages_Request before.
             * @member {number|null|undefined} before
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             */
            Get_Chat_Messages_Request.prototype.before = null;

            /**
             * Get_Chat_Messages_Request after.
             * @member {number|null|undefined} after
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             */
            Get_Chat_Messages_Request.prototype.after = null;

            /**
             * Get_Chat_Messages_Request limit.
             * @member {number|null|undefined} limit
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             */
            Get_Chat_Messages_Request.prototype.limit = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_Chat_Messages_Request.prototype, "_before", {
                get: $util.oneOfGetter($oneOfFields = ["before"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_Chat_Messages_Request.prototype, "_after", {
                get: $util.oneOfGetter($oneOfFields = ["after"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_Chat_Messages_Request.prototype, "_limit", {
                get: $util.oneOfGetter($oneOfFields = ["limit"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Get_Chat_Messages_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Messages_Request} Get_Chat_Messages_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Messages_Request.$Shape): lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Messages_Request.$Properties): lingcat.methods.Get_Chat_Messages_Request;
             * }}
             */
            Get_Chat_Messages_Request.create = function(properties) {
                return new Get_Chat_Messages_Request(properties);
            };

            /**
             * Encodes the specified Get_Chat_Messages_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Request.$Properties} message Get_Chat_Messages_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Messages_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.before != null && $Object.hasOwnProperty.call(message, "before"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.before);
                if (message.after != null && $Object.hasOwnProperty.call(message, "after"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.after);
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.limit);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Messages_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Request.$Properties} message Get_Chat_Messages_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Messages_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Messages_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape} Get_Chat_Messages_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Messages_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Messages_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.before = reader.uint32();
                            message._before = "before";
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            message.after = reader.uint32();
                            message._after = "after";
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            message.limit = reader.uint32();
                            message._limit = "limit";
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
             * Decodes a Get_Chat_Messages_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape} Get_Chat_Messages_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Messages_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Messages_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Messages_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.before != null && $Object.hasOwnProperty.call(message, "before")) {
                    properties._before = 1;
                    if (!$util.isInteger(message.before))
                        return "before: integer expected";
                }
                if (message.after != null && $Object.hasOwnProperty.call(message, "after")) {
                    properties._after = 1;
                    if (!$util.isInteger(message.after))
                        return "after: integer expected";
                }
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit")) {
                    properties._limit = 1;
                    if (!$util.isInteger(message.limit))
                        return "limit: integer expected";
                }
                return null;
            };

            /**
             * Creates a Get_Chat_Messages_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Messages_Request} Get_Chat_Messages_Request
             */
            Get_Chat_Messages_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Messages_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Messages_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Messages_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.before != null)
                    message.before = object.before >>> 0;
                if (object.after != null)
                    message.after = object.after >>> 0;
                if (object.limit != null)
                    message.limit = object.limit >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Messages_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Request} message Get_Chat_Messages_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Messages_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.before != null && $Object.hasOwnProperty.call(message, "before"))
                    object.before = message.before;
                if (message.after != null && $Object.hasOwnProperty.call(message, "after"))
                    object.after = message.after;
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    object.limit = message.limit;
                return object;
            };

            /**
             * Converts this Get_Chat_Messages_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Messages_Request.prototype.toJSON = function() {
                return Get_Chat_Messages_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Messages_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Messages_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Messages_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Messages_Request";
            };

            return Get_Chat_Messages_Request;
        })();

        methods.Get_Chat_Messages_Response = (function() {

            /**
             * Properties of a Get_Chat_Messages_Response.
             * @typedef {Object} lingcat.methods.Get_Chat_Messages_Response.$Properties
             * @property {Array.<lingcat.classes.IMessage.$Properties>|null} [messages] Get_Chat_Messages_Response messages
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Messages_Response.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Messages_Response
             * @augments lingcat.methods.Get_Chat_Messages_Response.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Messages_Response.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Messages_Response.
             * @typedef {lingcat.methods.Get_Chat_Messages_Response.$Properties} lingcat.methods.Get_Chat_Messages_Response.$Shape
             */

            /**
             * Constructs a new Get_Chat_Messages_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Messages_Response.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Messages_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Messages_Response = function (properties) {
                this.messages = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Messages_Response messages.
             * @member {Array.<lingcat.classes.IMessage.$Properties>} messages
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @instance
             */
            Get_Chat_Messages_Response.prototype.messages = $util.emptyArray;

            /**
             * Creates a new Get_Chat_Messages_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Messages_Response} Get_Chat_Messages_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Messages_Response.$Shape): lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Messages_Response.$Properties): lingcat.methods.Get_Chat_Messages_Response;
             * }}
             */
            Get_Chat_Messages_Response.create = function(properties) {
                return new Get_Chat_Messages_Response(properties);
            };

            /**
             * Encodes the specified Get_Chat_Messages_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Response.$Properties} message Get_Chat_Messages_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Messages_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.messages != null && message.messages.length)
                    for (let i = 0; i < message.messages.length; ++i)
                        $root.lingcat.classes.IMessage.encode(message.messages[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Messages_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Response.$Properties} message Get_Chat_Messages_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Messages_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Messages_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape} Get_Chat_Messages_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Messages_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Messages_Response();
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
                            if (!(message.messages && message.messages.length))
                                message.messages = [];
                            message.messages.push($root.lingcat.classes.IMessage.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Get_Chat_Messages_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape} Get_Chat_Messages_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Messages_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Messages_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Messages_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.messages != null && $Object.hasOwnProperty.call(message, "messages")) {
                    if (!$Array.isArray(message.messages))
                        return "messages: array expected";
                    for (let i = 0; i < message.messages.length; ++i) {
                        let error = $root.lingcat.classes.IMessage.verify(message.messages[i], _depth + 1);
                        if (error)
                            return "messages." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Get_Chat_Messages_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Messages_Response} Get_Chat_Messages_Response
             */
            Get_Chat_Messages_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Messages_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Messages_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Messages_Response();
                if (object.messages) {
                    if (!$Array.isArray(object.messages))
                        throw $TypeError(".lingcat.methods.Get_Chat_Messages_Response.messages: array expected");
                    message.messages = $Array(object.messages.length);
                    for (let i = 0; i < object.messages.length; ++i) {
                        if (!$util.isObject(object.messages[i]))
                            throw $TypeError(".lingcat.methods.Get_Chat_Messages_Response.messages: object expected");
                        message.messages[i] = $root.lingcat.classes.IMessage.fromObject(object.messages[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Messages_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Messages_Response} message Get_Chat_Messages_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Messages_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.messages = [];
                if (message.messages && message.messages.length) {
                    object.messages = $Array(message.messages.length);
                    for (let j = 0; j < message.messages.length; ++j)
                        object.messages[j] = $root.lingcat.classes.IMessage.toObject(message.messages[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Get_Chat_Messages_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Messages_Response.prototype.toJSON = function() {
                return Get_Chat_Messages_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Messages_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Messages_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Messages_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Messages_Response";
            };

            return Get_Chat_Messages_Response;
        })();

        methods.Query_Chat_Info_Request = (function() {

            /**
             * Properties of a Query_Chat_Info_Request.
             * @typedef {Object} lingcat.methods.Query_Chat_Info_Request.$Properties
             * @property {string|null} [accessToken] Query_Chat_Info_Request accessToken
             * @property {string|null} [chatId] Query_Chat_Info_Request chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_Chat_Info_Request.
             * @memberof lingcat.methods
             * @interface IQuery_Chat_Info_Request
             * @augments lingcat.methods.Query_Chat_Info_Request.$Properties
             * @deprecated Use lingcat.methods.Query_Chat_Info_Request.$Properties instead.
             */

            /**
             * Shape of a Query_Chat_Info_Request.
             * @typedef {lingcat.methods.Query_Chat_Info_Request.$Properties} lingcat.methods.Query_Chat_Info_Request.$Shape
             */

            /**
             * Constructs a new Query_Chat_Info_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Query_Chat_Info_Request.
             * @constructor
             * @param {lingcat.methods.Query_Chat_Info_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_Chat_Info_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_Chat_Info_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @instance
             */
            Query_Chat_Info_Request.prototype.accessToken = "";

            /**
             * Query_Chat_Info_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @instance
             */
            Query_Chat_Info_Request.prototype.chatId = "";

            /**
             * Creates a new Query_Chat_Info_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_Chat_Info_Request} Query_Chat_Info_Request instance
             * @type {{
             *   (properties: lingcat.methods.Query_Chat_Info_Request.$Shape): lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape;
             *   (properties?: lingcat.methods.Query_Chat_Info_Request.$Properties): lingcat.methods.Query_Chat_Info_Request;
             * }}
             */
            Query_Chat_Info_Request.create = function(properties) {
                return new Query_Chat_Info_Request(properties);
            };

            /**
             * Encodes the specified Query_Chat_Info_Request message. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Request.$Properties} message Query_Chat_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_Chat_Info_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_Chat_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Request.$Properties} message Query_Chat_Info_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_Chat_Info_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_Chat_Info_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape} Query_Chat_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_Chat_Info_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_Chat_Info_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Query_Chat_Info_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape} Query_Chat_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_Chat_Info_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_Chat_Info_Request message.
             * @function verify
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_Chat_Info_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Query_Chat_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_Chat_Info_Request} Query_Chat_Info_Request
             */
            Query_Chat_Info_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_Chat_Info_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_Chat_Info_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_Chat_Info_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Query_Chat_Info_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Request} message Query_Chat_Info_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_Chat_Info_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Query_Chat_Info_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_Chat_Info_Request.prototype.toJSON = function() {
                return Query_Chat_Info_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_Chat_Info_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_Chat_Info_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_Chat_Info_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_Chat_Info_Request";
            };

            return Query_Chat_Info_Request;
        })();

        methods.Query_Chat_Info_Response = (function() {

            /**
             * Properties of a Query_Chat_Info_Response.
             * @typedef {Object} lingcat.methods.Query_Chat_Info_Response.$Properties
             * @property {lingcat.classes.IChat.$Properties|null} [info] Query_Chat_Info_Response info
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Query_Chat_Info_Response.
             * @memberof lingcat.methods
             * @interface IQuery_Chat_Info_Response
             * @augments lingcat.methods.Query_Chat_Info_Response.$Properties
             * @deprecated Use lingcat.methods.Query_Chat_Info_Response.$Properties instead.
             */

            /**
             * Shape of a Query_Chat_Info_Response.
             * @typedef {lingcat.methods.Query_Chat_Info_Response.$Properties} lingcat.methods.Query_Chat_Info_Response.$Shape
             */

            /**
             * Constructs a new Query_Chat_Info_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Query_Chat_Info_Response.
             * @constructor
             * @param {lingcat.methods.Query_Chat_Info_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Query_Chat_Info_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Query_Chat_Info_Response info.
             * @member {lingcat.classes.IChat.$Properties|null|undefined} info
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @instance
             */
            Query_Chat_Info_Response.prototype.info = null;

            /**
             * Creates a new Query_Chat_Info_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Query_Chat_Info_Response} Query_Chat_Info_Response instance
             * @type {{
             *   (properties: lingcat.methods.Query_Chat_Info_Response.$Shape): lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape;
             *   (properties?: lingcat.methods.Query_Chat_Info_Response.$Properties): lingcat.methods.Query_Chat_Info_Response;
             * }}
             */
            Query_Chat_Info_Response.create = function(properties) {
                return new Query_Chat_Info_Response(properties);
            };

            /**
             * Encodes the specified Query_Chat_Info_Response message. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Response.$Properties} message Query_Chat_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_Chat_Info_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.lingcat.classes.IChat.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Query_Chat_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Response.$Properties} message Query_Chat_Info_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Query_Chat_Info_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Query_Chat_Info_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape} Query_Chat_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_Chat_Info_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Query_Chat_Info_Response(), value;
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
                            message.info = $root.lingcat.classes.IChat.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
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
             * Decodes a Query_Chat_Info_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape} Query_Chat_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Query_Chat_Info_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Query_Chat_Info_Response message.
             * @function verify
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Query_Chat_Info_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.info != null && $Object.hasOwnProperty.call(message, "info")) {
                    let error = $root.lingcat.classes.IChat.verify(message.info, _depth + 1);
                    if (error)
                        return "info." + error;
                }
                return null;
            };

            /**
             * Creates a Query_Chat_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Query_Chat_Info_Response} Query_Chat_Info_Response
             */
            Query_Chat_Info_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Query_Chat_Info_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Query_Chat_Info_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Query_Chat_Info_Response();
                if (object.info != null) {
                    if (!$util.isObject(object.info))
                        throw $TypeError(".lingcat.methods.Query_Chat_Info_Response.info: object expected");
                    message.info = $root.lingcat.classes.IChat.fromObject(object.info, _depth + 1);
                }
                return message;
            };

            /**
             * Creates a plain object from a Query_Chat_Info_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {lingcat.methods.Query_Chat_Info_Response} message Query_Chat_Info_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Query_Chat_Info_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.info = null;
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    object.info = $root.lingcat.classes.IChat.toObject(message.info, options, _depth + 1);
                return object;
            };

            /**
             * Converts this Query_Chat_Info_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Query_Chat_Info_Response.prototype.toJSON = function() {
                return Query_Chat_Info_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Query_Chat_Info_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Query_Chat_Info_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Query_Chat_Info_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Query_Chat_Info_Response";
            };

            return Query_Chat_Info_Response;
        })();

        methods.Get_Or_Create_Private_Chat_Request = (function() {

            /**
             * Properties of a Get_Or_Create_Private_Chat_Request.
             * @typedef {Object} lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties
             * @property {string|null} [accessToken] Get_Or_Create_Private_Chat_Request accessToken
             * @property {string|null} [targetUserId] Get_Or_Create_Private_Chat_Request targetUserId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Or_Create_Private_Chat_Request.
             * @memberof lingcat.methods
             * @interface IGet_Or_Create_Private_Chat_Request
             * @augments lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties
             * @deprecated Use lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties instead.
             */

            /**
             * Shape of a Get_Or_Create_Private_Chat_Request.
             * @typedef {lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties} lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape
             */

            /**
             * Constructs a new Get_Or_Create_Private_Chat_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Or_Create_Private_Chat_Request.
             * @constructor
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Or_Create_Private_Chat_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Or_Create_Private_Chat_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @instance
             */
            Get_Or_Create_Private_Chat_Request.prototype.accessToken = "";

            /**
             * Get_Or_Create_Private_Chat_Request targetUserId.
             * @member {string} targetUserId
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @instance
             */
            Get_Or_Create_Private_Chat_Request.prototype.targetUserId = "";

            /**
             * Creates a new Get_Or_Create_Private_Chat_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request} Get_Or_Create_Private_Chat_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape): lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape;
             *   (properties?: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties): lingcat.methods.Get_Or_Create_Private_Chat_Request;
             * }}
             */
            Get_Or_Create_Private_Chat_Request.create = function(properties) {
                return new Get_Or_Create_Private_Chat_Request(properties);
            };

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Request message. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties} message Get_Or_Create_Private_Chat_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Or_Create_Private_Chat_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId") && message.targetUserId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.targetUserId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties} message Get_Or_Create_Private_Chat_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Or_Create_Private_Chat_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Or_Create_Private_Chat_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape} Get_Or_Create_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Or_Create_Private_Chat_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Or_Create_Private_Chat_Request(), value;
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
                                message.targetUserId = value;
                            else
                                delete message.targetUserId;
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
             * Decodes a Get_Or_Create_Private_Chat_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape} Get_Or_Create_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Or_Create_Private_Chat_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Or_Create_Private_Chat_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Or_Create_Private_Chat_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId"))
                    if (!$util.isString(message.targetUserId))
                        return "targetUserId: string expected";
                return null;
            };

            /**
             * Creates a Get_Or_Create_Private_Chat_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request} Get_Or_Create_Private_Chat_Request
             */
            Get_Or_Create_Private_Chat_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Or_Create_Private_Chat_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Or_Create_Private_Chat_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Or_Create_Private_Chat_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.targetUserId != null)
                    if (typeof object.targetUserId !== "string" || object.targetUserId.length)
                        message.targetUserId = $String(object.targetUserId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Or_Create_Private_Chat_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Request} message Get_Or_Create_Private_Chat_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Or_Create_Private_Chat_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.targetUserId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId"))
                    object.targetUserId = message.targetUserId;
                return object;
            };

            /**
             * Converts this Get_Or_Create_Private_Chat_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Or_Create_Private_Chat_Request.prototype.toJSON = function() {
                return Get_Or_Create_Private_Chat_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Or_Create_Private_Chat_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Or_Create_Private_Chat_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Or_Create_Private_Chat_Request";
            };

            return Get_Or_Create_Private_Chat_Request;
        })();

        methods.Get_Or_Create_Private_Chat_Response = (function() {

            /**
             * Properties of a Get_Or_Create_Private_Chat_Response.
             * @typedef {Object} lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties
             * @property {string|null} [chatId] Get_Or_Create_Private_Chat_Response chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Or_Create_Private_Chat_Response.
             * @memberof lingcat.methods
             * @interface IGet_Or_Create_Private_Chat_Response
             * @augments lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties
             * @deprecated Use lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties instead.
             */

            /**
             * Shape of a Get_Or_Create_Private_Chat_Response.
             * @typedef {lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties} lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape
             */

            /**
             * Constructs a new Get_Or_Create_Private_Chat_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Or_Create_Private_Chat_Response.
             * @constructor
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Or_Create_Private_Chat_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Or_Create_Private_Chat_Response chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @instance
             */
            Get_Or_Create_Private_Chat_Response.prototype.chatId = "";

            /**
             * Creates a new Get_Or_Create_Private_Chat_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response} Get_Or_Create_Private_Chat_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape): lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape;
             *   (properties?: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties): lingcat.methods.Get_Or_Create_Private_Chat_Response;
             * }}
             */
            Get_Or_Create_Private_Chat_Response.create = function(properties) {
                return new Get_Or_Create_Private_Chat_Response(properties);
            };

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Response message. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties} message Get_Or_Create_Private_Chat_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Or_Create_Private_Chat_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties} message Get_Or_Create_Private_Chat_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Or_Create_Private_Chat_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Or_Create_Private_Chat_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape} Get_Or_Create_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Or_Create_Private_Chat_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Or_Create_Private_Chat_Response(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Get_Or_Create_Private_Chat_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape} Get_Or_Create_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Or_Create_Private_Chat_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Or_Create_Private_Chat_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Or_Create_Private_Chat_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Get_Or_Create_Private_Chat_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response} Get_Or_Create_Private_Chat_Response
             */
            Get_Or_Create_Private_Chat_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Or_Create_Private_Chat_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Or_Create_Private_Chat_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Or_Create_Private_Chat_Response();
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Or_Create_Private_Chat_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Or_Create_Private_Chat_Response} message Get_Or_Create_Private_Chat_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Or_Create_Private_Chat_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.chatId = "";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Get_Or_Create_Private_Chat_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Or_Create_Private_Chat_Response.prototype.toJSON = function() {
                return Get_Or_Create_Private_Chat_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Or_Create_Private_Chat_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Or_Create_Private_Chat_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Or_Create_Private_Chat_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Or_Create_Private_Chat_Response";
            };

            return Get_Or_Create_Private_Chat_Response;
        })();

        methods.Get_My_Chats_Request = (function() {

            /**
             * Properties of a Get_My_Chats_Request.
             * @typedef {Object} lingcat.methods.Get_My_Chats_Request.$Properties
             * @property {string|null} [accessToken] Get_My_Chats_Request accessToken
             * @property {number|null} [limit] Get_My_Chats_Request limit
             * @property {number|null} [offset] Get_My_Chats_Request offset
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_My_Chats_Request.
             * @memberof lingcat.methods
             * @interface IGet_My_Chats_Request
             * @augments lingcat.methods.Get_My_Chats_Request.$Properties
             * @deprecated Use lingcat.methods.Get_My_Chats_Request.$Properties instead.
             */

            /**
             * Shape of a Get_My_Chats_Request.
             * @typedef {lingcat.methods.Get_My_Chats_Request.$Properties} lingcat.methods.Get_My_Chats_Request.$Shape
             */

            /**
             * Constructs a new Get_My_Chats_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_My_Chats_Request.
             * @constructor
             * @param {lingcat.methods.Get_My_Chats_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_My_Chats_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_My_Chats_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @instance
             */
            Get_My_Chats_Request.prototype.accessToken = "";

            /**
             * Get_My_Chats_Request limit.
             * @member {number|null|undefined} limit
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @instance
             */
            Get_My_Chats_Request.prototype.limit = null;

            /**
             * Get_My_Chats_Request offset.
             * @member {number|null|undefined} offset
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @instance
             */
            Get_My_Chats_Request.prototype.offset = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_My_Chats_Request.prototype, "_limit", {
                get: $util.oneOfGetter($oneOfFields = ["limit"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_My_Chats_Request.prototype, "_offset", {
                get: $util.oneOfGetter($oneOfFields = ["offset"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Get_My_Chats_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Chats_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_My_Chats_Request} Get_My_Chats_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_My_Chats_Request.$Shape): lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape;
             *   (properties?: lingcat.methods.Get_My_Chats_Request.$Properties): lingcat.methods.Get_My_Chats_Request;
             * }}
             */
            Get_My_Chats_Request.create = function(properties) {
                return new Get_My_Chats_Request(properties);
            };

            /**
             * Encodes the specified Get_My_Chats_Request message. Does not implicitly {@link lingcat.methods.Get_My_Chats_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Chats_Request.$Properties} message Get_My_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Chats_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.limit);
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.offset);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_My_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Chats_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Chats_Request.$Properties} message Get_My_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Chats_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_My_Chats_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape} Get_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Chats_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_My_Chats_Request(), value;
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
                            if (wireType !== 0)
                                break;
                            message.limit = reader.uint32();
                            message._limit = "limit";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.offset = reader.uint32();
                            message._offset = "offset";
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
             * Decodes a Get_My_Chats_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape} Get_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Chats_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_My_Chats_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_My_Chats_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit")) {
                    properties._limit = 1;
                    if (!$util.isInteger(message.limit))
                        return "limit: integer expected";
                }
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset")) {
                    properties._offset = 1;
                    if (!$util.isInteger(message.offset))
                        return "offset: integer expected";
                }
                return null;
            };

            /**
             * Creates a Get_My_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_My_Chats_Request} Get_My_Chats_Request
             */
            Get_My_Chats_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_My_Chats_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_My_Chats_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_My_Chats_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.limit != null)
                    message.limit = object.limit >>> 0;
                if (object.offset != null)
                    message.offset = object.offset >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a Get_My_Chats_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Chats_Request} message Get_My_Chats_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_My_Chats_Request.toObject = function (message, options, _depth) {
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
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    object.limit = message.limit;
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    object.offset = message.offset;
                return object;
            };

            /**
             * Converts this Get_My_Chats_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_My_Chats_Request.prototype.toJSON = function() {
                return Get_My_Chats_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_My_Chats_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_My_Chats_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_My_Chats_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_My_Chats_Request";
            };

            return Get_My_Chats_Request;
        })();

        methods.Get_My_Chats_Response = (function() {

            /**
             * Properties of a Get_My_Chats_Response.
             * @typedef {Object} lingcat.methods.Get_My_Chats_Response.$Properties
             * @property {Array.<lingcat.classes.IChat.$Properties>|null} [chats] Get_My_Chats_Response chats
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_My_Chats_Response.
             * @memberof lingcat.methods
             * @interface IGet_My_Chats_Response
             * @augments lingcat.methods.Get_My_Chats_Response.$Properties
             * @deprecated Use lingcat.methods.Get_My_Chats_Response.$Properties instead.
             */

            /**
             * Shape of a Get_My_Chats_Response.
             * @typedef {lingcat.methods.Get_My_Chats_Response.$Properties} lingcat.methods.Get_My_Chats_Response.$Shape
             */

            /**
             * Constructs a new Get_My_Chats_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_My_Chats_Response.
             * @constructor
             * @param {lingcat.methods.Get_My_Chats_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_My_Chats_Response = function (properties) {
                this.chats = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_My_Chats_Response chats.
             * @member {Array.<lingcat.classes.IChat.$Properties>} chats
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @instance
             */
            Get_My_Chats_Response.prototype.chats = $util.emptyArray;

            /**
             * Creates a new Get_My_Chats_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Chats_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_My_Chats_Response} Get_My_Chats_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_My_Chats_Response.$Shape): lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape;
             *   (properties?: lingcat.methods.Get_My_Chats_Response.$Properties): lingcat.methods.Get_My_Chats_Response;
             * }}
             */
            Get_My_Chats_Response.create = function(properties) {
                return new Get_My_Chats_Response(properties);
            };

            /**
             * Encodes the specified Get_My_Chats_Response message. Does not implicitly {@link lingcat.methods.Get_My_Chats_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Chats_Response.$Properties} message Get_My_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Chats_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chats != null && message.chats.length)
                    for (let i = 0; i < message.chats.length; ++i)
                        $root.lingcat.classes.IChat.encode(message.chats[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_My_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Chats_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Chats_Response.$Properties} message Get_My_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Chats_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_My_Chats_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape} Get_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Chats_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_My_Chats_Response();
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
                            if (!(message.chats && message.chats.length))
                                message.chats = [];
                            message.chats.push($root.lingcat.classes.IChat.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Get_My_Chats_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape} Get_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Chats_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_My_Chats_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_My_Chats_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chats != null && $Object.hasOwnProperty.call(message, "chats")) {
                    if (!$Array.isArray(message.chats))
                        return "chats: array expected";
                    for (let i = 0; i < message.chats.length; ++i) {
                        let error = $root.lingcat.classes.IChat.verify(message.chats[i], _depth + 1);
                        if (error)
                            return "chats." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Get_My_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_My_Chats_Response} Get_My_Chats_Response
             */
            Get_My_Chats_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_My_Chats_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_My_Chats_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_My_Chats_Response();
                if (object.chats) {
                    if (!$Array.isArray(object.chats))
                        throw $TypeError(".lingcat.methods.Get_My_Chats_Response.chats: array expected");
                    message.chats = $Array(object.chats.length);
                    for (let i = 0; i < object.chats.length; ++i) {
                        if (!$util.isObject(object.chats[i]))
                            throw $TypeError(".lingcat.methods.Get_My_Chats_Response.chats: object expected");
                        message.chats[i] = $root.lingcat.classes.IChat.fromObject(object.chats[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Get_My_Chats_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Chats_Response} message Get_My_Chats_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_My_Chats_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.chats = [];
                if (message.chats && message.chats.length) {
                    object.chats = $Array(message.chats.length);
                    for (let j = 0; j < message.chats.length; ++j)
                        object.chats[j] = $root.lingcat.classes.IChat.toObject(message.chats[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Get_My_Chats_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_My_Chats_Response.prototype.toJSON = function() {
                return Get_My_Chats_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_My_Chats_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_My_Chats_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_My_Chats_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_My_Chats_Response";
            };

            return Get_My_Chats_Response;
        })();

        methods.Get_My_Favourite_Chats_Request = (function() {

            /**
             * Properties of a Get_My_Favourite_Chats_Request.
             * @typedef {Object} lingcat.methods.Get_My_Favourite_Chats_Request.$Properties
             * @property {string|null} [accessToken] Get_My_Favourite_Chats_Request accessToken
             * @property {number|null} [limit] Get_My_Favourite_Chats_Request limit
             * @property {number|null} [offset] Get_My_Favourite_Chats_Request offset
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_My_Favourite_Chats_Request.
             * @memberof lingcat.methods
             * @interface IGet_My_Favourite_Chats_Request
             * @augments lingcat.methods.Get_My_Favourite_Chats_Request.$Properties
             * @deprecated Use lingcat.methods.Get_My_Favourite_Chats_Request.$Properties instead.
             */

            /**
             * Shape of a Get_My_Favourite_Chats_Request.
             * @typedef {lingcat.methods.Get_My_Favourite_Chats_Request.$Properties} lingcat.methods.Get_My_Favourite_Chats_Request.$Shape
             */

            /**
             * Constructs a new Get_My_Favourite_Chats_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_My_Favourite_Chats_Request.
             * @constructor
             * @param {lingcat.methods.Get_My_Favourite_Chats_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_My_Favourite_Chats_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_My_Favourite_Chats_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @instance
             */
            Get_My_Favourite_Chats_Request.prototype.accessToken = "";

            /**
             * Get_My_Favourite_Chats_Request limit.
             * @member {number|null|undefined} limit
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @instance
             */
            Get_My_Favourite_Chats_Request.prototype.limit = null;

            /**
             * Get_My_Favourite_Chats_Request offset.
             * @member {number|null|undefined} offset
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @instance
             */
            Get_My_Favourite_Chats_Request.prototype.offset = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_My_Favourite_Chats_Request.prototype, "_limit", {
                get: $util.oneOfGetter($oneOfFields = ["limit"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Get_My_Favourite_Chats_Request.prototype, "_offset", {
                get: $util.oneOfGetter($oneOfFields = ["offset"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Get_My_Favourite_Chats_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request} Get_My_Favourite_Chats_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_My_Favourite_Chats_Request.$Shape): lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape;
             *   (properties?: lingcat.methods.Get_My_Favourite_Chats_Request.$Properties): lingcat.methods.Get_My_Favourite_Chats_Request;
             * }}
             */
            Get_My_Favourite_Chats_Request.create = function(properties) {
                return new Get_My_Favourite_Chats_Request(properties);
            };

            /**
             * Encodes the specified Get_My_Favourite_Chats_Request message. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Request.$Properties} message Get_My_Favourite_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Favourite_Chats_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.limit);
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.offset);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_My_Favourite_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Request.$Properties} message Get_My_Favourite_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Favourite_Chats_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_My_Favourite_Chats_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape} Get_My_Favourite_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Favourite_Chats_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_My_Favourite_Chats_Request(), value;
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
                            if (wireType !== 0)
                                break;
                            message.limit = reader.uint32();
                            message._limit = "limit";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.offset = reader.uint32();
                            message._offset = "offset";
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
             * Decodes a Get_My_Favourite_Chats_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape} Get_My_Favourite_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Favourite_Chats_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_My_Favourite_Chats_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_My_Favourite_Chats_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit")) {
                    properties._limit = 1;
                    if (!$util.isInteger(message.limit))
                        return "limit: integer expected";
                }
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset")) {
                    properties._offset = 1;
                    if (!$util.isInteger(message.offset))
                        return "offset: integer expected";
                }
                return null;
            };

            /**
             * Creates a Get_My_Favourite_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request} Get_My_Favourite_Chats_Request
             */
            Get_My_Favourite_Chats_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_My_Favourite_Chats_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_My_Favourite_Chats_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_My_Favourite_Chats_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.limit != null)
                    message.limit = object.limit >>> 0;
                if (object.offset != null)
                    message.offset = object.offset >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a Get_My_Favourite_Chats_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Request} message Get_My_Favourite_Chats_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_My_Favourite_Chats_Request.toObject = function (message, options, _depth) {
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
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    object.limit = message.limit;
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    object.offset = message.offset;
                return object;
            };

            /**
             * Converts this Get_My_Favourite_Chats_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_My_Favourite_Chats_Request.prototype.toJSON = function() {
                return Get_My_Favourite_Chats_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_My_Favourite_Chats_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_My_Favourite_Chats_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_My_Favourite_Chats_Request";
            };

            return Get_My_Favourite_Chats_Request;
        })();

        methods.Get_My_Favourite_Chats_Response = (function() {

            /**
             * Properties of a Get_My_Favourite_Chats_Response.
             * @typedef {Object} lingcat.methods.Get_My_Favourite_Chats_Response.$Properties
             * @property {Array.<lingcat.classes.IChat.$Properties>|null} [chats] Get_My_Favourite_Chats_Response chats
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_My_Favourite_Chats_Response.
             * @memberof lingcat.methods
             * @interface IGet_My_Favourite_Chats_Response
             * @augments lingcat.methods.Get_My_Favourite_Chats_Response.$Properties
             * @deprecated Use lingcat.methods.Get_My_Favourite_Chats_Response.$Properties instead.
             */

            /**
             * Shape of a Get_My_Favourite_Chats_Response.
             * @typedef {lingcat.methods.Get_My_Favourite_Chats_Response.$Properties} lingcat.methods.Get_My_Favourite_Chats_Response.$Shape
             */

            /**
             * Constructs a new Get_My_Favourite_Chats_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_My_Favourite_Chats_Response.
             * @constructor
             * @param {lingcat.methods.Get_My_Favourite_Chats_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_My_Favourite_Chats_Response = function (properties) {
                this.chats = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_My_Favourite_Chats_Response chats.
             * @member {Array.<lingcat.classes.IChat.$Properties>} chats
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @instance
             */
            Get_My_Favourite_Chats_Response.prototype.chats = $util.emptyArray;

            /**
             * Creates a new Get_My_Favourite_Chats_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response} Get_My_Favourite_Chats_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_My_Favourite_Chats_Response.$Shape): lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape;
             *   (properties?: lingcat.methods.Get_My_Favourite_Chats_Response.$Properties): lingcat.methods.Get_My_Favourite_Chats_Response;
             * }}
             */
            Get_My_Favourite_Chats_Response.create = function(properties) {
                return new Get_My_Favourite_Chats_Response(properties);
            };

            /**
             * Encodes the specified Get_My_Favourite_Chats_Response message. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Response.$Properties} message Get_My_Favourite_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Favourite_Chats_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chats != null && message.chats.length)
                    for (let i = 0; i < message.chats.length; ++i)
                        $root.lingcat.classes.IChat.encode(message.chats[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_My_Favourite_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Response.$Properties} message Get_My_Favourite_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_My_Favourite_Chats_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_My_Favourite_Chats_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape} Get_My_Favourite_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Favourite_Chats_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_My_Favourite_Chats_Response();
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
                            if (!(message.chats && message.chats.length))
                                message.chats = [];
                            message.chats.push($root.lingcat.classes.IChat.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Get_My_Favourite_Chats_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape} Get_My_Favourite_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_My_Favourite_Chats_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_My_Favourite_Chats_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_My_Favourite_Chats_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chats != null && $Object.hasOwnProperty.call(message, "chats")) {
                    if (!$Array.isArray(message.chats))
                        return "chats: array expected";
                    for (let i = 0; i < message.chats.length; ++i) {
                        let error = $root.lingcat.classes.IChat.verify(message.chats[i], _depth + 1);
                        if (error)
                            return "chats." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Get_My_Favourite_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response} Get_My_Favourite_Chats_Response
             */
            Get_My_Favourite_Chats_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_My_Favourite_Chats_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_My_Favourite_Chats_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_My_Favourite_Chats_Response();
                if (object.chats) {
                    if (!$Array.isArray(object.chats))
                        throw $TypeError(".lingcat.methods.Get_My_Favourite_Chats_Response.chats: array expected");
                    message.chats = $Array(object.chats.length);
                    for (let i = 0; i < object.chats.length; ++i) {
                        if (!$util.isObject(object.chats[i]))
                            throw $TypeError(".lingcat.methods.Get_My_Favourite_Chats_Response.chats: object expected");
                        message.chats[i] = $root.lingcat.classes.IChat.fromObject(object.chats[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Get_My_Favourite_Chats_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {lingcat.methods.Get_My_Favourite_Chats_Response} message Get_My_Favourite_Chats_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_My_Favourite_Chats_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.chats = [];
                if (message.chats && message.chats.length) {
                    object.chats = $Array(message.chats.length);
                    for (let j = 0; j < message.chats.length; ++j)
                        object.chats[j] = $root.lingcat.classes.IChat.toObject(message.chats[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Get_My_Favourite_Chats_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_My_Favourite_Chats_Response.prototype.toJSON = function() {
                return Get_My_Favourite_Chats_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_My_Favourite_Chats_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_My_Favourite_Chats_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_My_Favourite_Chats_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_My_Favourite_Chats_Response";
            };

            return Get_My_Favourite_Chats_Response;
        })();

        methods.Search_My_Chats_Request = (function() {

            /**
             * Properties of a Search_My_Chats_Request.
             * @typedef {Object} lingcat.methods.Search_My_Chats_Request.$Properties
             * @property {string|null} [accessToken] Search_My_Chats_Request accessToken
             * @property {string|null} [keyword] Search_My_Chats_Request keyword
             * @property {number|null} [limit] Search_My_Chats_Request limit
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Search_My_Chats_Request.
             * @memberof lingcat.methods
             * @interface ISearch_My_Chats_Request
             * @augments lingcat.methods.Search_My_Chats_Request.$Properties
             * @deprecated Use lingcat.methods.Search_My_Chats_Request.$Properties instead.
             */

            /**
             * Shape of a Search_My_Chats_Request.
             * @typedef {lingcat.methods.Search_My_Chats_Request.$Properties} lingcat.methods.Search_My_Chats_Request.$Shape
             */

            /**
             * Constructs a new Search_My_Chats_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Search_My_Chats_Request.
             * @constructor
             * @param {lingcat.methods.Search_My_Chats_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Search_My_Chats_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Search_My_Chats_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @instance
             */
            Search_My_Chats_Request.prototype.accessToken = "";

            /**
             * Search_My_Chats_Request keyword.
             * @member {string} keyword
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @instance
             */
            Search_My_Chats_Request.prototype.keyword = "";

            /**
             * Search_My_Chats_Request limit.
             * @member {number|null|undefined} limit
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @instance
             */
            Search_My_Chats_Request.prototype.limit = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Search_My_Chats_Request.prototype, "_limit", {
                get: $util.oneOfGetter($oneOfFields = ["limit"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Search_My_Chats_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {lingcat.methods.Search_My_Chats_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Search_My_Chats_Request} Search_My_Chats_Request instance
             * @type {{
             *   (properties: lingcat.methods.Search_My_Chats_Request.$Shape): lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape;
             *   (properties?: lingcat.methods.Search_My_Chats_Request.$Properties): lingcat.methods.Search_My_Chats_Request;
             * }}
             */
            Search_My_Chats_Request.create = function(properties) {
                return new Search_My_Chats_Request(properties);
            };

            /**
             * Encodes the specified Search_My_Chats_Request message. Does not implicitly {@link lingcat.methods.Search_My_Chats_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {lingcat.methods.Search_My_Chats_Request.$Properties} message Search_My_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Search_My_Chats_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.keyword != null && $Object.hasOwnProperty.call(message, "keyword") && message.keyword !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.keyword);
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.limit);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Search_My_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Search_My_Chats_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {lingcat.methods.Search_My_Chats_Request.$Properties} message Search_My_Chats_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Search_My_Chats_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Search_My_Chats_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape} Search_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Search_My_Chats_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Search_My_Chats_Request(), value;
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
                                message.keyword = value;
                            else
                                delete message.keyword;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            message.limit = reader.uint32();
                            message._limit = "limit";
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
             * Decodes a Search_My_Chats_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape} Search_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Search_My_Chats_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Search_My_Chats_Request message.
             * @function verify
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Search_My_Chats_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.keyword != null && $Object.hasOwnProperty.call(message, "keyword"))
                    if (!$util.isString(message.keyword))
                        return "keyword: string expected";
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit")) {
                    properties._limit = 1;
                    if (!$util.isInteger(message.limit))
                        return "limit: integer expected";
                }
                return null;
            };

            /**
             * Creates a Search_My_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Search_My_Chats_Request} Search_My_Chats_Request
             */
            Search_My_Chats_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Search_My_Chats_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Search_My_Chats_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Search_My_Chats_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.keyword != null)
                    if (typeof object.keyword !== "string" || object.keyword.length)
                        message.keyword = $String(object.keyword);
                if (object.limit != null)
                    message.limit = object.limit >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a Search_My_Chats_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {lingcat.methods.Search_My_Chats_Request} message Search_My_Chats_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Search_My_Chats_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.keyword = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.keyword != null && $Object.hasOwnProperty.call(message, "keyword"))
                    object.keyword = message.keyword;
                if (message.limit != null && $Object.hasOwnProperty.call(message, "limit"))
                    object.limit = message.limit;
                return object;
            };

            /**
             * Converts this Search_My_Chats_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Search_My_Chats_Request.prototype.toJSON = function() {
                return Search_My_Chats_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Search_My_Chats_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Search_My_Chats_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Search_My_Chats_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Search_My_Chats_Request";
            };

            return Search_My_Chats_Request;
        })();

        methods.Search_My_Chats_Response = (function() {

            /**
             * Properties of a Search_My_Chats_Response.
             * @typedef {Object} lingcat.methods.Search_My_Chats_Response.$Properties
             * @property {Array.<lingcat.classes.IChat.$Properties>|null} [chats] Search_My_Chats_Response chats
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Search_My_Chats_Response.
             * @memberof lingcat.methods
             * @interface ISearch_My_Chats_Response
             * @augments lingcat.methods.Search_My_Chats_Response.$Properties
             * @deprecated Use lingcat.methods.Search_My_Chats_Response.$Properties instead.
             */

            /**
             * Shape of a Search_My_Chats_Response.
             * @typedef {lingcat.methods.Search_My_Chats_Response.$Properties} lingcat.methods.Search_My_Chats_Response.$Shape
             */

            /**
             * Constructs a new Search_My_Chats_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Search_My_Chats_Response.
             * @constructor
             * @param {lingcat.methods.Search_My_Chats_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Search_My_Chats_Response = function (properties) {
                this.chats = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Search_My_Chats_Response chats.
             * @member {Array.<lingcat.classes.IChat.$Properties>} chats
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @instance
             */
            Search_My_Chats_Response.prototype.chats = $util.emptyArray;

            /**
             * Creates a new Search_My_Chats_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {lingcat.methods.Search_My_Chats_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Search_My_Chats_Response} Search_My_Chats_Response instance
             * @type {{
             *   (properties: lingcat.methods.Search_My_Chats_Response.$Shape): lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape;
             *   (properties?: lingcat.methods.Search_My_Chats_Response.$Properties): lingcat.methods.Search_My_Chats_Response;
             * }}
             */
            Search_My_Chats_Response.create = function(properties) {
                return new Search_My_Chats_Response(properties);
            };

            /**
             * Encodes the specified Search_My_Chats_Response message. Does not implicitly {@link lingcat.methods.Search_My_Chats_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {lingcat.methods.Search_My_Chats_Response.$Properties} message Search_My_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Search_My_Chats_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chats != null && message.chats.length)
                    for (let i = 0; i < message.chats.length; ++i)
                        $root.lingcat.classes.IChat.encode(message.chats[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Search_My_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Search_My_Chats_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {lingcat.methods.Search_My_Chats_Response.$Properties} message Search_My_Chats_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Search_My_Chats_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Search_My_Chats_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape} Search_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Search_My_Chats_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Search_My_Chats_Response();
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
                            if (!(message.chats && message.chats.length))
                                message.chats = [];
                            message.chats.push($root.lingcat.classes.IChat.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Search_My_Chats_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape} Search_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Search_My_Chats_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Search_My_Chats_Response message.
             * @function verify
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Search_My_Chats_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chats != null && $Object.hasOwnProperty.call(message, "chats")) {
                    if (!$Array.isArray(message.chats))
                        return "chats: array expected";
                    for (let i = 0; i < message.chats.length; ++i) {
                        let error = $root.lingcat.classes.IChat.verify(message.chats[i], _depth + 1);
                        if (error)
                            return "chats." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Search_My_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Search_My_Chats_Response} Search_My_Chats_Response
             */
            Search_My_Chats_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Search_My_Chats_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Search_My_Chats_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Search_My_Chats_Response();
                if (object.chats) {
                    if (!$Array.isArray(object.chats))
                        throw $TypeError(".lingcat.methods.Search_My_Chats_Response.chats: array expected");
                    message.chats = $Array(object.chats.length);
                    for (let i = 0; i < object.chats.length; ++i) {
                        if (!$util.isObject(object.chats[i]))
                            throw $TypeError(".lingcat.methods.Search_My_Chats_Response.chats: object expected");
                        message.chats[i] = $root.lingcat.classes.IChat.fromObject(object.chats[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Search_My_Chats_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {lingcat.methods.Search_My_Chats_Response} message Search_My_Chats_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Search_My_Chats_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.chats = [];
                if (message.chats && message.chats.length) {
                    object.chats = $Array(message.chats.length);
                    for (let j = 0; j < message.chats.length; ++j)
                        object.chats[j] = $root.lingcat.classes.IChat.toObject(message.chats[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Search_My_Chats_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Search_My_Chats_Response.prototype.toJSON = function() {
                return Search_My_Chats_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Search_My_Chats_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Search_My_Chats_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Search_My_Chats_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Search_My_Chats_Response";
            };

            return Search_My_Chats_Response;
        })();

        methods.Get_Another_User_From_Private_Chat_Request = (function() {

            /**
             * Properties of a Get_Another_User_From_Private_Chat_Request.
             * @typedef {Object} lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties
             * @property {string|null} [accessToken] Get_Another_User_From_Private_Chat_Request accessToken
             * @property {string|null} [targetChatId] Get_Another_User_From_Private_Chat_Request targetChatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Another_User_From_Private_Chat_Request.
             * @memberof lingcat.methods
             * @interface IGet_Another_User_From_Private_Chat_Request
             * @augments lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties
             * @deprecated Use lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties instead.
             */

            /**
             * Shape of a Get_Another_User_From_Private_Chat_Request.
             * @typedef {lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties} lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape
             */

            /**
             * Constructs a new Get_Another_User_From_Private_Chat_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Another_User_From_Private_Chat_Request.
             * @constructor
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Another_User_From_Private_Chat_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Another_User_From_Private_Chat_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @instance
             */
            Get_Another_User_From_Private_Chat_Request.prototype.accessToken = "";

            /**
             * Get_Another_User_From_Private_Chat_Request targetChatId.
             * @member {string} targetChatId
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @instance
             */
            Get_Another_User_From_Private_Chat_Request.prototype.targetChatId = "";

            /**
             * Creates a new Get_Another_User_From_Private_Chat_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request} Get_Another_User_From_Private_Chat_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape): lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape;
             *   (properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties): lingcat.methods.Get_Another_User_From_Private_Chat_Request;
             * }}
             */
            Get_Another_User_From_Private_Chat_Request.create = function(properties) {
                return new Get_Another_User_From_Private_Chat_Request(properties);
            };

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Request message. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties} message Get_Another_User_From_Private_Chat_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Another_User_From_Private_Chat_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.targetChatId != null && $Object.hasOwnProperty.call(message, "targetChatId") && message.targetChatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.targetChatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties} message Get_Another_User_From_Private_Chat_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Another_User_From_Private_Chat_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape} Get_Another_User_From_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Another_User_From_Private_Chat_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Another_User_From_Private_Chat_Request(), value;
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
                                message.targetChatId = value;
                            else
                                delete message.targetChatId;
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
             * Decodes a Get_Another_User_From_Private_Chat_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape} Get_Another_User_From_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Another_User_From_Private_Chat_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Another_User_From_Private_Chat_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Another_User_From_Private_Chat_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.targetChatId != null && $Object.hasOwnProperty.call(message, "targetChatId"))
                    if (!$util.isString(message.targetChatId))
                        return "targetChatId: string expected";
                return null;
            };

            /**
             * Creates a Get_Another_User_From_Private_Chat_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request} Get_Another_User_From_Private_Chat_Request
             */
            Get_Another_User_From_Private_Chat_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Another_User_From_Private_Chat_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Another_User_From_Private_Chat_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Another_User_From_Private_Chat_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.targetChatId != null)
                    if (typeof object.targetChatId !== "string" || object.targetChatId.length)
                        message.targetChatId = $String(object.targetChatId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Another_User_From_Private_Chat_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Request} message Get_Another_User_From_Private_Chat_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Another_User_From_Private_Chat_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.targetChatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.targetChatId != null && $Object.hasOwnProperty.call(message, "targetChatId"))
                    object.targetChatId = message.targetChatId;
                return object;
            };

            /**
             * Converts this Get_Another_User_From_Private_Chat_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Another_User_From_Private_Chat_Request.prototype.toJSON = function() {
                return Get_Another_User_From_Private_Chat_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Another_User_From_Private_Chat_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Another_User_From_Private_Chat_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Another_User_From_Private_Chat_Request";
            };

            return Get_Another_User_From_Private_Chat_Request;
        })();

        methods.Get_Another_User_From_Private_Chat_Response = (function() {

            /**
             * Properties of a Get_Another_User_From_Private_Chat_Response.
             * @typedef {Object} lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties
             * @property {string|null} [userId] Get_Another_User_From_Private_Chat_Response userId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Another_User_From_Private_Chat_Response.
             * @memberof lingcat.methods
             * @interface IGet_Another_User_From_Private_Chat_Response
             * @augments lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties
             * @deprecated Use lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties instead.
             */

            /**
             * Shape of a Get_Another_User_From_Private_Chat_Response.
             * @typedef {lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties} lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape
             */

            /**
             * Constructs a new Get_Another_User_From_Private_Chat_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Another_User_From_Private_Chat_Response.
             * @constructor
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Another_User_From_Private_Chat_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Another_User_From_Private_Chat_Response userId.
             * @member {string} userId
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @instance
             */
            Get_Another_User_From_Private_Chat_Response.prototype.userId = "";

            /**
             * Creates a new Get_Another_User_From_Private_Chat_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response} Get_Another_User_From_Private_Chat_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape): lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape;
             *   (properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties): lingcat.methods.Get_Another_User_From_Private_Chat_Response;
             * }}
             */
            Get_Another_User_From_Private_Chat_Response.create = function(properties) {
                return new Get_Another_User_From_Private_Chat_Response(properties);
            };

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Response message. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties} message Get_Another_User_From_Private_Chat_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Another_User_From_Private_Chat_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId") && message.userId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties} message Get_Another_User_From_Private_Chat_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Another_User_From_Private_Chat_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape} Get_Another_User_From_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Another_User_From_Private_Chat_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Another_User_From_Private_Chat_Response(), value;
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
             * Decodes a Get_Another_User_From_Private_Chat_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape} Get_Another_User_From_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Another_User_From_Private_Chat_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Another_User_From_Private_Chat_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Another_User_From_Private_Chat_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    if (!$util.isString(message.userId))
                        return "userId: string expected";
                return null;
            };

            /**
             * Creates a Get_Another_User_From_Private_Chat_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response} Get_Another_User_From_Private_Chat_Response
             */
            Get_Another_User_From_Private_Chat_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Another_User_From_Private_Chat_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Another_User_From_Private_Chat_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Another_User_From_Private_Chat_Response();
                if (object.userId != null)
                    if (typeof object.userId !== "string" || object.userId.length)
                        message.userId = $String(object.userId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Another_User_From_Private_Chat_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {lingcat.methods.Get_Another_User_From_Private_Chat_Response} message Get_Another_User_From_Private_Chat_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Another_User_From_Private_Chat_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.userId = "";
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    object.userId = message.userId;
                return object;
            };

            /**
             * Converts this Get_Another_User_From_Private_Chat_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Another_User_From_Private_Chat_Response.prototype.toJSON = function() {
                return Get_Another_User_From_Private_Chat_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Another_User_From_Private_Chat_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Another_User_From_Private_Chat_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Another_User_From_Private_Chat_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Another_User_From_Private_Chat_Response";
            };

            return Get_Another_User_From_Private_Chat_Response;
        })();

        methods.Set_Chat_Favourited_Request = (function() {

            /**
             * Properties of a Set_Chat_Favourited_Request.
             * @typedef {Object} lingcat.methods.Set_Chat_Favourited_Request.$Properties
             * @property {string|null} [accessToken] Set_Chat_Favourited_Request accessToken
             * @property {string|null} [chatId] Set_Chat_Favourited_Request chatId
             * @property {boolean|null} [favourited] Set_Chat_Favourited_Request favourited
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Set_Chat_Favourited_Request.
             * @memberof lingcat.methods
             * @interface ISet_Chat_Favourited_Request
             * @augments lingcat.methods.Set_Chat_Favourited_Request.$Properties
             * @deprecated Use lingcat.methods.Set_Chat_Favourited_Request.$Properties instead.
             */

            /**
             * Shape of a Set_Chat_Favourited_Request.
             * @typedef {lingcat.methods.Set_Chat_Favourited_Request.$Properties} lingcat.methods.Set_Chat_Favourited_Request.$Shape
             */

            /**
             * Constructs a new Set_Chat_Favourited_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Set_Chat_Favourited_Request.
             * @constructor
             * @param {lingcat.methods.Set_Chat_Favourited_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Set_Chat_Favourited_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Set_Chat_Favourited_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @instance
             */
            Set_Chat_Favourited_Request.prototype.accessToken = "";

            /**
             * Set_Chat_Favourited_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @instance
             */
            Set_Chat_Favourited_Request.prototype.chatId = "";

            /**
             * Set_Chat_Favourited_Request favourited.
             * @member {boolean} favourited
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @instance
             */
            Set_Chat_Favourited_Request.prototype.favourited = false;

            /**
             * Creates a new Set_Chat_Favourited_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Set_Chat_Favourited_Request} Set_Chat_Favourited_Request instance
             * @type {{
             *   (properties: lingcat.methods.Set_Chat_Favourited_Request.$Shape): lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape;
             *   (properties?: lingcat.methods.Set_Chat_Favourited_Request.$Properties): lingcat.methods.Set_Chat_Favourited_Request;
             * }}
             */
            Set_Chat_Favourited_Request.create = function(properties) {
                return new Set_Chat_Favourited_Request(properties);
            };

            /**
             * Encodes the specified Set_Chat_Favourited_Request message. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Request.$Properties} message Set_Chat_Favourited_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Set_Chat_Favourited_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.favourited != null && $Object.hasOwnProperty.call(message, "favourited") && message.favourited !== false)
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.favourited);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Set_Chat_Favourited_Request message, length delimited. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Request.$Properties} message Set_Chat_Favourited_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Set_Chat_Favourited_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Set_Chat_Favourited_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape} Set_Chat_Favourited_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Set_Chat_Favourited_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Set_Chat_Favourited_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.favourited = value;
                            else
                                delete message.favourited;
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
             * Decodes a Set_Chat_Favourited_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape} Set_Chat_Favourited_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Set_Chat_Favourited_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Set_Chat_Favourited_Request message.
             * @function verify
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Set_Chat_Favourited_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.favourited != null && $Object.hasOwnProperty.call(message, "favourited"))
                    if (typeof message.favourited !== "boolean")
                        return "favourited: boolean expected";
                return null;
            };

            /**
             * Creates a Set_Chat_Favourited_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Set_Chat_Favourited_Request} Set_Chat_Favourited_Request
             */
            Set_Chat_Favourited_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Set_Chat_Favourited_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Set_Chat_Favourited_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Set_Chat_Favourited_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.favourited != null)
                    if (object.favourited)
                        message.favourited = $Boolean(object.favourited);
                return message;
            };

            /**
             * Creates a plain object from a Set_Chat_Favourited_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Request} message Set_Chat_Favourited_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Set_Chat_Favourited_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                    object.favourited = false;
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.favourited != null && $Object.hasOwnProperty.call(message, "favourited"))
                    object.favourited = message.favourited;
                return object;
            };

            /**
             * Converts this Set_Chat_Favourited_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Set_Chat_Favourited_Request.prototype.toJSON = function() {
                return Set_Chat_Favourited_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Set_Chat_Favourited_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Set_Chat_Favourited_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Set_Chat_Favourited_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Set_Chat_Favourited_Request";
            };

            return Set_Chat_Favourited_Request;
        })();

        methods.Set_Chat_Favourited_Response = (function() {

            /**
             * Properties of a Set_Chat_Favourited_Response.
             * @typedef {Object} lingcat.methods.Set_Chat_Favourited_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Set_Chat_Favourited_Response.
             * @memberof lingcat.methods
             * @interface ISet_Chat_Favourited_Response
             * @augments lingcat.methods.Set_Chat_Favourited_Response.$Properties
             * @deprecated Use lingcat.methods.Set_Chat_Favourited_Response.$Properties instead.
             */

            /**
             * Shape of a Set_Chat_Favourited_Response.
             * @typedef {lingcat.methods.Set_Chat_Favourited_Response.$Properties} lingcat.methods.Set_Chat_Favourited_Response.$Shape
             */

            /**
             * Constructs a new Set_Chat_Favourited_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Set_Chat_Favourited_Response.
             * @constructor
             * @param {lingcat.methods.Set_Chat_Favourited_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Set_Chat_Favourited_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Set_Chat_Favourited_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Set_Chat_Favourited_Response} Set_Chat_Favourited_Response instance
             * @type {{
             *   (properties: lingcat.methods.Set_Chat_Favourited_Response.$Shape): lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape;
             *   (properties?: lingcat.methods.Set_Chat_Favourited_Response.$Properties): lingcat.methods.Set_Chat_Favourited_Response;
             * }}
             */
            Set_Chat_Favourited_Response.create = function(properties) {
                return new Set_Chat_Favourited_Response(properties);
            };

            /**
             * Encodes the specified Set_Chat_Favourited_Response message. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Response.$Properties} message Set_Chat_Favourited_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Set_Chat_Favourited_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Set_Chat_Favourited_Response message, length delimited. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Response.$Properties} message Set_Chat_Favourited_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Set_Chat_Favourited_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Set_Chat_Favourited_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape} Set_Chat_Favourited_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Set_Chat_Favourited_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Set_Chat_Favourited_Response();
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
             * Decodes a Set_Chat_Favourited_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape} Set_Chat_Favourited_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Set_Chat_Favourited_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Set_Chat_Favourited_Response message.
             * @function verify
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Set_Chat_Favourited_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates a Set_Chat_Favourited_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Set_Chat_Favourited_Response} Set_Chat_Favourited_Response
             */
            Set_Chat_Favourited_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Set_Chat_Favourited_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Set_Chat_Favourited_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Set_Chat_Favourited_Response();
            };

            /**
             * Creates a plain object from a Set_Chat_Favourited_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {lingcat.methods.Set_Chat_Favourited_Response} message Set_Chat_Favourited_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Set_Chat_Favourited_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Set_Chat_Favourited_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Set_Chat_Favourited_Response.prototype.toJSON = function() {
                return Set_Chat_Favourited_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Set_Chat_Favourited_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Set_Chat_Favourited_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Set_Chat_Favourited_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Set_Chat_Favourited_Response";
            };

            return Set_Chat_Favourited_Response;
        })();

        methods.Get_User_Id_By_Username_Request = (function() {

            /**
             * Properties of a Get_User_Id_By_Username_Request.
             * @typedef {Object} lingcat.methods.Get_User_Id_By_Username_Request.$Properties
             * @property {string|null} [accessToken] Get_User_Id_By_Username_Request accessToken
             * @property {string|null} [username] Get_User_Id_By_Username_Request username
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_User_Id_By_Username_Request.
             * @memberof lingcat.methods
             * @interface IGet_User_Id_By_Username_Request
             * @augments lingcat.methods.Get_User_Id_By_Username_Request.$Properties
             * @deprecated Use lingcat.methods.Get_User_Id_By_Username_Request.$Properties instead.
             */

            /**
             * Shape of a Get_User_Id_By_Username_Request.
             * @typedef {lingcat.methods.Get_User_Id_By_Username_Request.$Properties} lingcat.methods.Get_User_Id_By_Username_Request.$Shape
             */

            /**
             * Constructs a new Get_User_Id_By_Username_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_User_Id_By_Username_Request.
             * @constructor
             * @param {lingcat.methods.Get_User_Id_By_Username_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_User_Id_By_Username_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_User_Id_By_Username_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @instance
             */
            Get_User_Id_By_Username_Request.prototype.accessToken = "";

            /**
             * Get_User_Id_By_Username_Request username.
             * @member {string} username
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @instance
             */
            Get_User_Id_By_Username_Request.prototype.username = "";

            /**
             * Creates a new Get_User_Id_By_Username_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request} Get_User_Id_By_Username_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_User_Id_By_Username_Request.$Shape): lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape;
             *   (properties?: lingcat.methods.Get_User_Id_By_Username_Request.$Properties): lingcat.methods.Get_User_Id_By_Username_Request;
             * }}
             */
            Get_User_Id_By_Username_Request.create = function(properties) {
                return new Get_User_Id_By_Username_Request(properties);
            };

            /**
             * Encodes the specified Get_User_Id_By_Username_Request message. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Request.$Properties} message Get_User_Id_By_Username_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_User_Id_By_Username_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.username != null && $Object.hasOwnProperty.call(message, "username") && message.username !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_User_Id_By_Username_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Request.$Properties} message Get_User_Id_By_Username_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_User_Id_By_Username_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_User_Id_By_Username_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape} Get_User_Id_By_Username_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_User_Id_By_Username_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_User_Id_By_Username_Request(), value;
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
                                message.username = value;
                            else
                                delete message.username;
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
             * Decodes a Get_User_Id_By_Username_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape} Get_User_Id_By_Username_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_User_Id_By_Username_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_User_Id_By_Username_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_User_Id_By_Username_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    if (!$util.isString(message.username))
                        return "username: string expected";
                return null;
            };

            /**
             * Creates a Get_User_Id_By_Username_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request} Get_User_Id_By_Username_Request
             */
            Get_User_Id_By_Username_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_User_Id_By_Username_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_User_Id_By_Username_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_User_Id_By_Username_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.username != null)
                    if (typeof object.username !== "string" || object.username.length)
                        message.username = $String(object.username);
                return message;
            };

            /**
             * Creates a plain object from a Get_User_Id_By_Username_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Request} message Get_User_Id_By_Username_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_User_Id_By_Username_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.username = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.username != null && $Object.hasOwnProperty.call(message, "username"))
                    object.username = message.username;
                return object;
            };

            /**
             * Converts this Get_User_Id_By_Username_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_User_Id_By_Username_Request.prototype.toJSON = function() {
                return Get_User_Id_By_Username_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_User_Id_By_Username_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_User_Id_By_Username_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_User_Id_By_Username_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_User_Id_By_Username_Request";
            };

            return Get_User_Id_By_Username_Request;
        })();

        methods.Get_User_Id_By_Username_Response = (function() {

            /**
             * Properties of a Get_User_Id_By_Username_Response.
             * @typedef {Object} lingcat.methods.Get_User_Id_By_Username_Response.$Properties
             * @property {string|null} [userId] Get_User_Id_By_Username_Response userId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_User_Id_By_Username_Response.
             * @memberof lingcat.methods
             * @interface IGet_User_Id_By_Username_Response
             * @augments lingcat.methods.Get_User_Id_By_Username_Response.$Properties
             * @deprecated Use lingcat.methods.Get_User_Id_By_Username_Response.$Properties instead.
             */

            /**
             * Shape of a Get_User_Id_By_Username_Response.
             * @typedef {lingcat.methods.Get_User_Id_By_Username_Response.$Properties} lingcat.methods.Get_User_Id_By_Username_Response.$Shape
             */

            /**
             * Constructs a new Get_User_Id_By_Username_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_User_Id_By_Username_Response.
             * @constructor
             * @param {lingcat.methods.Get_User_Id_By_Username_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_User_Id_By_Username_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_User_Id_By_Username_Response userId.
             * @member {string} userId
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @instance
             */
            Get_User_Id_By_Username_Response.prototype.userId = "";

            /**
             * Creates a new Get_User_Id_By_Username_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response} Get_User_Id_By_Username_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_User_Id_By_Username_Response.$Shape): lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape;
             *   (properties?: lingcat.methods.Get_User_Id_By_Username_Response.$Properties): lingcat.methods.Get_User_Id_By_Username_Response;
             * }}
             */
            Get_User_Id_By_Username_Response.create = function(properties) {
                return new Get_User_Id_By_Username_Response(properties);
            };

            /**
             * Encodes the specified Get_User_Id_By_Username_Response message. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Response.$Properties} message Get_User_Id_By_Username_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_User_Id_By_Username_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId") && message.userId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_User_Id_By_Username_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Response.$Properties} message Get_User_Id_By_Username_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_User_Id_By_Username_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_User_Id_By_Username_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape} Get_User_Id_By_Username_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_User_Id_By_Username_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_User_Id_By_Username_Response(), value;
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
             * Decodes a Get_User_Id_By_Username_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape} Get_User_Id_By_Username_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_User_Id_By_Username_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_User_Id_By_Username_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_User_Id_By_Username_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    if (!$util.isString(message.userId))
                        return "userId: string expected";
                return null;
            };

            /**
             * Creates a Get_User_Id_By_Username_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response} Get_User_Id_By_Username_Response
             */
            Get_User_Id_By_Username_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_User_Id_By_Username_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_User_Id_By_Username_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_User_Id_By_Username_Response();
                if (object.userId != null)
                    if (typeof object.userId !== "string" || object.userId.length)
                        message.userId = $String(object.userId);
                return message;
            };

            /**
             * Creates a plain object from a Get_User_Id_By_Username_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {lingcat.methods.Get_User_Id_By_Username_Response} message Get_User_Id_By_Username_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_User_Id_By_Username_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.userId = "";
                if (message.userId != null && $Object.hasOwnProperty.call(message, "userId"))
                    object.userId = message.userId;
                return object;
            };

            /**
             * Converts this Get_User_Id_By_Username_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_User_Id_By_Username_Response.prototype.toJSON = function() {
                return Get_User_Id_By_Username_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_User_Id_By_Username_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_User_Id_By_Username_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_User_Id_By_Username_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_User_Id_By_Username_Response";
            };

            return Get_User_Id_By_Username_Response;
        })();

        methods.Resolve_Chat_Identifier_Request = (function() {

            /**
             * Properties of a Resolve_Chat_Identifier_Request.
             * @typedef {Object} lingcat.methods.Resolve_Chat_Identifier_Request.$Properties
             * @property {string|null} [accessToken] Resolve_Chat_Identifier_Request accessToken
             * @property {string|null} [identifier] Resolve_Chat_Identifier_Request identifier
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Resolve_Chat_Identifier_Request.
             * @memberof lingcat.methods
             * @interface IResolve_Chat_Identifier_Request
             * @augments lingcat.methods.Resolve_Chat_Identifier_Request.$Properties
             * @deprecated Use lingcat.methods.Resolve_Chat_Identifier_Request.$Properties instead.
             */

            /**
             * Shape of a Resolve_Chat_Identifier_Request.
             * @typedef {lingcat.methods.Resolve_Chat_Identifier_Request.$Properties} lingcat.methods.Resolve_Chat_Identifier_Request.$Shape
             */

            /**
             * Constructs a new Resolve_Chat_Identifier_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Resolve_Chat_Identifier_Request.
             * @constructor
             * @param {lingcat.methods.Resolve_Chat_Identifier_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Resolve_Chat_Identifier_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Resolve_Chat_Identifier_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @instance
             */
            Resolve_Chat_Identifier_Request.prototype.accessToken = "";

            /**
             * Resolve_Chat_Identifier_Request identifier.
             * @member {string} identifier
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @instance
             */
            Resolve_Chat_Identifier_Request.prototype.identifier = "";

            /**
             * Creates a new Resolve_Chat_Identifier_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request} Resolve_Chat_Identifier_Request instance
             * @type {{
             *   (properties: lingcat.methods.Resolve_Chat_Identifier_Request.$Shape): lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape;
             *   (properties?: lingcat.methods.Resolve_Chat_Identifier_Request.$Properties): lingcat.methods.Resolve_Chat_Identifier_Request;
             * }}
             */
            Resolve_Chat_Identifier_Request.create = function(properties) {
                return new Resolve_Chat_Identifier_Request(properties);
            };

            /**
             * Encodes the specified Resolve_Chat_Identifier_Request message. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Request.$Properties} message Resolve_Chat_Identifier_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Resolve_Chat_Identifier_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.identifier != null && $Object.hasOwnProperty.call(message, "identifier") && message.identifier !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.identifier);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Resolve_Chat_Identifier_Request message, length delimited. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Request.$Properties} message Resolve_Chat_Identifier_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Resolve_Chat_Identifier_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Resolve_Chat_Identifier_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape} Resolve_Chat_Identifier_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Resolve_Chat_Identifier_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Resolve_Chat_Identifier_Request(), value;
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
                                message.identifier = value;
                            else
                                delete message.identifier;
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
             * Decodes a Resolve_Chat_Identifier_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape} Resolve_Chat_Identifier_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Resolve_Chat_Identifier_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Resolve_Chat_Identifier_Request message.
             * @function verify
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Resolve_Chat_Identifier_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.identifier != null && $Object.hasOwnProperty.call(message, "identifier"))
                    if (!$util.isString(message.identifier))
                        return "identifier: string expected";
                return null;
            };

            /**
             * Creates a Resolve_Chat_Identifier_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request} Resolve_Chat_Identifier_Request
             */
            Resolve_Chat_Identifier_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Resolve_Chat_Identifier_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Resolve_Chat_Identifier_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Resolve_Chat_Identifier_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.identifier != null)
                    if (typeof object.identifier !== "string" || object.identifier.length)
                        message.identifier = $String(object.identifier);
                return message;
            };

            /**
             * Creates a plain object from a Resolve_Chat_Identifier_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Request} message Resolve_Chat_Identifier_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Resolve_Chat_Identifier_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.identifier = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.identifier != null && $Object.hasOwnProperty.call(message, "identifier"))
                    object.identifier = message.identifier;
                return object;
            };

            /**
             * Converts this Resolve_Chat_Identifier_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Resolve_Chat_Identifier_Request.prototype.toJSON = function() {
                return Resolve_Chat_Identifier_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Resolve_Chat_Identifier_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Resolve_Chat_Identifier_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Resolve_Chat_Identifier_Request";
            };

            return Resolve_Chat_Identifier_Request;
        })();

        methods.Resolve_Chat_Identifier_Response = (function() {

            /**
             * Properties of a Resolve_Chat_Identifier_Response.
             * @typedef {Object} lingcat.methods.Resolve_Chat_Identifier_Response.$Properties
             * @property {string|null} [chatId] Resolve_Chat_Identifier_Response chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Resolve_Chat_Identifier_Response.
             * @memberof lingcat.methods
             * @interface IResolve_Chat_Identifier_Response
             * @augments lingcat.methods.Resolve_Chat_Identifier_Response.$Properties
             * @deprecated Use lingcat.methods.Resolve_Chat_Identifier_Response.$Properties instead.
             */

            /**
             * Shape of a Resolve_Chat_Identifier_Response.
             * @typedef {lingcat.methods.Resolve_Chat_Identifier_Response.$Properties} lingcat.methods.Resolve_Chat_Identifier_Response.$Shape
             */

            /**
             * Constructs a new Resolve_Chat_Identifier_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Resolve_Chat_Identifier_Response.
             * @constructor
             * @param {lingcat.methods.Resolve_Chat_Identifier_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Resolve_Chat_Identifier_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Resolve_Chat_Identifier_Response chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @instance
             */
            Resolve_Chat_Identifier_Response.prototype.chatId = "";

            /**
             * Creates a new Resolve_Chat_Identifier_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response} Resolve_Chat_Identifier_Response instance
             * @type {{
             *   (properties: lingcat.methods.Resolve_Chat_Identifier_Response.$Shape): lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape;
             *   (properties?: lingcat.methods.Resolve_Chat_Identifier_Response.$Properties): lingcat.methods.Resolve_Chat_Identifier_Response;
             * }}
             */
            Resolve_Chat_Identifier_Response.create = function(properties) {
                return new Resolve_Chat_Identifier_Response(properties);
            };

            /**
             * Encodes the specified Resolve_Chat_Identifier_Response message. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Response.$Properties} message Resolve_Chat_Identifier_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Resolve_Chat_Identifier_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Resolve_Chat_Identifier_Response message, length delimited. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Response.$Properties} message Resolve_Chat_Identifier_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Resolve_Chat_Identifier_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Resolve_Chat_Identifier_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape} Resolve_Chat_Identifier_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Resolve_Chat_Identifier_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Resolve_Chat_Identifier_Response(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Resolve_Chat_Identifier_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape} Resolve_Chat_Identifier_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Resolve_Chat_Identifier_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Resolve_Chat_Identifier_Response message.
             * @function verify
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Resolve_Chat_Identifier_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Resolve_Chat_Identifier_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response} Resolve_Chat_Identifier_Response
             */
            Resolve_Chat_Identifier_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Resolve_Chat_Identifier_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Resolve_Chat_Identifier_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Resolve_Chat_Identifier_Response();
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Resolve_Chat_Identifier_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {lingcat.methods.Resolve_Chat_Identifier_Response} message Resolve_Chat_Identifier_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Resolve_Chat_Identifier_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.chatId = "";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Resolve_Chat_Identifier_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Resolve_Chat_Identifier_Response.prototype.toJSON = function() {
                return Resolve_Chat_Identifier_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Resolve_Chat_Identifier_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Resolve_Chat_Identifier_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Resolve_Chat_Identifier_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Resolve_Chat_Identifier_Response";
            };

            return Resolve_Chat_Identifier_Response;
        })();

        methods.Update_My_Chats_Event = (function() {

            /**
             * Properties of an Update_My_Chats_Event.
             * @typedef {Object} lingcat.methods.Update_My_Chats_Event.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_My_Chats_Event.
             * @memberof lingcat.methods
             * @interface IUpdate_My_Chats_Event
             * @augments lingcat.methods.Update_My_Chats_Event.$Properties
             * @deprecated Use lingcat.methods.Update_My_Chats_Event.$Properties instead.
             */

            /**
             * Shape of an Update_My_Chats_Event.
             * @typedef {lingcat.methods.Update_My_Chats_Event.$Properties} lingcat.methods.Update_My_Chats_Event.$Shape
             */

            /**
             * Constructs a new Update_My_Chats_Event.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_My_Chats_Event.
             * @constructor
             * @param {lingcat.methods.Update_My_Chats_Event.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_My_Chats_Event = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Update_My_Chats_Event instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {lingcat.methods.Update_My_Chats_Event.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_My_Chats_Event} Update_My_Chats_Event instance
             * @type {{
             *   (properties: lingcat.methods.Update_My_Chats_Event.$Shape): lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape;
             *   (properties?: lingcat.methods.Update_My_Chats_Event.$Properties): lingcat.methods.Update_My_Chats_Event;
             * }}
             */
            Update_My_Chats_Event.create = function(properties) {
                return new Update_My_Chats_Event(properties);
            };

            /**
             * Encodes the specified Update_My_Chats_Event message. Does not implicitly {@link lingcat.methods.Update_My_Chats_Event.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {lingcat.methods.Update_My_Chats_Event.$Properties} message Update_My_Chats_Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Chats_Event.encode = function (message, writer, _depth) {
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
             * Encodes the specified Update_My_Chats_Event message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Chats_Event.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {lingcat.methods.Update_My_Chats_Event.$Properties} message Update_My_Chats_Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_My_Chats_Event.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_My_Chats_Event message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape} Update_My_Chats_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Chats_Event.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_My_Chats_Event();
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
             * Decodes an Update_My_Chats_Event message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape} Update_My_Chats_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_My_Chats_Event.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_My_Chats_Event message.
             * @function verify
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_My_Chats_Event.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates an Update_My_Chats_Event message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_My_Chats_Event} Update_My_Chats_Event
             */
            Update_My_Chats_Event.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_My_Chats_Event)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_My_Chats_Event: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Update_My_Chats_Event();
            };

            /**
             * Creates a plain object from an Update_My_Chats_Event message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {lingcat.methods.Update_My_Chats_Event} message Update_My_Chats_Event
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_My_Chats_Event.toObject = function () {
                return {};
            };

            /**
             * Converts this Update_My_Chats_Event to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_My_Chats_Event.prototype.toJSON = function() {
                return Update_My_Chats_Event.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_My_Chats_Event
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_My_Chats_Event
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_My_Chats_Event.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_My_Chats_Event";
            };

            return Update_My_Chats_Event;
        })();

        methods.Create_Group_Request = (function() {

            /**
             * Properties of a Create_Group_Request.
             * @typedef {Object} lingcat.methods.Create_Group_Request.$Properties
             * @property {string|null} [accessToken] Create_Group_Request accessToken
             * @property {string|null} [title] Create_Group_Request title
             * @property {string|null} [unique] Create_Group_Request unique
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Create_Group_Request.
             * @memberof lingcat.methods
             * @interface ICreate_Group_Request
             * @augments lingcat.methods.Create_Group_Request.$Properties
             * @deprecated Use lingcat.methods.Create_Group_Request.$Properties instead.
             */

            /**
             * Shape of a Create_Group_Request.
             * @typedef {lingcat.methods.Create_Group_Request.$Properties} lingcat.methods.Create_Group_Request.$Shape
             */

            /**
             * Constructs a new Create_Group_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Create_Group_Request.
             * @constructor
             * @param {lingcat.methods.Create_Group_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Create_Group_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Create_Group_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Create_Group_Request
             * @instance
             */
            Create_Group_Request.prototype.accessToken = "";

            /**
             * Create_Group_Request title.
             * @member {string} title
             * @memberof lingcat.methods.Create_Group_Request
             * @instance
             */
            Create_Group_Request.prototype.title = "";

            /**
             * Create_Group_Request unique.
             * @member {string|null|undefined} unique
             * @memberof lingcat.methods.Create_Group_Request
             * @instance
             */
            Create_Group_Request.prototype.unique = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Create_Group_Request.prototype, "_unique", {
                get: $util.oneOfGetter($oneOfFields = ["unique"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Create_Group_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {lingcat.methods.Create_Group_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Create_Group_Request} Create_Group_Request instance
             * @type {{
             *   (properties: lingcat.methods.Create_Group_Request.$Shape): lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape;
             *   (properties?: lingcat.methods.Create_Group_Request.$Properties): lingcat.methods.Create_Group_Request;
             * }}
             */
            Create_Group_Request.create = function(properties) {
                return new Create_Group_Request(properties);
            };

            /**
             * Encodes the specified Create_Group_Request message. Does not implicitly {@link lingcat.methods.Create_Group_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {lingcat.methods.Create_Group_Request.$Properties} message Create_Group_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Create_Group_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.title != null && $Object.hasOwnProperty.call(message, "title") && message.title !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.unique != null && $Object.hasOwnProperty.call(message, "unique"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.unique);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Create_Group_Request message, length delimited. Does not implicitly {@link lingcat.methods.Create_Group_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {lingcat.methods.Create_Group_Request.$Properties} message Create_Group_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Create_Group_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Create_Group_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape} Create_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Create_Group_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Create_Group_Request(), value;
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
                                message.title = value;
                            else
                                delete message.title;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.unique = reader.stringVerify();
                            message._unique = "unique";
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
             * Decodes a Create_Group_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape} Create_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Create_Group_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Create_Group_Request message.
             * @function verify
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Create_Group_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.unique != null && $Object.hasOwnProperty.call(message, "unique")) {
                    properties._unique = 1;
                    if (!$util.isString(message.unique))
                        return "unique: string expected";
                }
                return null;
            };

            /**
             * Creates a Create_Group_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Create_Group_Request} Create_Group_Request
             */
            Create_Group_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Create_Group_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Create_Group_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Create_Group_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.title != null)
                    if (typeof object.title !== "string" || object.title.length)
                        message.title = $String(object.title);
                if (object.unique != null)
                    message.unique = $String(object.unique);
                return message;
            };

            /**
             * Creates a plain object from a Create_Group_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {lingcat.methods.Create_Group_Request} message Create_Group_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Create_Group_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.title = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.title != null && $Object.hasOwnProperty.call(message, "title"))
                    object.title = message.title;
                if (message.unique != null && $Object.hasOwnProperty.call(message, "unique"))
                    object.unique = message.unique;
                return object;
            };

            /**
             * Converts this Create_Group_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Create_Group_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Create_Group_Request.prototype.toJSON = function() {
                return Create_Group_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Create_Group_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Create_Group_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Create_Group_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Create_Group_Request";
            };

            return Create_Group_Request;
        })();

        methods.Create_Group_Response = (function() {

            /**
             * Properties of a Create_Group_Response.
             * @typedef {Object} lingcat.methods.Create_Group_Response.$Properties
             * @property {string|null} [chatId] Create_Group_Response chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Create_Group_Response.
             * @memberof lingcat.methods
             * @interface ICreate_Group_Response
             * @augments lingcat.methods.Create_Group_Response.$Properties
             * @deprecated Use lingcat.methods.Create_Group_Response.$Properties instead.
             */

            /**
             * Shape of a Create_Group_Response.
             * @typedef {lingcat.methods.Create_Group_Response.$Properties} lingcat.methods.Create_Group_Response.$Shape
             */

            /**
             * Constructs a new Create_Group_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Create_Group_Response.
             * @constructor
             * @param {lingcat.methods.Create_Group_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Create_Group_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Create_Group_Response chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Create_Group_Response
             * @instance
             */
            Create_Group_Response.prototype.chatId = "";

            /**
             * Creates a new Create_Group_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {lingcat.methods.Create_Group_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Create_Group_Response} Create_Group_Response instance
             * @type {{
             *   (properties: lingcat.methods.Create_Group_Response.$Shape): lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape;
             *   (properties?: lingcat.methods.Create_Group_Response.$Properties): lingcat.methods.Create_Group_Response;
             * }}
             */
            Create_Group_Response.create = function(properties) {
                return new Create_Group_Response(properties);
            };

            /**
             * Encodes the specified Create_Group_Response message. Does not implicitly {@link lingcat.methods.Create_Group_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {lingcat.methods.Create_Group_Response.$Properties} message Create_Group_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Create_Group_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Create_Group_Response message, length delimited. Does not implicitly {@link lingcat.methods.Create_Group_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {lingcat.methods.Create_Group_Response.$Properties} message Create_Group_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Create_Group_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Create_Group_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape} Create_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Create_Group_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Create_Group_Response(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Create_Group_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape} Create_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Create_Group_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Create_Group_Response message.
             * @function verify
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Create_Group_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Create_Group_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Create_Group_Response} Create_Group_Response
             */
            Create_Group_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Create_Group_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Create_Group_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Create_Group_Response();
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Create_Group_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {lingcat.methods.Create_Group_Response} message Create_Group_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Create_Group_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults)
                    object.chatId = "";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Create_Group_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Create_Group_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Create_Group_Response.prototype.toJSON = function() {
                return Create_Group_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Create_Group_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Create_Group_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Create_Group_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Create_Group_Response";
            };

            return Create_Group_Response;
        })();

        methods.Join_Group_Request = (function() {

            /**
             * Properties of a Join_Group_Request.
             * @typedef {Object} lingcat.methods.Join_Group_Request.$Properties
             * @property {string|null} [accessToken] Join_Group_Request accessToken
             * @property {string|null} [chatId] Join_Group_Request chatId
             * @property {string|null} [answer] Join_Group_Request answer
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Join_Group_Request.
             * @memberof lingcat.methods
             * @interface IJoin_Group_Request
             * @augments lingcat.methods.Join_Group_Request.$Properties
             * @deprecated Use lingcat.methods.Join_Group_Request.$Properties instead.
             */

            /**
             * Shape of a Join_Group_Request.
             * @typedef {lingcat.methods.Join_Group_Request.$Properties} lingcat.methods.Join_Group_Request.$Shape
             */

            /**
             * Constructs a new Join_Group_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Join_Group_Request.
             * @constructor
             * @param {lingcat.methods.Join_Group_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Join_Group_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Join_Group_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Join_Group_Request
             * @instance
             */
            Join_Group_Request.prototype.accessToken = "";

            /**
             * Join_Group_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Join_Group_Request
             * @instance
             */
            Join_Group_Request.prototype.chatId = "";

            /**
             * Join_Group_Request answer.
             * @member {string|null|undefined} answer
             * @memberof lingcat.methods.Join_Group_Request
             * @instance
             */
            Join_Group_Request.prototype.answer = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            // Virtual OneOf for proto3 optional field
            $Object.defineProperty(Join_Group_Request.prototype, "_answer", {
                get: $util.oneOfGetter($oneOfFields = ["answer"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Join_Group_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {lingcat.methods.Join_Group_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Join_Group_Request} Join_Group_Request instance
             * @type {{
             *   (properties: lingcat.methods.Join_Group_Request.$Shape): lingcat.methods.Join_Group_Request & lingcat.methods.Join_Group_Request.$Shape;
             *   (properties?: lingcat.methods.Join_Group_Request.$Properties): lingcat.methods.Join_Group_Request;
             * }}
             */
            Join_Group_Request.create = function(properties) {
                return new Join_Group_Request(properties);
            };

            /**
             * Encodes the specified Join_Group_Request message. Does not implicitly {@link lingcat.methods.Join_Group_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {lingcat.methods.Join_Group_Request.$Properties} message Join_Group_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Join_Group_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.answer != null && $Object.hasOwnProperty.call(message, "answer"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.answer);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Join_Group_Request message, length delimited. Does not implicitly {@link lingcat.methods.Join_Group_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {lingcat.methods.Join_Group_Request.$Properties} message Join_Group_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Join_Group_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Join_Group_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Join_Group_Request & lingcat.methods.Join_Group_Request.$Shape} Join_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Join_Group_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Join_Group_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.answer = reader.stringVerify();
                            message._answer = "answer";
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
             * Decodes a Join_Group_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Join_Group_Request & lingcat.methods.Join_Group_Request.$Shape} Join_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Join_Group_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Join_Group_Request message.
             * @function verify
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Join_Group_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                let properties = {};
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.answer != null && $Object.hasOwnProperty.call(message, "answer")) {
                    properties._answer = 1;
                    if (!$util.isString(message.answer))
                        return "answer: string expected";
                }
                return null;
            };

            /**
             * Creates a Join_Group_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Join_Group_Request} Join_Group_Request
             */
            Join_Group_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Join_Group_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Join_Group_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Join_Group_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.answer != null)
                    message.answer = $String(object.answer);
                return message;
            };

            /**
             * Creates a plain object from a Join_Group_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {lingcat.methods.Join_Group_Request} message Join_Group_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Join_Group_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.answer != null && $Object.hasOwnProperty.call(message, "answer"))
                    object.answer = message.answer;
                return object;
            };

            /**
             * Converts this Join_Group_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Join_Group_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Join_Group_Request.prototype.toJSON = function() {
                return Join_Group_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Join_Group_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Join_Group_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Join_Group_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Join_Group_Request";
            };

            return Join_Group_Request;
        })();

        methods.Join_Group_Response = (function() {

            /**
             * Properties of a Join_Group_Response.
             * @typedef {Object} lingcat.methods.Join_Group_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Join_Group_Response.
             * @memberof lingcat.methods
             * @interface IJoin_Group_Response
             * @augments lingcat.methods.Join_Group_Response.$Properties
             * @deprecated Use lingcat.methods.Join_Group_Response.$Properties instead.
             */

            /**
             * Shape of a Join_Group_Response.
             * @typedef {lingcat.methods.Join_Group_Response.$Properties} lingcat.methods.Join_Group_Response.$Shape
             */

            /**
             * Constructs a new Join_Group_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Join_Group_Response.
             * @constructor
             * @param {lingcat.methods.Join_Group_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Join_Group_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Join_Group_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {lingcat.methods.Join_Group_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Join_Group_Response} Join_Group_Response instance
             * @type {{
             *   (properties: lingcat.methods.Join_Group_Response.$Shape): lingcat.methods.Join_Group_Response & lingcat.methods.Join_Group_Response.$Shape;
             *   (properties?: lingcat.methods.Join_Group_Response.$Properties): lingcat.methods.Join_Group_Response;
             * }}
             */
            Join_Group_Response.create = function(properties) {
                return new Join_Group_Response(properties);
            };

            /**
             * Encodes the specified Join_Group_Response message. Does not implicitly {@link lingcat.methods.Join_Group_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {lingcat.methods.Join_Group_Response.$Properties} message Join_Group_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Join_Group_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Join_Group_Response message, length delimited. Does not implicitly {@link lingcat.methods.Join_Group_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {lingcat.methods.Join_Group_Response.$Properties} message Join_Group_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Join_Group_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Join_Group_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Join_Group_Response & lingcat.methods.Join_Group_Response.$Shape} Join_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Join_Group_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Join_Group_Response();
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
             * Decodes a Join_Group_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Join_Group_Response & lingcat.methods.Join_Group_Response.$Shape} Join_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Join_Group_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Join_Group_Response message.
             * @function verify
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Join_Group_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates a Join_Group_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Join_Group_Response} Join_Group_Response
             */
            Join_Group_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Join_Group_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Join_Group_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Join_Group_Response();
            };

            /**
             * Creates a plain object from a Join_Group_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {lingcat.methods.Join_Group_Response} message Join_Group_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Join_Group_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Join_Group_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Join_Group_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Join_Group_Response.prototype.toJSON = function() {
                return Join_Group_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Join_Group_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Join_Group_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Join_Group_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Join_Group_Response";
            };

            return Join_Group_Response;
        })();

        methods.Remove_Chat_Member_Request = (function() {

            /**
             * Properties of a Remove_Chat_Member_Request.
             * @typedef {Object} lingcat.methods.Remove_Chat_Member_Request.$Properties
             * @property {string|null} [accessToken] Remove_Chat_Member_Request accessToken
             * @property {string|null} [chatId] Remove_Chat_Member_Request chatId
             * @property {string|null} [targetUserId] Remove_Chat_Member_Request targetUserId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Remove_Chat_Member_Request.
             * @memberof lingcat.methods
             * @interface IRemove_Chat_Member_Request
             * @augments lingcat.methods.Remove_Chat_Member_Request.$Properties
             * @deprecated Use lingcat.methods.Remove_Chat_Member_Request.$Properties instead.
             */

            /**
             * Shape of a Remove_Chat_Member_Request.
             * @typedef {lingcat.methods.Remove_Chat_Member_Request.$Properties} lingcat.methods.Remove_Chat_Member_Request.$Shape
             */

            /**
             * Constructs a new Remove_Chat_Member_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Remove_Chat_Member_Request.
             * @constructor
             * @param {lingcat.methods.Remove_Chat_Member_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Remove_Chat_Member_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Remove_Chat_Member_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @instance
             */
            Remove_Chat_Member_Request.prototype.accessToken = "";

            /**
             * Remove_Chat_Member_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @instance
             */
            Remove_Chat_Member_Request.prototype.chatId = "";

            /**
             * Remove_Chat_Member_Request targetUserId.
             * @member {string} targetUserId
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @instance
             */
            Remove_Chat_Member_Request.prototype.targetUserId = "";

            /**
             * Creates a new Remove_Chat_Member_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Remove_Chat_Member_Request} Remove_Chat_Member_Request instance
             * @type {{
             *   (properties: lingcat.methods.Remove_Chat_Member_Request.$Shape): lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape;
             *   (properties?: lingcat.methods.Remove_Chat_Member_Request.$Properties): lingcat.methods.Remove_Chat_Member_Request;
             * }}
             */
            Remove_Chat_Member_Request.create = function(properties) {
                return new Remove_Chat_Member_Request(properties);
            };

            /**
             * Encodes the specified Remove_Chat_Member_Request message. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Request.$Properties} message Remove_Chat_Member_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Remove_Chat_Member_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId") && message.targetUserId !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.targetUserId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Remove_Chat_Member_Request message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Request.$Properties} message Remove_Chat_Member_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Remove_Chat_Member_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Remove_Chat_Member_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape} Remove_Chat_Member_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Remove_Chat_Member_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Remove_Chat_Member_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.targetUserId = value;
                            else
                                delete message.targetUserId;
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
             * Decodes a Remove_Chat_Member_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape} Remove_Chat_Member_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Remove_Chat_Member_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Remove_Chat_Member_Request message.
             * @function verify
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Remove_Chat_Member_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId"))
                    if (!$util.isString(message.targetUserId))
                        return "targetUserId: string expected";
                return null;
            };

            /**
             * Creates a Remove_Chat_Member_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Remove_Chat_Member_Request} Remove_Chat_Member_Request
             */
            Remove_Chat_Member_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Remove_Chat_Member_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Remove_Chat_Member_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Remove_Chat_Member_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.targetUserId != null)
                    if (typeof object.targetUserId !== "string" || object.targetUserId.length)
                        message.targetUserId = $String(object.targetUserId);
                return message;
            };

            /**
             * Creates a plain object from a Remove_Chat_Member_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Request} message Remove_Chat_Member_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Remove_Chat_Member_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                    object.targetUserId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.targetUserId != null && $Object.hasOwnProperty.call(message, "targetUserId"))
                    object.targetUserId = message.targetUserId;
                return object;
            };

            /**
             * Converts this Remove_Chat_Member_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Remove_Chat_Member_Request.prototype.toJSON = function() {
                return Remove_Chat_Member_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Remove_Chat_Member_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Remove_Chat_Member_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Remove_Chat_Member_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Remove_Chat_Member_Request";
            };

            return Remove_Chat_Member_Request;
        })();

        methods.Remove_Chat_Member_Response = (function() {

            /**
             * Properties of a Remove_Chat_Member_Response.
             * @typedef {Object} lingcat.methods.Remove_Chat_Member_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Remove_Chat_Member_Response.
             * @memberof lingcat.methods
             * @interface IRemove_Chat_Member_Response
             * @augments lingcat.methods.Remove_Chat_Member_Response.$Properties
             * @deprecated Use lingcat.methods.Remove_Chat_Member_Response.$Properties instead.
             */

            /**
             * Shape of a Remove_Chat_Member_Response.
             * @typedef {lingcat.methods.Remove_Chat_Member_Response.$Properties} lingcat.methods.Remove_Chat_Member_Response.$Shape
             */

            /**
             * Constructs a new Remove_Chat_Member_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Remove_Chat_Member_Response.
             * @constructor
             * @param {lingcat.methods.Remove_Chat_Member_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Remove_Chat_Member_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Remove_Chat_Member_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Remove_Chat_Member_Response} Remove_Chat_Member_Response instance
             * @type {{
             *   (properties: lingcat.methods.Remove_Chat_Member_Response.$Shape): lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape;
             *   (properties?: lingcat.methods.Remove_Chat_Member_Response.$Properties): lingcat.methods.Remove_Chat_Member_Response;
             * }}
             */
            Remove_Chat_Member_Response.create = function(properties) {
                return new Remove_Chat_Member_Response(properties);
            };

            /**
             * Encodes the specified Remove_Chat_Member_Response message. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Response.$Properties} message Remove_Chat_Member_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Remove_Chat_Member_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Remove_Chat_Member_Response message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Response.$Properties} message Remove_Chat_Member_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Remove_Chat_Member_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Remove_Chat_Member_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape} Remove_Chat_Member_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Remove_Chat_Member_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Remove_Chat_Member_Response();
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
             * Decodes a Remove_Chat_Member_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape} Remove_Chat_Member_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Remove_Chat_Member_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Remove_Chat_Member_Response message.
             * @function verify
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Remove_Chat_Member_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates a Remove_Chat_Member_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Remove_Chat_Member_Response} Remove_Chat_Member_Response
             */
            Remove_Chat_Member_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Remove_Chat_Member_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Remove_Chat_Member_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Remove_Chat_Member_Response();
            };

            /**
             * Creates a plain object from a Remove_Chat_Member_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {lingcat.methods.Remove_Chat_Member_Response} message Remove_Chat_Member_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Remove_Chat_Member_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Remove_Chat_Member_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Remove_Chat_Member_Response.prototype.toJSON = function() {
                return Remove_Chat_Member_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Remove_Chat_Member_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Remove_Chat_Member_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Remove_Chat_Member_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Remove_Chat_Member_Response";
            };

            return Remove_Chat_Member_Response;
        })();

        methods.Update_Chat_Settings_Request = (function() {

            /**
             * Properties of an Update_Chat_Settings_Request.
             * @typedef {Object} lingcat.methods.Update_Chat_Settings_Request.$Properties
             * @property {string|null} [accessToken] Update_Chat_Settings_Request accessToken
             * @property {string|null} [chatId] Update_Chat_Settings_Request chatId
             * @property {string|null} [settings] Update_Chat_Settings_Request settings
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_Chat_Settings_Request.
             * @memberof lingcat.methods
             * @interface IUpdate_Chat_Settings_Request
             * @augments lingcat.methods.Update_Chat_Settings_Request.$Properties
             * @deprecated Use lingcat.methods.Update_Chat_Settings_Request.$Properties instead.
             */

            /**
             * Shape of an Update_Chat_Settings_Request.
             * @typedef {lingcat.methods.Update_Chat_Settings_Request.$Properties} lingcat.methods.Update_Chat_Settings_Request.$Shape
             */

            /**
             * Constructs a new Update_Chat_Settings_Request.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_Chat_Settings_Request.
             * @constructor
             * @param {lingcat.methods.Update_Chat_Settings_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_Chat_Settings_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Update_Chat_Settings_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @instance
             */
            Update_Chat_Settings_Request.prototype.accessToken = "";

            /**
             * Update_Chat_Settings_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @instance
             */
            Update_Chat_Settings_Request.prototype.chatId = "";

            /**
             * Update_Chat_Settings_Request settings.
             * @member {string} settings
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @instance
             */
            Update_Chat_Settings_Request.prototype.settings = "";

            /**
             * Creates a new Update_Chat_Settings_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_Chat_Settings_Request} Update_Chat_Settings_Request instance
             * @type {{
             *   (properties: lingcat.methods.Update_Chat_Settings_Request.$Shape): lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape;
             *   (properties?: lingcat.methods.Update_Chat_Settings_Request.$Properties): lingcat.methods.Update_Chat_Settings_Request;
             * }}
             */
            Update_Chat_Settings_Request.create = function(properties) {
                return new Update_Chat_Settings_Request(properties);
            };

            /**
             * Encodes the specified Update_Chat_Settings_Request message. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Request.$Properties} message Update_Chat_Settings_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Settings_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings") && message.settings !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.settings);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Update_Chat_Settings_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Request.$Properties} message Update_Chat_Settings_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Settings_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_Chat_Settings_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape} Update_Chat_Settings_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Settings_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_Chat_Settings_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.settings = value;
                            else
                                delete message.settings;
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
             * Decodes an Update_Chat_Settings_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape} Update_Chat_Settings_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Settings_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_Chat_Settings_Request message.
             * @function verify
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_Chat_Settings_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings"))
                    if (!$util.isString(message.settings))
                        return "settings: string expected";
                return null;
            };

            /**
             * Creates an Update_Chat_Settings_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_Chat_Settings_Request} Update_Chat_Settings_Request
             */
            Update_Chat_Settings_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_Chat_Settings_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_Chat_Settings_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Update_Chat_Settings_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                if (object.settings != null)
                    if (typeof object.settings !== "string" || object.settings.length)
                        message.settings = $String(object.settings);
                return message;
            };

            /**
             * Creates a plain object from an Update_Chat_Settings_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Request} message Update_Chat_Settings_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_Chat_Settings_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                    object.settings = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                if (message.settings != null && $Object.hasOwnProperty.call(message, "settings"))
                    object.settings = message.settings;
                return object;
            };

            /**
             * Converts this Update_Chat_Settings_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_Chat_Settings_Request.prototype.toJSON = function() {
                return Update_Chat_Settings_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_Chat_Settings_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_Chat_Settings_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_Chat_Settings_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_Chat_Settings_Request";
            };

            return Update_Chat_Settings_Request;
        })();

        methods.Update_Chat_Settings_Response = (function() {

            /**
             * Properties of an Update_Chat_Settings_Response.
             * @typedef {Object} lingcat.methods.Update_Chat_Settings_Response.$Properties
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Update_Chat_Settings_Response.
             * @memberof lingcat.methods
             * @interface IUpdate_Chat_Settings_Response
             * @augments lingcat.methods.Update_Chat_Settings_Response.$Properties
             * @deprecated Use lingcat.methods.Update_Chat_Settings_Response.$Properties instead.
             */

            /**
             * Shape of an Update_Chat_Settings_Response.
             * @typedef {lingcat.methods.Update_Chat_Settings_Response.$Properties} lingcat.methods.Update_Chat_Settings_Response.$Shape
             */

            /**
             * Constructs a new Update_Chat_Settings_Response.
             * @memberof lingcat.methods
             * @classdesc Represents an Update_Chat_Settings_Response.
             * @constructor
             * @param {lingcat.methods.Update_Chat_Settings_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Update_Chat_Settings_Response = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Creates a new Update_Chat_Settings_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Update_Chat_Settings_Response} Update_Chat_Settings_Response instance
             * @type {{
             *   (properties: lingcat.methods.Update_Chat_Settings_Response.$Shape): lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape;
             *   (properties?: lingcat.methods.Update_Chat_Settings_Response.$Properties): lingcat.methods.Update_Chat_Settings_Response;
             * }}
             */
            Update_Chat_Settings_Response.create = function(properties) {
                return new Update_Chat_Settings_Response(properties);
            };

            /**
             * Encodes the specified Update_Chat_Settings_Response message. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Response.$Properties} message Update_Chat_Settings_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Settings_Response.encode = function (message, writer, _depth) {
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
             * Encodes the specified Update_Chat_Settings_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Response.$Properties} message Update_Chat_Settings_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Update_Chat_Settings_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes an Update_Chat_Settings_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape} Update_Chat_Settings_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Settings_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Update_Chat_Settings_Response();
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
             * Decodes an Update_Chat_Settings_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape} Update_Chat_Settings_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Update_Chat_Settings_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Update_Chat_Settings_Response message.
             * @function verify
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Update_Chat_Settings_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                return null;
            };

            /**
             * Creates an Update_Chat_Settings_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Update_Chat_Settings_Response} Update_Chat_Settings_Response
             */
            Update_Chat_Settings_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Update_Chat_Settings_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Update_Chat_Settings_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                return new $root.lingcat.methods.Update_Chat_Settings_Response();
            };

            /**
             * Creates a plain object from an Update_Chat_Settings_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {lingcat.methods.Update_Chat_Settings_Response} message Update_Chat_Settings_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Update_Chat_Settings_Response.toObject = function () {
                return {};
            };

            /**
             * Converts this Update_Chat_Settings_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Update_Chat_Settings_Response.prototype.toJSON = function() {
                return Update_Chat_Settings_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Update_Chat_Settings_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Update_Chat_Settings_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Update_Chat_Settings_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Update_Chat_Settings_Response";
            };

            return Update_Chat_Settings_Response;
        })();

        methods.Get_Chat_Admins_Request = (function() {

            /**
             * Properties of a Get_Chat_Admins_Request.
             * @typedef {Object} lingcat.methods.Get_Chat_Admins_Request.$Properties
             * @property {string|null} [accessToken] Get_Chat_Admins_Request accessToken
             * @property {string|null} [chatId] Get_Chat_Admins_Request chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Admins_Request.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Admins_Request
             * @augments lingcat.methods.Get_Chat_Admins_Request.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Admins_Request.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Admins_Request.
             * @typedef {lingcat.methods.Get_Chat_Admins_Request.$Properties} lingcat.methods.Get_Chat_Admins_Request.$Shape
             */

            /**
             * Constructs a new Get_Chat_Admins_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Admins_Request.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Admins_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Admins_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Admins_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @instance
             */
            Get_Chat_Admins_Request.prototype.accessToken = "";

            /**
             * Get_Chat_Admins_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @instance
             */
            Get_Chat_Admins_Request.prototype.chatId = "";

            /**
             * Creates a new Get_Chat_Admins_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Admins_Request} Get_Chat_Admins_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Admins_Request.$Shape): lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Admins_Request.$Properties): lingcat.methods.Get_Chat_Admins_Request;
             * }}
             */
            Get_Chat_Admins_Request.create = function(properties) {
                return new Get_Chat_Admins_Request(properties);
            };

            /**
             * Encodes the specified Get_Chat_Admins_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Request.$Properties} message Get_Chat_Admins_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Admins_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Admins_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Request.$Properties} message Get_Chat_Admins_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Admins_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Admins_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape} Get_Chat_Admins_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Admins_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Admins_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Get_Chat_Admins_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape} Get_Chat_Admins_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Admins_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Admins_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Admins_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Get_Chat_Admins_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Admins_Request} Get_Chat_Admins_Request
             */
            Get_Chat_Admins_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Admins_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Admins_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Admins_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Admins_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Request} message Get_Chat_Admins_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Admins_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Get_Chat_Admins_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Admins_Request.prototype.toJSON = function() {
                return Get_Chat_Admins_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Admins_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Admins_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Admins_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Admins_Request";
            };

            return Get_Chat_Admins_Request;
        })();

        methods.Get_Chat_Admins_Response = (function() {

            /**
             * Properties of a Get_Chat_Admins_Response.
             * @typedef {Object} lingcat.methods.Get_Chat_Admins_Response.$Properties
             * @property {Array.<lingcat.classes.IChatAdmin.$Properties>|null} [admins] Get_Chat_Admins_Response admins
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Admins_Response.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Admins_Response
             * @augments lingcat.methods.Get_Chat_Admins_Response.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Admins_Response.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Admins_Response.
             * @typedef {lingcat.methods.Get_Chat_Admins_Response.$Properties} lingcat.methods.Get_Chat_Admins_Response.$Shape
             */

            /**
             * Constructs a new Get_Chat_Admins_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Admins_Response.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Admins_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Admins_Response = function (properties) {
                this.admins = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Admins_Response admins.
             * @member {Array.<lingcat.classes.IChatAdmin.$Properties>} admins
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @instance
             */
            Get_Chat_Admins_Response.prototype.admins = $util.emptyArray;

            /**
             * Creates a new Get_Chat_Admins_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Admins_Response} Get_Chat_Admins_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Admins_Response.$Shape): lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Admins_Response.$Properties): lingcat.methods.Get_Chat_Admins_Response;
             * }}
             */
            Get_Chat_Admins_Response.create = function(properties) {
                return new Get_Chat_Admins_Response(properties);
            };

            /**
             * Encodes the specified Get_Chat_Admins_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Response.$Properties} message Get_Chat_Admins_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Admins_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.admins != null && message.admins.length)
                    for (let i = 0; i < message.admins.length; ++i)
                        $root.lingcat.classes.IChatAdmin.encode(message.admins[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Admins_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Response.$Properties} message Get_Chat_Admins_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Admins_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Admins_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape} Get_Chat_Admins_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Admins_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Admins_Response();
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
                            if (!(message.admins && message.admins.length))
                                message.admins = [];
                            message.admins.push($root.lingcat.classes.IChatAdmin.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Get_Chat_Admins_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape} Get_Chat_Admins_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Admins_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Admins_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Admins_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.admins != null && $Object.hasOwnProperty.call(message, "admins")) {
                    if (!$Array.isArray(message.admins))
                        return "admins: array expected";
                    for (let i = 0; i < message.admins.length; ++i) {
                        let error = $root.lingcat.classes.IChatAdmin.verify(message.admins[i], _depth + 1);
                        if (error)
                            return "admins." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Get_Chat_Admins_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Admins_Response} Get_Chat_Admins_Response
             */
            Get_Chat_Admins_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Admins_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Admins_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Admins_Response();
                if (object.admins) {
                    if (!$Array.isArray(object.admins))
                        throw $TypeError(".lingcat.methods.Get_Chat_Admins_Response.admins: array expected");
                    message.admins = $Array(object.admins.length);
                    for (let i = 0; i < object.admins.length; ++i) {
                        if (!$util.isObject(object.admins[i]))
                            throw $TypeError(".lingcat.methods.Get_Chat_Admins_Response.admins: object expected");
                        message.admins[i] = $root.lingcat.classes.IChatAdmin.fromObject(object.admins[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Admins_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Admins_Response} message Get_Chat_Admins_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Admins_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.admins = [];
                if (message.admins && message.admins.length) {
                    object.admins = $Array(message.admins.length);
                    for (let j = 0; j < message.admins.length; ++j)
                        object.admins[j] = $root.lingcat.classes.IChatAdmin.toObject(message.admins[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Get_Chat_Admins_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Admins_Response.prototype.toJSON = function() {
                return Get_Chat_Admins_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Admins_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Admins_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Admins_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Admins_Response";
            };

            return Get_Chat_Admins_Response;
        })();

        methods.Get_Chat_Members_Request = (function() {

            /**
             * Properties of a Get_Chat_Members_Request.
             * @typedef {Object} lingcat.methods.Get_Chat_Members_Request.$Properties
             * @property {string|null} [accessToken] Get_Chat_Members_Request accessToken
             * @property {string|null} [chatId] Get_Chat_Members_Request chatId
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Members_Request.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Members_Request
             * @augments lingcat.methods.Get_Chat_Members_Request.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Members_Request.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Members_Request.
             * @typedef {lingcat.methods.Get_Chat_Members_Request.$Properties} lingcat.methods.Get_Chat_Members_Request.$Shape
             */

            /**
             * Constructs a new Get_Chat_Members_Request.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Members_Request.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Members_Request.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Members_Request = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Members_Request accessToken.
             * @member {string} accessToken
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @instance
             */
            Get_Chat_Members_Request.prototype.accessToken = "";

            /**
             * Get_Chat_Members_Request chatId.
             * @member {string} chatId
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @instance
             */
            Get_Chat_Members_Request.prototype.chatId = "";

            /**
             * Creates a new Get_Chat_Members_Request instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Request.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Members_Request} Get_Chat_Members_Request instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Members_Request.$Shape): lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Members_Request.$Properties): lingcat.methods.Get_Chat_Members_Request;
             * }}
             */
            Get_Chat_Members_Request.create = function(properties) {
                return new Get_Chat_Members_Request(properties);
            };

            /**
             * Encodes the specified Get_Chat_Members_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Request.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Request.$Properties} message Get_Chat_Members_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Members_Request.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken") && message.accessToken !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.accessToken);
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId") && message.chatId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Members_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Request.$Properties} message Get_Chat_Members_Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Members_Request.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Members_Request message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape} Get_Chat_Members_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Members_Request.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Members_Request(), value;
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
                                message.chatId = value;
                            else
                                delete message.chatId;
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
             * Decodes a Get_Chat_Members_Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape} Get_Chat_Members_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Members_Request.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Members_Request message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Members_Request.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    if (!$util.isString(message.accessToken))
                        return "accessToken: string expected";
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    if (!$util.isString(message.chatId))
                        return "chatId: string expected";
                return null;
            };

            /**
             * Creates a Get_Chat_Members_Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Members_Request} Get_Chat_Members_Request
             */
            Get_Chat_Members_Request.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Members_Request)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Members_Request: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Members_Request();
                if (object.accessToken != null)
                    if (typeof object.accessToken !== "string" || object.accessToken.length)
                        message.accessToken = $String(object.accessToken);
                if (object.chatId != null)
                    if (typeof object.chatId !== "string" || object.chatId.length)
                        message.chatId = $String(object.chatId);
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Members_Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Request} message Get_Chat_Members_Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Members_Request.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accessToken = "";
                    object.chatId = "";
                }
                if (message.accessToken != null && $Object.hasOwnProperty.call(message, "accessToken"))
                    object.accessToken = message.accessToken;
                if (message.chatId != null && $Object.hasOwnProperty.call(message, "chatId"))
                    object.chatId = message.chatId;
                return object;
            };

            /**
             * Converts this Get_Chat_Members_Request to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Members_Request.prototype.toJSON = function() {
                return Get_Chat_Members_Request.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Members_Request
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Members_Request
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Members_Request.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Members_Request";
            };

            return Get_Chat_Members_Request;
        })();

        methods.Get_Chat_Members_Response = (function() {

            /**
             * Properties of a Get_Chat_Members_Response.
             * @typedef {Object} lingcat.methods.Get_Chat_Members_Response.$Properties
             * @property {Array.<lingcat.classes.IUser.$Properties>|null} [members] Get_Chat_Members_Response members
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Get_Chat_Members_Response.
             * @memberof lingcat.methods
             * @interface IGet_Chat_Members_Response
             * @augments lingcat.methods.Get_Chat_Members_Response.$Properties
             * @deprecated Use lingcat.methods.Get_Chat_Members_Response.$Properties instead.
             */

            /**
             * Shape of a Get_Chat_Members_Response.
             * @typedef {lingcat.methods.Get_Chat_Members_Response.$Properties} lingcat.methods.Get_Chat_Members_Response.$Shape
             */

            /**
             * Constructs a new Get_Chat_Members_Response.
             * @memberof lingcat.methods
             * @classdesc Represents a Get_Chat_Members_Response.
             * @constructor
             * @param {lingcat.methods.Get_Chat_Members_Response.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Get_Chat_Members_Response = function (properties) {
                this.members = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Get_Chat_Members_Response members.
             * @member {Array.<lingcat.classes.IUser.$Properties>} members
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @instance
             */
            Get_Chat_Members_Response.prototype.members = $util.emptyArray;

            /**
             * Creates a new Get_Chat_Members_Response instance using the specified properties.
             * @function create
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Response.$Properties=} [properties] Properties to set
             * @returns {lingcat.methods.Get_Chat_Members_Response} Get_Chat_Members_Response instance
             * @type {{
             *   (properties: lingcat.methods.Get_Chat_Members_Response.$Shape): lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape;
             *   (properties?: lingcat.methods.Get_Chat_Members_Response.$Properties): lingcat.methods.Get_Chat_Members_Response;
             * }}
             */
            Get_Chat_Members_Response.create = function(properties) {
                return new Get_Chat_Members_Response(properties);
            };

            /**
             * Encodes the specified Get_Chat_Members_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Response.verify|verify} messages.
             * @function encode
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Response.$Properties} message Get_Chat_Members_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Members_Response.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.members != null && message.members.length)
                    for (let i = 0; i < message.members.length; ++i)
                        $root.lingcat.classes.IUser.encode(message.members[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Get_Chat_Members_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Response.$Properties} message Get_Chat_Members_Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Get_Chat_Members_Response.encodeDelimited = function(message, writer) {
                return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
            };

            /**
             * Decodes a Get_Chat_Members_Response message from the specified reader or buffer.
             * @function decode
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape} Get_Chat_Members_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Members_Response.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.lingcat.methods.Get_Chat_Members_Response();
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
                            if (!(message.members && message.members.length))
                                message.members = [];
                            message.members.push($root.lingcat.classes.IUser.decode(reader, reader.uint32(), $undefined, _depth + 1));
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
             * Decodes a Get_Chat_Members_Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape} Get_Chat_Members_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Get_Chat_Members_Response.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Get_Chat_Members_Response message.
             * @function verify
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Get_Chat_Members_Response.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.members != null && $Object.hasOwnProperty.call(message, "members")) {
                    if (!$Array.isArray(message.members))
                        return "members: array expected";
                    for (let i = 0; i < message.members.length; ++i) {
                        let error = $root.lingcat.classes.IUser.verify(message.members[i], _depth + 1);
                        if (error)
                            return "members." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Get_Chat_Members_Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {lingcat.methods.Get_Chat_Members_Response} Get_Chat_Members_Response
             */
            Get_Chat_Members_Response.fromObject = function (object, _depth) {
                if (object instanceof $root.lingcat.methods.Get_Chat_Members_Response)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".lingcat.methods.Get_Chat_Members_Response: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.lingcat.methods.Get_Chat_Members_Response();
                if (object.members) {
                    if (!$Array.isArray(object.members))
                        throw $TypeError(".lingcat.methods.Get_Chat_Members_Response.members: array expected");
                    message.members = $Array(object.members.length);
                    for (let i = 0; i < object.members.length; ++i) {
                        if (!$util.isObject(object.members[i]))
                            throw $TypeError(".lingcat.methods.Get_Chat_Members_Response.members: object expected");
                        message.members[i] = $root.lingcat.classes.IUser.fromObject(object.members[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Get_Chat_Members_Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {lingcat.methods.Get_Chat_Members_Response} message Get_Chat_Members_Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Get_Chat_Members_Response.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.members = [];
                if (message.members && message.members.length) {
                    object.members = $Array(message.members.length);
                    for (let j = 0; j < message.members.length; ++j)
                        object.members[j] = $root.lingcat.classes.IUser.toObject(message.members[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this Get_Chat_Members_Response to JSON.
             * @function toJSON
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Get_Chat_Members_Response.prototype.toJSON = function() {
                return Get_Chat_Members_Response.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Get_Chat_Members_Response
             * @function getTypeUrl
             * @memberof lingcat.methods.Get_Chat_Members_Response
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Get_Chat_Members_Response.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/lingcat.methods.Get_Chat_Members_Response";
            };

            return Get_Chat_Members_Response;
        })();

        return methods;
    })();

    return lingcat;
})();

export {
  $root as default
};
