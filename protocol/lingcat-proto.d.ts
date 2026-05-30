import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace lingcat. */
export namespace lingcat {

    /** Namespace classes. */
    namespace classes {

        /**
         * Properties of an EncryptedMessage.
         * @deprecated Use lingcat.classes.EncryptedMessage.$Properties instead.
         */
        interface IEncryptedMessage extends lingcat.classes.EncryptedMessage.$Properties {
        }

        /** Represents an EncryptedMessage. */
        class EncryptedMessage {

            /**
             * Constructs a new EncryptedMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.EncryptedMessage.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** EncryptedMessage seq. */
            seq: number;

            /** EncryptedMessage iv. */
            iv: Uint8Array;

            /** EncryptedMessage data. */
            data: Uint8Array;

            /** EncryptedMessage aad. */
            aad: Uint8Array;

            /** EncryptedMessage tag. */
            tag: Uint8Array;

            /**
             * Creates a new EncryptedMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EncryptedMessage instance
             */
            static create(properties: lingcat.classes.EncryptedMessage.$Shape): lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape;
            static create(properties?: lingcat.classes.EncryptedMessage.$Properties): lingcat.classes.EncryptedMessage;

            /**
             * Encodes the specified EncryptedMessage message. Does not implicitly {@link lingcat.classes.EncryptedMessage.verify|verify} messages.
             * @param message EncryptedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.EncryptedMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EncryptedMessage message, length delimited. Does not implicitly {@link lingcat.classes.EncryptedMessage.verify|verify} messages.
             * @param message EncryptedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.EncryptedMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EncryptedMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape} EncryptedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape;

            /**
             * Decodes an EncryptedMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape} EncryptedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.EncryptedMessage & lingcat.classes.EncryptedMessage.$Shape;

            /**
             * Verifies an EncryptedMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EncryptedMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EncryptedMessage
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.EncryptedMessage;

            /**
             * Creates a plain object from an EncryptedMessage message. Also converts values to other types if specified.
             * @param message EncryptedMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.EncryptedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EncryptedMessage to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for EncryptedMessage
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace EncryptedMessage {

            /** Properties of an EncryptedMessage. */
            interface $Properties {

                /** EncryptedMessage seq */
                seq?: (number|null);

                /** EncryptedMessage iv */
                iv?: (Uint8Array|null);

                /** EncryptedMessage data */
                data?: (Uint8Array|null);

                /** EncryptedMessage aad */
                aad?: (Uint8Array|null);

                /** EncryptedMessage tag */
                tag?: (Uint8Array|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an EncryptedMessage. */
            type $Shape = lingcat.classes.EncryptedMessage.$Properties;
        }

        /**
         * Properties of a User.
         * @deprecated Use lingcat.classes.User.$Properties instead.
         */
        interface IUser extends lingcat.classes.User.$Properties {
        }

        /** Represents a User. */
        class User {

            /**
             * Constructs a new User.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.User.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** 用户 ID 在服务端为真实 ID, 在客户端为服务端生成的针对某个客户端的临时 ID */
            id: string;

            /** User username. */
            username?: (string|null);

            /** User nickname. */
            nickname: string;

            /**
             * Creates a new User instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User instance
             */
            static create(properties: lingcat.classes.User.$Shape): lingcat.classes.User & lingcat.classes.User.$Shape;
            static create(properties?: lingcat.classes.User.$Properties): lingcat.classes.User;

            /**
             * Encodes the specified User message. Does not implicitly {@link lingcat.classes.User.verify|verify} messages.
             * @param message User message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.User.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User message, length delimited. Does not implicitly {@link lingcat.classes.User.verify|verify} messages.
             * @param message User message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.User.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.User & lingcat.classes.User.$Shape} User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.User & lingcat.classes.User.$Shape;

            /**
             * Decodes a User message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.User & lingcat.classes.User.$Shape} User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.User & lingcat.classes.User.$Shape;

            /**
             * Verifies a User message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.User;

            /**
             * Creates a plain object from a User message. Also converts values to other types if specified.
             * @param message User
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User {

            /** Properties of a User. */
            interface $Properties {

                /** 用户 ID 在服务端为真实 ID, 在客户端为服务端生成的针对某个客户端的临时 ID */
                id?: (string|null);

                /** User username */
                username?: (string|null);

                /** User nickname */
                nickname?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User. */
            type $Shape = lingcat.classes.User.$Properties;
        }

        /**
         * Properties of a Group.
         * @deprecated Use lingcat.classes.Group.$Properties instead.
         */
        interface IGroup extends lingcat.classes.Group.$Properties {
        }

        /** Represents a Group. */
        class Group {

            /**
             * Constructs a new Group.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.Group.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** Group id. */
            id: string;

            /** Group groupUnique. */
            groupUnique?: (string|null);

            /** Group name. */
            name: string;

            /**
             * Creates a new Group instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Group instance
             */
            static create(properties: lingcat.classes.Group.$Shape): lingcat.classes.Group & lingcat.classes.Group.$Shape;
            static create(properties?: lingcat.classes.Group.$Properties): lingcat.classes.Group;

            /**
             * Encodes the specified Group message. Does not implicitly {@link lingcat.classes.Group.verify|verify} messages.
             * @param message Group message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.Group.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Group message, length delimited. Does not implicitly {@link lingcat.classes.Group.verify|verify} messages.
             * @param message Group message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.Group.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Group message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.Group & lingcat.classes.Group.$Shape} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.Group & lingcat.classes.Group.$Shape;

            /**
             * Decodes a Group message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.Group & lingcat.classes.Group.$Shape} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.Group & lingcat.classes.Group.$Shape;

            /**
             * Verifies a Group message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Group message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Group
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.Group;

            /**
             * Creates a plain object from a Group message. Also converts values to other types if specified.
             * @param message Group
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Group to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Group
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Group {

            /** Properties of a Group. */
            interface $Properties {

                /** Group id */
                id?: (string|null);

                /** Group groupUnique */
                groupUnique?: (string|null);

                /** Group name */
                name?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Group. */
            type $Shape = lingcat.classes.Group.$Properties;
        }
    }

    /** Namespace methods. */
    namespace methods {

        /**
         * Properties of a HandShake_Request.
         * @deprecated Use lingcat.methods.HandShake_Request.$Properties instead.
         */
        interface IHandShake_Request extends lingcat.methods.HandShake_Request.$Properties {
        }

        /** Represents a HandShake_Request. */
        class HandShake_Request {

            /**
             * Constructs a new HandShake_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.HandShake_Request.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** HandShake_Request publicKey. */
            publicKey: string;

            /**
             * Creates a new HandShake_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns HandShake_Request instance
             */
            static create(properties: lingcat.methods.HandShake_Request.$Shape): lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape;
            static create(properties?: lingcat.methods.HandShake_Request.$Properties): lingcat.methods.HandShake_Request;

            /**
             * Encodes the specified HandShake_Request message. Does not implicitly {@link lingcat.methods.HandShake_Request.verify|verify} messages.
             * @param message HandShake_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.HandShake_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HandShake_Request message, length delimited. Does not implicitly {@link lingcat.methods.HandShake_Request.verify|verify} messages.
             * @param message HandShake_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.HandShake_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HandShake_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape} HandShake_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape;

            /**
             * Decodes a HandShake_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape} HandShake_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.HandShake_Request & lingcat.methods.HandShake_Request.$Shape;

            /**
             * Verifies a HandShake_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HandShake_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HandShake_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.HandShake_Request;

            /**
             * Creates a plain object from a HandShake_Request message. Also converts values to other types if specified.
             * @param message HandShake_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.HandShake_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HandShake_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for HandShake_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace HandShake_Request {

            /** Properties of a HandShake_Request. */
            interface $Properties {

                /** HandShake_Request publicKey */
                publicKey?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a HandShake_Request. */
            type $Shape = lingcat.methods.HandShake_Request.$Properties;
        }

        /**
         * Properties of a HandShake_Response.
         * @deprecated Use lingcat.methods.HandShake_Response.$Properties instead.
         */
        interface IHandShake_Response extends lingcat.methods.HandShake_Response.$Properties {
        }

        /** Represents a HandShake_Response. */
        class HandShake_Response {

            /**
             * Constructs a new HandShake_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.HandShake_Response.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** HandShake_Response salt. */
            salt: Uint8Array;

            /** HandShake_Response verifyMessage. */
            verifyMessage: Uint8Array;

            /** HandShake_Response publicKey. */
            publicKey: string;

            /**
             * Creates a new HandShake_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns HandShake_Response instance
             */
            static create(properties: lingcat.methods.HandShake_Response.$Shape): lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape;
            static create(properties?: lingcat.methods.HandShake_Response.$Properties): lingcat.methods.HandShake_Response;

            /**
             * Encodes the specified HandShake_Response message. Does not implicitly {@link lingcat.methods.HandShake_Response.verify|verify} messages.
             * @param message HandShake_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.HandShake_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HandShake_Response message, length delimited. Does not implicitly {@link lingcat.methods.HandShake_Response.verify|verify} messages.
             * @param message HandShake_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.HandShake_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HandShake_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape} HandShake_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape;

            /**
             * Decodes a HandShake_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape} HandShake_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.HandShake_Response & lingcat.methods.HandShake_Response.$Shape;

            /**
             * Verifies a HandShake_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HandShake_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HandShake_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.HandShake_Response;

            /**
             * Creates a plain object from a HandShake_Response message. Also converts values to other types if specified.
             * @param message HandShake_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.HandShake_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HandShake_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for HandShake_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace HandShake_Response {

            /** Properties of a HandShake_Response. */
            interface $Properties {

                /** HandShake_Response salt */
                salt?: (Uint8Array|null);

                /** HandShake_Response verifyMessage */
                verifyMessage?: (Uint8Array|null);

                /** HandShake_Response publicKey */
                publicKey?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a HandShake_Response. */
            type $Shape = lingcat.methods.HandShake_Response.$Properties;
        }

        /**
         * Properties of a Ping_Request.
         * @deprecated Use lingcat.methods.Ping_Request.$Properties instead.
         */
        interface IPing_Request extends lingcat.methods.Ping_Request.$Properties {
        }

        /** Represents a Ping_Request. */
        class Ping_Request {

            /**
             * Constructs a new Ping_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Ping_Request.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** Ping_Request time. */
            time: (number|Long);

            /**
             * Creates a new Ping_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Ping_Request instance
             */
            static create(properties: lingcat.methods.Ping_Request.$Shape): lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape;
            static create(properties?: lingcat.methods.Ping_Request.$Properties): lingcat.methods.Ping_Request;

            /**
             * Encodes the specified Ping_Request message. Does not implicitly {@link lingcat.methods.Ping_Request.verify|verify} messages.
             * @param message Ping_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Ping_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Ping_Request message, length delimited. Does not implicitly {@link lingcat.methods.Ping_Request.verify|verify} messages.
             * @param message Ping_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Ping_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Ping_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape} Ping_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape;

            /**
             * Decodes a Ping_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape} Ping_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Ping_Request & lingcat.methods.Ping_Request.$Shape;

            /**
             * Verifies a Ping_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Ping_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Ping_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Ping_Request;

            /**
             * Creates a plain object from a Ping_Request message. Also converts values to other types if specified.
             * @param message Ping_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Ping_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Ping_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Ping_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Ping_Request {

            /** Properties of a Ping_Request. */
            interface $Properties {

                /** Ping_Request time */
                time?: (number|Long|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Ping_Request. */
            type $Shape = lingcat.methods.Ping_Request.$Properties;
        }

        /**
         * Properties of a Ping_Response.
         * @deprecated Use lingcat.methods.Ping_Response.$Properties instead.
         */
        interface IPing_Response extends lingcat.methods.Ping_Response.$Properties {
        }

        /** Represents a Ping_Response. */
        class Ping_Response {

            /**
             * Constructs a new Ping_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Ping_Response.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** Ping_Response usage. */
            usage: (number|Long);

            /**
             * Creates a new Ping_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Ping_Response instance
             */
            static create(properties: lingcat.methods.Ping_Response.$Shape): lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape;
            static create(properties?: lingcat.methods.Ping_Response.$Properties): lingcat.methods.Ping_Response;

            /**
             * Encodes the specified Ping_Response message. Does not implicitly {@link lingcat.methods.Ping_Response.verify|verify} messages.
             * @param message Ping_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Ping_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Ping_Response message, length delimited. Does not implicitly {@link lingcat.methods.Ping_Response.verify|verify} messages.
             * @param message Ping_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Ping_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Ping_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape} Ping_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape;

            /**
             * Decodes a Ping_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape} Ping_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Ping_Response & lingcat.methods.Ping_Response.$Shape;

            /**
             * Verifies a Ping_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Ping_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Ping_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Ping_Response;

            /**
             * Creates a plain object from a Ping_Response message. Also converts values to other types if specified.
             * @param message Ping_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Ping_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Ping_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Ping_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Ping_Response {

            /** Properties of a Ping_Response. */
            interface $Properties {

                /** Ping_Response usage */
                usage?: (number|Long|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Ping_Response. */
            type $Shape = lingcat.methods.Ping_Response.$Properties;
        }

        /**
         * Properties of a User_Registration.
         * @deprecated Use lingcat.methods.User_Registration.$Properties instead.
         */
        interface IUser_Registration extends lingcat.methods.User_Registration.$Properties {
        }

        /** Represents a User_Registration. */
        class User_Registration {

            /**
             * Constructs a new User_Registration.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.User_Registration.$Properties);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];

            /** User_Registration username. */
            username?: (string|null);

            /** User_Registration password. */
            password: string;

            /**
             * Creates a new User_Registration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User_Registration instance
             */
            static create(properties: lingcat.methods.User_Registration.$Shape): lingcat.methods.User_Registration & lingcat.methods.User_Registration.$Shape;
            static create(properties?: lingcat.methods.User_Registration.$Properties): lingcat.methods.User_Registration;

            /**
             * Encodes the specified User_Registration message. Does not implicitly {@link lingcat.methods.User_Registration.verify|verify} messages.
             * @param message User_Registration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.User_Registration.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User_Registration message, length delimited. Does not implicitly {@link lingcat.methods.User_Registration.verify|verify} messages.
             * @param message User_Registration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.User_Registration.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User_Registration message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Registration & lingcat.methods.User_Registration.$Shape} User_Registration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.User_Registration & lingcat.methods.User_Registration.$Shape;

            /**
             * Decodes a User_Registration message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Registration & lingcat.methods.User_Registration.$Shape} User_Registration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.User_Registration & lingcat.methods.User_Registration.$Shape;

            /**
             * Verifies a User_Registration message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User_Registration message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User_Registration
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.User_Registration;

            /**
             * Creates a plain object from a User_Registration message. Also converts values to other types if specified.
             * @param message User_Registration
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.User_Registration, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User_Registration to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User_Registration
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User_Registration {

            /** Properties of a User_Registration. */
            interface $Properties {

                /** User_Registration username */
                username?: (string|null);

                /** User_Registration password */
                password?: (string|null);

                /** Unknown fields preserved while decoding */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User_Registration. */
            type $Shape = lingcat.methods.User_Registration.$Properties;
        }
    }
}
