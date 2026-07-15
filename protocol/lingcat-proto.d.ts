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

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** EncryptedMessage seq. */
            seq: number;

            /** EncryptedMessage iv. */
            iv: Uint8Array;

            /** EncryptedMessage data. */
            data: Uint8Array;

            /** EncryptedMessage aad. */
            aad: Uint8Array;

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

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an EncryptedMessage. */
            type $Shape = lingcat.classes.EncryptedMessage.$Properties;
        }

        /**
         * Properties of a IUser.
         * @deprecated Use lingcat.classes.IUser.$Properties instead.
         */
        interface IIUser extends lingcat.classes.IUser.$Properties {
        }

        /** Represents a IUser. */
        class IUser {

            /**
             * Constructs a new IUser.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IUser.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IUser id. */
            id: string;

            /** IUser username. */
            username?: (string|null);

            /** IUser nickname. */
            nickname: string;

            /** IUser description. */
            description?: (string|null);

            /** IUser avatarFileHash. */
            avatarFileHash?: (string|null);

            /**
             * Creates a new IUser instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IUser instance
             */
            static create(properties: lingcat.classes.IUser.$Shape): lingcat.classes.IUser & lingcat.classes.IUser.$Shape;
            static create(properties?: lingcat.classes.IUser.$Properties): lingcat.classes.IUser;

            /**
             * Encodes the specified IUser message. Does not implicitly {@link lingcat.classes.IUser.verify|verify} messages.
             * @param message IUser message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IUser.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IUser message, length delimited. Does not implicitly {@link lingcat.classes.IUser.verify|verify} messages.
             * @param message IUser message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IUser.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IUser message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IUser & lingcat.classes.IUser.$Shape} IUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IUser & lingcat.classes.IUser.$Shape;

            /**
             * Decodes a IUser message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IUser & lingcat.classes.IUser.$Shape} IUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IUser & lingcat.classes.IUser.$Shape;

            /**
             * Verifies a IUser message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IUser message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IUser
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IUser;

            /**
             * Creates a plain object from a IUser message. Also converts values to other types if specified.
             * @param message IUser
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IUser, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IUser to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IUser
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IUser {

            /** Properties of a IUser. */
            interface $Properties {

                /** IUser id */
                id?: (string|null);

                /** IUser username */
                username?: (string|null);

                /** IUser nickname */
                nickname?: (string|null);

                /** IUser description */
                description?: (string|null);

                /** IUser avatarFileHash */
                avatarFileHash?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IUser. */
            type $Shape = lingcat.classes.IUser.$Properties;
        }

        /**
         * Properties of a IChat.
         * @deprecated Use lingcat.classes.IChat.$Properties instead.
         */
        interface IIChat extends lingcat.classes.IChat.$Properties {
        }

        /** Represents a IChat. */
        class IChat {

            /**
             * Constructs a new IChat.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IChat.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IChat id. */
            id: string;

            /** IChat title. */
            title?: (string|null);

            /** IChat unique. */
            unique?: (string|null);

            /** IChat type. */
            type: string;

            /** IChat avatarFileHash. */
            avatarFileHash?: (string|null);

            /** IChat settings. */
            settings: string;

            /**
             * Creates a new IChat instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IChat instance
             */
            static create(properties: lingcat.classes.IChat.$Shape): lingcat.classes.IChat & lingcat.classes.IChat.$Shape;
            static create(properties?: lingcat.classes.IChat.$Properties): lingcat.classes.IChat;

            /**
             * Encodes the specified IChat message. Does not implicitly {@link lingcat.classes.IChat.verify|verify} messages.
             * @param message IChat message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IChat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IChat message, length delimited. Does not implicitly {@link lingcat.classes.IChat.verify|verify} messages.
             * @param message IChat message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IChat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IChat message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IChat & lingcat.classes.IChat.$Shape} IChat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IChat & lingcat.classes.IChat.$Shape;

            /**
             * Decodes a IChat message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IChat & lingcat.classes.IChat.$Shape} IChat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IChat & lingcat.classes.IChat.$Shape;

            /**
             * Verifies a IChat message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IChat message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IChat
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IChat;

            /**
             * Creates a plain object from a IChat message. Also converts values to other types if specified.
             * @param message IChat
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IChat, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IChat to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IChat
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IChat {

            /** Properties of a IChat. */
            interface $Properties {

                /** IChat id */
                id?: (string|null);

                /** IChat title */
                title?: (string|null);

                /** IChat unique */
                unique?: (string|null);

                /** IChat type */
                type?: (string|null);

                /** IChat avatarFileHash */
                avatarFileHash?: (string|null);

                /** IChat settings */
                settings?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IChat. */
            type $Shape = lingcat.classes.IChat.$Properties;
        }

        /**
         * Properties of a IFile.
         * @deprecated Use lingcat.classes.IFile.$Properties instead.
         */
        interface IIFile extends lingcat.classes.IFile.$Properties {
        }

        /** Represents a IFile. */
        class IFile {

            /**
             * Constructs a new IFile.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IFile.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IFile hash. */
            hash: string;

            /** IFile firstUploadFileName. */
            firstUploadFileName?: (string|null);

            /** IFile belongToChatId. */
            belongToChatId?: (string|null);

            /** IFile mime. */
            mime: string;

            /** IFile uploadedAt. */
            uploadedAt: (number|Long);

            /**
             * Creates a new IFile instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IFile instance
             */
            static create(properties: lingcat.classes.IFile.$Shape): lingcat.classes.IFile & lingcat.classes.IFile.$Shape;
            static create(properties?: lingcat.classes.IFile.$Properties): lingcat.classes.IFile;

            /**
             * Encodes the specified IFile message. Does not implicitly {@link lingcat.classes.IFile.verify|verify} messages.
             * @param message IFile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IFile.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IFile message, length delimited. Does not implicitly {@link lingcat.classes.IFile.verify|verify} messages.
             * @param message IFile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IFile.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IFile message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IFile & lingcat.classes.IFile.$Shape} IFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IFile & lingcat.classes.IFile.$Shape;

            /**
             * Decodes a IFile message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IFile & lingcat.classes.IFile.$Shape} IFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IFile & lingcat.classes.IFile.$Shape;

            /**
             * Verifies a IFile message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IFile message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IFile
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IFile;

            /**
             * Creates a plain object from a IFile message. Also converts values to other types if specified.
             * @param message IFile
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IFile, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IFile to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IFile
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IFile {

            /** Properties of a IFile. */
            interface $Properties {

                /** IFile hash */
                hash?: (string|null);

                /** IFile firstUploadFileName */
                firstUploadFileName?: (string|null);

                /** IFile belongToChatId */
                belongToChatId?: (string|null);

                /** IFile mime */
                mime?: (string|null);

                /** IFile uploadedAt */
                uploadedAt?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IFile. */
            type $Shape = lingcat.classes.IFile.$Properties;
        }

        /**
         * Properties of a IMessage.
         * @deprecated Use lingcat.classes.IMessage.$Properties instead.
         */
        interface IIMessage extends lingcat.classes.IMessage.$Properties {
        }

        /** Represents a IMessage. */
        class IMessage {

            /**
             * Constructs a new IMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IMessage.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IMessage id. */
            id: (number|Long);

            /** IMessage senderUserId. */
            senderUserId?: (string|null);

            /** IMessage system. */
            system?: (boolean|null);

            /** IMessage chatId. */
            chatId: string;

            /** IMessage text. */
            text: string;

            /** IMessage time. */
            time: (number|Long);

            /**
             * Creates a new IMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IMessage instance
             */
            static create(properties: lingcat.classes.IMessage.$Shape): lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape;
            static create(properties?: lingcat.classes.IMessage.$Properties): lingcat.classes.IMessage;

            /**
             * Encodes the specified IMessage message. Does not implicitly {@link lingcat.classes.IMessage.verify|verify} messages.
             * @param message IMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IMessage message, length delimited. Does not implicitly {@link lingcat.classes.IMessage.verify|verify} messages.
             * @param message IMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IMessage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape} IMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape;

            /**
             * Decodes a IMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape} IMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IMessage & lingcat.classes.IMessage.$Shape;

            /**
             * Verifies a IMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IMessage
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IMessage;

            /**
             * Creates a plain object from a IMessage message. Also converts values to other types if specified.
             * @param message IMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IMessage to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IMessage
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IMessage {

            /** Properties of a IMessage. */
            interface $Properties {

                /** IMessage id */
                id?: (number|Long|null);

                /** IMessage senderUserId */
                senderUserId?: (string|null);

                /** IMessage system */
                system?: (boolean|null);

                /** IMessage chatId */
                chatId?: (string|null);

                /** IMessage text */
                text?: (string|null);

                /** IMessage time */
                time?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IMessage. */
            type $Shape = lingcat.classes.IMessage.$Properties;
        }
    }

    /** Namespace methods. */
    namespace methods {

        /**
         * Properties of an Error_Response.
         * @deprecated Use lingcat.methods.Error_Response.$Properties instead.
         */
        interface IError_Response extends lingcat.methods.Error_Response.$Properties {
        }

        /** Represents an Error_Response. */
        class Error_Response {

            /**
             * Constructs a new Error_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Error_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Error_Response requestMethod. */
            requestMethod: number;

            /** Error_Response message. */
            message?: (string|null);

            /** Error_Response code. */
            code?: (number|null);

            /**
             * Creates a new Error_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Error_Response instance
             */
            static create(properties: lingcat.methods.Error_Response.$Shape): lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape;
            static create(properties?: lingcat.methods.Error_Response.$Properties): lingcat.methods.Error_Response;

            /**
             * Encodes the specified Error_Response message. Does not implicitly {@link lingcat.methods.Error_Response.verify|verify} messages.
             * @param message Error_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Error_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Error_Response message, length delimited. Does not implicitly {@link lingcat.methods.Error_Response.verify|verify} messages.
             * @param message Error_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Error_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Error_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape} Error_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape;

            /**
             * Decodes an Error_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape} Error_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Error_Response & lingcat.methods.Error_Response.$Shape;

            /**
             * Verifies an Error_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Error_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Error_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Error_Response;

            /**
             * Creates a plain object from an Error_Response message. Also converts values to other types if specified.
             * @param message Error_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Error_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Error_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Error_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Error_Response {

            /** Properties of an Error_Response. */
            interface $Properties {

                /** Error_Response requestMethod */
                requestMethod?: (number|null);

                /** Error_Response message */
                message?: (string|null);

                /** Error_Response code */
                code?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Error_Response. */
            type $Shape = lingcat.methods.Error_Response.$Properties;
        }

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

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** HandShake_Request clientPublicKey. */
            clientPublicKey: Uint8Array;

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

                /** HandShake_Request clientPublicKey */
                clientPublicKey?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
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

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** HandShake_Response salt. */
            salt: Uint8Array;

            /** HandShake_Response messageToBeVerify. */
            messageToBeVerify: Uint8Array;

            /** HandShake_Response serverPublicKey. */
            serverPublicKey: Uint8Array;

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

                /** HandShake_Response messageToBeVerify */
                messageToBeVerify?: (Uint8Array|null);

                /** HandShake_Response serverPublicKey */
                serverPublicKey?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
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

            /** Unknown fields preserved while decoding when enabled */
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

                /** Unknown fields preserved while decoding when enabled */
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

            /** Unknown fields preserved while decoding when enabled */
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

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Ping_Response. */
            type $Shape = lingcat.methods.Ping_Response.$Properties;
        }

        /**
         * Properties of a User_Registration_Request.
         * @deprecated Use lingcat.methods.User_Registration_Request.$Properties instead.
         */
        interface IUser_Registration_Request extends lingcat.methods.User_Registration_Request.$Properties {
        }

        /** Represents a User_Registration_Request. */
        class User_Registration_Request {

            /**
             * Constructs a new User_Registration_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.User_Registration_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** User_Registration_Request username. */
            username?: (string|null);

            /** User_Registration_Request password. */
            password: string;

            /** User_Registration_Request nickname. */
            nickname: string;

            /**
             * Creates a new User_Registration_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User_Registration_Request instance
             */
            static create(properties: lingcat.methods.User_Registration_Request.$Shape): lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape;
            static create(properties?: lingcat.methods.User_Registration_Request.$Properties): lingcat.methods.User_Registration_Request;

            /**
             * Encodes the specified User_Registration_Request message. Does not implicitly {@link lingcat.methods.User_Registration_Request.verify|verify} messages.
             * @param message User_Registration_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.User_Registration_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User_Registration_Request message, length delimited. Does not implicitly {@link lingcat.methods.User_Registration_Request.verify|verify} messages.
             * @param message User_Registration_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.User_Registration_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User_Registration_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape} User_Registration_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape;

            /**
             * Decodes a User_Registration_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape} User_Registration_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.User_Registration_Request & lingcat.methods.User_Registration_Request.$Shape;

            /**
             * Verifies a User_Registration_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User_Registration_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User_Registration_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.User_Registration_Request;

            /**
             * Creates a plain object from a User_Registration_Request message. Also converts values to other types if specified.
             * @param message User_Registration_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.User_Registration_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User_Registration_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User_Registration_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User_Registration_Request {

            /** Properties of a User_Registration_Request. */
            interface $Properties {

                /** User_Registration_Request username */
                username?: (string|null);

                /** User_Registration_Request password */
                password?: (string|null);

                /** User_Registration_Request nickname */
                nickname?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User_Registration_Request. */
            type $Shape = lingcat.methods.User_Registration_Request.$Properties;
        }

        /**
         * Properties of a User_Registration_Response.
         * @deprecated Use lingcat.methods.User_Registration_Response.$Properties instead.
         */
        interface IUser_Registration_Response extends lingcat.methods.User_Registration_Response.$Properties {
        }

        /** Represents a User_Registration_Response. */
        class User_Registration_Response {

            /**
             * Constructs a new User_Registration_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.User_Registration_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** User_Registration_Response id. */
            id: string;

            /**
             * Creates a new User_Registration_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User_Registration_Response instance
             */
            static create(properties: lingcat.methods.User_Registration_Response.$Shape): lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape;
            static create(properties?: lingcat.methods.User_Registration_Response.$Properties): lingcat.methods.User_Registration_Response;

            /**
             * Encodes the specified User_Registration_Response message. Does not implicitly {@link lingcat.methods.User_Registration_Response.verify|verify} messages.
             * @param message User_Registration_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.User_Registration_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User_Registration_Response message, length delimited. Does not implicitly {@link lingcat.methods.User_Registration_Response.verify|verify} messages.
             * @param message User_Registration_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.User_Registration_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User_Registration_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape} User_Registration_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape;

            /**
             * Decodes a User_Registration_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape} User_Registration_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.User_Registration_Response & lingcat.methods.User_Registration_Response.$Shape;

            /**
             * Verifies a User_Registration_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User_Registration_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User_Registration_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.User_Registration_Response;

            /**
             * Creates a plain object from a User_Registration_Response message. Also converts values to other types if specified.
             * @param message User_Registration_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.User_Registration_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User_Registration_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User_Registration_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User_Registration_Response {

            /** Properties of a User_Registration_Response. */
            interface $Properties {

                /** User_Registration_Response id */
                id?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User_Registration_Response. */
            type $Shape = lingcat.methods.User_Registration_Response.$Properties;
        }

        /**
         * Properties of a User_Login_Request.
         * @deprecated Use lingcat.methods.User_Login_Request.$Properties instead.
         */
        interface IUser_Login_Request extends lingcat.methods.User_Login_Request.$Properties {
        }

        /** Represents a User_Login_Request. */
        class User_Login_Request {

            /**
             * Constructs a new User_Login_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.User_Login_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** User_Login_Request account. */
            account: string;

            /** User_Login_Request password. */
            password: string;

            /**
             * Creates a new User_Login_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User_Login_Request instance
             */
            static create(properties: lingcat.methods.User_Login_Request.$Shape): lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape;
            static create(properties?: lingcat.methods.User_Login_Request.$Properties): lingcat.methods.User_Login_Request;

            /**
             * Encodes the specified User_Login_Request message. Does not implicitly {@link lingcat.methods.User_Login_Request.verify|verify} messages.
             * @param message User_Login_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.User_Login_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User_Login_Request message, length delimited. Does not implicitly {@link lingcat.methods.User_Login_Request.verify|verify} messages.
             * @param message User_Login_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.User_Login_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User_Login_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape} User_Login_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape;

            /**
             * Decodes a User_Login_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape} User_Login_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.User_Login_Request & lingcat.methods.User_Login_Request.$Shape;

            /**
             * Verifies a User_Login_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User_Login_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User_Login_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.User_Login_Request;

            /**
             * Creates a plain object from a User_Login_Request message. Also converts values to other types if specified.
             * @param message User_Login_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.User_Login_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User_Login_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User_Login_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User_Login_Request {

            /** Properties of a User_Login_Request. */
            interface $Properties {

                /** User_Login_Request account */
                account?: (string|null);

                /** User_Login_Request password */
                password?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User_Login_Request. */
            type $Shape = lingcat.methods.User_Login_Request.$Properties;
        }

        /**
         * Properties of a User_Login_Response.
         * @deprecated Use lingcat.methods.User_Login_Response.$Properties instead.
         */
        interface IUser_Login_Response extends lingcat.methods.User_Login_Response.$Properties {
        }

        /** Represents a User_Login_Response. */
        class User_Login_Response {

            /**
             * Constructs a new User_Login_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.User_Login_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** User_Login_Response accessToken. */
            accessToken: string;

            /**
             * Creates a new User_Login_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User_Login_Response instance
             */
            static create(properties: lingcat.methods.User_Login_Response.$Shape): lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape;
            static create(properties?: lingcat.methods.User_Login_Response.$Properties): lingcat.methods.User_Login_Response;

            /**
             * Encodes the specified User_Login_Response message. Does not implicitly {@link lingcat.methods.User_Login_Response.verify|verify} messages.
             * @param message User_Login_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.User_Login_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User_Login_Response message, length delimited. Does not implicitly {@link lingcat.methods.User_Login_Response.verify|verify} messages.
             * @param message User_Login_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.User_Login_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User_Login_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape} User_Login_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape;

            /**
             * Decodes a User_Login_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape} User_Login_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.User_Login_Response & lingcat.methods.User_Login_Response.$Shape;

            /**
             * Verifies a User_Login_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User_Login_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User_Login_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.User_Login_Response;

            /**
             * Creates a plain object from a User_Login_Response message. Also converts values to other types if specified.
             * @param message User_Login_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.User_Login_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User_Login_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for User_Login_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace User_Login_Response {

            /** Properties of a User_Login_Response. */
            interface $Properties {

                /** User_Login_Response accessToken */
                accessToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a User_Login_Response. */
            type $Shape = lingcat.methods.User_Login_Response.$Properties;
        }

        /**
         * Properties of a Request_File_Upload_Request.
         * @deprecated Use lingcat.methods.Request_File_Upload_Request.$Properties instead.
         */
        interface IRequest_File_Upload_Request extends lingcat.methods.Request_File_Upload_Request.$Properties {
        }

        /** Represents a Request_File_Upload_Request. */
        class Request_File_Upload_Request {

            /**
             * Constructs a new Request_File_Upload_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Request_File_Upload_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Request_File_Upload_Request accessToken. */
            accessToken: string;

            /**
             * Creates a new Request_File_Upload_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Request_File_Upload_Request instance
             */
            static create(properties: lingcat.methods.Request_File_Upload_Request.$Shape): lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape;
            static create(properties?: lingcat.methods.Request_File_Upload_Request.$Properties): lingcat.methods.Request_File_Upload_Request;

            /**
             * Encodes the specified Request_File_Upload_Request message. Does not implicitly {@link lingcat.methods.Request_File_Upload_Request.verify|verify} messages.
             * @param message Request_File_Upload_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Request_File_Upload_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Request_File_Upload_Request message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Upload_Request.verify|verify} messages.
             * @param message Request_File_Upload_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Request_File_Upload_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Request_File_Upload_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape} Request_File_Upload_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape;

            /**
             * Decodes a Request_File_Upload_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape} Request_File_Upload_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Request_File_Upload_Request & lingcat.methods.Request_File_Upload_Request.$Shape;

            /**
             * Verifies a Request_File_Upload_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Request_File_Upload_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Request_File_Upload_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Request_File_Upload_Request;

            /**
             * Creates a plain object from a Request_File_Upload_Request message. Also converts values to other types if specified.
             * @param message Request_File_Upload_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Request_File_Upload_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Request_File_Upload_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Request_File_Upload_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Request_File_Upload_Request {

            /** Properties of a Request_File_Upload_Request. */
            interface $Properties {

                /** Request_File_Upload_Request accessToken */
                accessToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Request_File_Upload_Request. */
            type $Shape = lingcat.methods.Request_File_Upload_Request.$Properties;
        }

        /**
         * Properties of a Request_File_Upload_Response.
         * @deprecated Use lingcat.methods.Request_File_Upload_Response.$Properties instead.
         */
        interface IRequest_File_Upload_Response extends lingcat.methods.Request_File_Upload_Response.$Properties {
        }

        /** Represents a Request_File_Upload_Response. */
        class Request_File_Upload_Response {

            /**
             * Constructs a new Request_File_Upload_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Request_File_Upload_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Request_File_Upload_Response token. */
            token: string;

            /**
             * Creates a new Request_File_Upload_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Request_File_Upload_Response instance
             */
            static create(properties: lingcat.methods.Request_File_Upload_Response.$Shape): lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape;
            static create(properties?: lingcat.methods.Request_File_Upload_Response.$Properties): lingcat.methods.Request_File_Upload_Response;

            /**
             * Encodes the specified Request_File_Upload_Response message. Does not implicitly {@link lingcat.methods.Request_File_Upload_Response.verify|verify} messages.
             * @param message Request_File_Upload_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Request_File_Upload_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Request_File_Upload_Response message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Upload_Response.verify|verify} messages.
             * @param message Request_File_Upload_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Request_File_Upload_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Request_File_Upload_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape} Request_File_Upload_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape;

            /**
             * Decodes a Request_File_Upload_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape} Request_File_Upload_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Request_File_Upload_Response & lingcat.methods.Request_File_Upload_Response.$Shape;

            /**
             * Verifies a Request_File_Upload_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Request_File_Upload_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Request_File_Upload_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Request_File_Upload_Response;

            /**
             * Creates a plain object from a Request_File_Upload_Response message. Also converts values to other types if specified.
             * @param message Request_File_Upload_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Request_File_Upload_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Request_File_Upload_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Request_File_Upload_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Request_File_Upload_Response {

            /** Properties of a Request_File_Upload_Response. */
            interface $Properties {

                /** Request_File_Upload_Response token */
                token?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Request_File_Upload_Response. */
            type $Shape = lingcat.methods.Request_File_Upload_Response.$Properties;
        }

        /**
         * Properties of a Request_File_Access_Request.
         * @deprecated Use lingcat.methods.Request_File_Access_Request.$Properties instead.
         */
        interface IRequest_File_Access_Request extends lingcat.methods.Request_File_Access_Request.$Properties {
        }

        /** Represents a Request_File_Access_Request. */
        class Request_File_Access_Request {

            /**
             * Constructs a new Request_File_Access_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Request_File_Access_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Request_File_Access_Request accessToken. */
            accessToken: string;

            /**
             * Creates a new Request_File_Access_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Request_File_Access_Request instance
             */
            static create(properties: lingcat.methods.Request_File_Access_Request.$Shape): lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape;
            static create(properties?: lingcat.methods.Request_File_Access_Request.$Properties): lingcat.methods.Request_File_Access_Request;

            /**
             * Encodes the specified Request_File_Access_Request message. Does not implicitly {@link lingcat.methods.Request_File_Access_Request.verify|verify} messages.
             * @param message Request_File_Access_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Request_File_Access_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Request_File_Access_Request message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Access_Request.verify|verify} messages.
             * @param message Request_File_Access_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Request_File_Access_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Request_File_Access_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape} Request_File_Access_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape;

            /**
             * Decodes a Request_File_Access_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape} Request_File_Access_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Request_File_Access_Request & lingcat.methods.Request_File_Access_Request.$Shape;

            /**
             * Verifies a Request_File_Access_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Request_File_Access_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Request_File_Access_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Request_File_Access_Request;

            /**
             * Creates a plain object from a Request_File_Access_Request message. Also converts values to other types if specified.
             * @param message Request_File_Access_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Request_File_Access_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Request_File_Access_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Request_File_Access_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Request_File_Access_Request {

            /** Properties of a Request_File_Access_Request. */
            interface $Properties {

                /** Request_File_Access_Request accessToken */
                accessToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Request_File_Access_Request. */
            type $Shape = lingcat.methods.Request_File_Access_Request.$Properties;
        }

        /**
         * Properties of a Request_File_Access_Response.
         * @deprecated Use lingcat.methods.Request_File_Access_Response.$Properties instead.
         */
        interface IRequest_File_Access_Response extends lingcat.methods.Request_File_Access_Response.$Properties {
        }

        /** Represents a Request_File_Access_Response. */
        class Request_File_Access_Response {

            /**
             * Constructs a new Request_File_Access_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Request_File_Access_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Request_File_Access_Response token. */
            token: string;

            /**
             * Creates a new Request_File_Access_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Request_File_Access_Response instance
             */
            static create(properties: lingcat.methods.Request_File_Access_Response.$Shape): lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape;
            static create(properties?: lingcat.methods.Request_File_Access_Response.$Properties): lingcat.methods.Request_File_Access_Response;

            /**
             * Encodes the specified Request_File_Access_Response message. Does not implicitly {@link lingcat.methods.Request_File_Access_Response.verify|verify} messages.
             * @param message Request_File_Access_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Request_File_Access_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Request_File_Access_Response message, length delimited. Does not implicitly {@link lingcat.methods.Request_File_Access_Response.verify|verify} messages.
             * @param message Request_File_Access_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Request_File_Access_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Request_File_Access_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape} Request_File_Access_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape;

            /**
             * Decodes a Request_File_Access_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape} Request_File_Access_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Request_File_Access_Response & lingcat.methods.Request_File_Access_Response.$Shape;

            /**
             * Verifies a Request_File_Access_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Request_File_Access_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Request_File_Access_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Request_File_Access_Response;

            /**
             * Creates a plain object from a Request_File_Access_Response message. Also converts values to other types if specified.
             * @param message Request_File_Access_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Request_File_Access_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Request_File_Access_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Request_File_Access_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Request_File_Access_Response {

            /** Properties of a Request_File_Access_Response. */
            interface $Properties {

                /** Request_File_Access_Response token */
                token?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Request_File_Access_Response. */
            type $Shape = lingcat.methods.Request_File_Access_Response.$Properties;
        }

        /**
         * Properties of an Authorize_Request.
         * @deprecated Use lingcat.methods.Authorize_Request.$Properties instead.
         */
        interface IAuthorize_Request extends lingcat.methods.Authorize_Request.$Properties {
        }

        /** Represents an Authorize_Request. */
        class Authorize_Request {

            /**
             * Constructs a new Authorize_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Authorize_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Authorize_Request accessToken. */
            accessToken: string;

            /**
             * Creates a new Authorize_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Authorize_Request instance
             */
            static create(properties: lingcat.methods.Authorize_Request.$Shape): lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape;
            static create(properties?: lingcat.methods.Authorize_Request.$Properties): lingcat.methods.Authorize_Request;

            /**
             * Encodes the specified Authorize_Request message. Does not implicitly {@link lingcat.methods.Authorize_Request.verify|verify} messages.
             * @param message Authorize_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Authorize_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Authorize_Request message, length delimited. Does not implicitly {@link lingcat.methods.Authorize_Request.verify|verify} messages.
             * @param message Authorize_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Authorize_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Authorize_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape} Authorize_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape;

            /**
             * Decodes an Authorize_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape} Authorize_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Authorize_Request & lingcat.methods.Authorize_Request.$Shape;

            /**
             * Verifies an Authorize_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Authorize_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Authorize_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Authorize_Request;

            /**
             * Creates a plain object from an Authorize_Request message. Also converts values to other types if specified.
             * @param message Authorize_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Authorize_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Authorize_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Authorize_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Authorize_Request {

            /** Properties of an Authorize_Request. */
            interface $Properties {

                /** Authorize_Request accessToken */
                accessToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Authorize_Request. */
            type $Shape = lingcat.methods.Authorize_Request.$Properties;
        }

        /**
         * Properties of an Authorize_Response.
         * @deprecated Use lingcat.methods.Authorize_Response.$Properties instead.
         */
        interface IAuthorize_Response extends lingcat.methods.Authorize_Response.$Properties {
        }

        /** Represents an Authorize_Response. */
        class Authorize_Response {

            /**
             * Constructs a new Authorize_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Authorize_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Authorize_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Authorize_Response instance
             */
            static create(properties: lingcat.methods.Authorize_Response.$Shape): lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape;
            static create(properties?: lingcat.methods.Authorize_Response.$Properties): lingcat.methods.Authorize_Response;

            /**
             * Encodes the specified Authorize_Response message. Does not implicitly {@link lingcat.methods.Authorize_Response.verify|verify} messages.
             * @param message Authorize_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Authorize_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Authorize_Response message, length delimited. Does not implicitly {@link lingcat.methods.Authorize_Response.verify|verify} messages.
             * @param message Authorize_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Authorize_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Authorize_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape} Authorize_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape;

            /**
             * Decodes an Authorize_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape} Authorize_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Authorize_Response & lingcat.methods.Authorize_Response.$Shape;

            /**
             * Verifies an Authorize_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Authorize_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Authorize_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Authorize_Response;

            /**
             * Creates a plain object from an Authorize_Response message. Also converts values to other types if specified.
             * @param message Authorize_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Authorize_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Authorize_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Authorize_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Authorize_Response {

            /** Properties of an Authorize_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Authorize_Response. */
            type $Shape = lingcat.methods.Authorize_Response.$Properties;
        }

        /**
         * Properties of a Query_User_Info_Request.
         * @deprecated Use lingcat.methods.Query_User_Info_Request.$Properties instead.
         */
        interface IQuery_User_Info_Request extends lingcat.methods.Query_User_Info_Request.$Properties {
        }

        /** Represents a Query_User_Info_Request. */
        class Query_User_Info_Request {

            /**
             * Constructs a new Query_User_Info_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_User_Info_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_User_Info_Request accessToken. */
            accessToken: string;

            /** Query_User_Info_Request userId. */
            userId: string;

            /**
             * Creates a new Query_User_Info_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_User_Info_Request instance
             */
            static create(properties: lingcat.methods.Query_User_Info_Request.$Shape): lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape;
            static create(properties?: lingcat.methods.Query_User_Info_Request.$Properties): lingcat.methods.Query_User_Info_Request;

            /**
             * Encodes the specified Query_User_Info_Request message. Does not implicitly {@link lingcat.methods.Query_User_Info_Request.verify|verify} messages.
             * @param message Query_User_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_User_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_User_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_User_Info_Request.verify|verify} messages.
             * @param message Query_User_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_User_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_User_Info_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape} Query_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape;

            /**
             * Decodes a Query_User_Info_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape} Query_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_User_Info_Request & lingcat.methods.Query_User_Info_Request.$Shape;

            /**
             * Verifies a Query_User_Info_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_User_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_User_Info_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_User_Info_Request;

            /**
             * Creates a plain object from a Query_User_Info_Request message. Also converts values to other types if specified.
             * @param message Query_User_Info_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_User_Info_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_User_Info_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_User_Info_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_User_Info_Request {

            /** Properties of a Query_User_Info_Request. */
            interface $Properties {

                /** Query_User_Info_Request accessToken */
                accessToken?: (string|null);

                /** Query_User_Info_Request userId */
                userId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_User_Info_Request. */
            type $Shape = lingcat.methods.Query_User_Info_Request.$Properties;
        }

        /**
         * Properties of a Query_My_User_Info_Request.
         * @deprecated Use lingcat.methods.Query_My_User_Info_Request.$Properties instead.
         */
        interface IQuery_My_User_Info_Request extends lingcat.methods.Query_My_User_Info_Request.$Properties {
        }

        /** Represents a Query_My_User_Info_Request. */
        class Query_My_User_Info_Request {

            /**
             * Constructs a new Query_My_User_Info_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_My_User_Info_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_My_User_Info_Request accessToken. */
            accessToken: string;

            /**
             * Creates a new Query_My_User_Info_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_My_User_Info_Request instance
             */
            static create(properties: lingcat.methods.Query_My_User_Info_Request.$Shape): lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape;
            static create(properties?: lingcat.methods.Query_My_User_Info_Request.$Properties): lingcat.methods.Query_My_User_Info_Request;

            /**
             * Encodes the specified Query_My_User_Info_Request message. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Request.verify|verify} messages.
             * @param message Query_My_User_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_My_User_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_My_User_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Request.verify|verify} messages.
             * @param message Query_My_User_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_My_User_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_My_User_Info_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape} Query_My_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape;

            /**
             * Decodes a Query_My_User_Info_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape} Query_My_User_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_My_User_Info_Request & lingcat.methods.Query_My_User_Info_Request.$Shape;

            /**
             * Verifies a Query_My_User_Info_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_My_User_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_My_User_Info_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_My_User_Info_Request;

            /**
             * Creates a plain object from a Query_My_User_Info_Request message. Also converts values to other types if specified.
             * @param message Query_My_User_Info_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_My_User_Info_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_My_User_Info_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_My_User_Info_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_My_User_Info_Request {

            /** Properties of a Query_My_User_Info_Request. */
            interface $Properties {

                /** Query_My_User_Info_Request accessToken */
                accessToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_My_User_Info_Request. */
            type $Shape = lingcat.methods.Query_My_User_Info_Request.$Properties;
        }

        /**
         * Properties of a Query_User_Info_Response.
         * @deprecated Use lingcat.methods.Query_User_Info_Response.$Properties instead.
         */
        interface IQuery_User_Info_Response extends lingcat.methods.Query_User_Info_Response.$Properties {
        }

        /** see { @link classes-interfaces.ts } */
        class Query_User_Info_Response {

            /**
             * Constructs a new Query_User_Info_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_User_Info_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_User_Info_Response info. */
            info?: (lingcat.classes.IUser.$Properties|null);

            /**
             * Creates a new Query_User_Info_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_User_Info_Response instance
             */
            static create(properties: lingcat.methods.Query_User_Info_Response.$Shape): lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape;
            static create(properties?: lingcat.methods.Query_User_Info_Response.$Properties): lingcat.methods.Query_User_Info_Response;

            /**
             * Encodes the specified Query_User_Info_Response message. Does not implicitly {@link lingcat.methods.Query_User_Info_Response.verify|verify} messages.
             * @param message Query_User_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_User_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_User_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_User_Info_Response.verify|verify} messages.
             * @param message Query_User_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_User_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_User_Info_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape} Query_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape;

            /**
             * Decodes a Query_User_Info_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape} Query_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_User_Info_Response & lingcat.methods.Query_User_Info_Response.$Shape;

            /**
             * Verifies a Query_User_Info_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_User_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_User_Info_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_User_Info_Response;

            /**
             * Creates a plain object from a Query_User_Info_Response message. Also converts values to other types if specified.
             * @param message Query_User_Info_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_User_Info_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_User_Info_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_User_Info_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_User_Info_Response {

            /** Properties of a Query_User_Info_Response. */
            interface $Properties {

                /** Query_User_Info_Response info */
                info?: (lingcat.classes.IUser.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_User_Info_Response. */
            type $Shape = lingcat.methods.Query_User_Info_Response.$Properties;
        }

        /**
         * Properties of a Query_My_User_Info_Response.
         * @deprecated Use lingcat.methods.Query_My_User_Info_Response.$Properties instead.
         */
        interface IQuery_My_User_Info_Response extends lingcat.methods.Query_My_User_Info_Response.$Properties {
        }

        /** Represents a Query_My_User_Info_Response. */
        class Query_My_User_Info_Response {

            /**
             * Constructs a new Query_My_User_Info_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_My_User_Info_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_My_User_Info_Response info. */
            info?: (lingcat.classes.IUser.$Properties|null);

            /**
             * Creates a new Query_My_User_Info_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_My_User_Info_Response instance
             */
            static create(properties: lingcat.methods.Query_My_User_Info_Response.$Shape): lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape;
            static create(properties?: lingcat.methods.Query_My_User_Info_Response.$Properties): lingcat.methods.Query_My_User_Info_Response;

            /**
             * Encodes the specified Query_My_User_Info_Response message. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Response.verify|verify} messages.
             * @param message Query_My_User_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_My_User_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_My_User_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_My_User_Info_Response.verify|verify} messages.
             * @param message Query_My_User_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_My_User_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_My_User_Info_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape} Query_My_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape;

            /**
             * Decodes a Query_My_User_Info_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape} Query_My_User_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_My_User_Info_Response & lingcat.methods.Query_My_User_Info_Response.$Shape;

            /**
             * Verifies a Query_My_User_Info_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_My_User_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_My_User_Info_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_My_User_Info_Response;

            /**
             * Creates a plain object from a Query_My_User_Info_Response message. Also converts values to other types if specified.
             * @param message Query_My_User_Info_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_My_User_Info_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_My_User_Info_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_My_User_Info_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_My_User_Info_Response {

            /** Properties of a Query_My_User_Info_Response. */
            interface $Properties {

                /** Query_My_User_Info_Response info */
                info?: (lingcat.classes.IUser.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_My_User_Info_Response. */
            type $Shape = lingcat.methods.Query_My_User_Info_Response.$Properties;
        }

        /**
         * Properties of an Update_My_Profile_Request.
         * @deprecated Use lingcat.methods.Update_My_Profile_Request.$Properties instead.
         */
        interface IUpdate_My_Profile_Request extends lingcat.methods.Update_My_Profile_Request.$Properties {
        }

        /** Represents an Update_My_Profile_Request. */
        class Update_My_Profile_Request {

            /**
             * Constructs a new Update_My_Profile_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_My_Profile_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Update_My_Profile_Request accessToken. */
            accessToken: string;

            /** Update_My_Profile_Request avatarFileHash. */
            avatarFileHash?: (string|null);

            /** Update_My_Profile_Request username. */
            username?: (string|null);

            /** Update_My_Profile_Request nickname. */
            nickname?: (string|null);

            /** Update_My_Profile_Request description. */
            description?: (string|null);

            /**
             * Creates a new Update_My_Profile_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_My_Profile_Request instance
             */
            static create(properties: lingcat.methods.Update_My_Profile_Request.$Shape): lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape;
            static create(properties?: lingcat.methods.Update_My_Profile_Request.$Properties): lingcat.methods.Update_My_Profile_Request;

            /**
             * Encodes the specified Update_My_Profile_Request message. Does not implicitly {@link lingcat.methods.Update_My_Profile_Request.verify|verify} messages.
             * @param message Update_My_Profile_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_My_Profile_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_My_Profile_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Profile_Request.verify|verify} messages.
             * @param message Update_My_Profile_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_My_Profile_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_My_Profile_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape} Update_My_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape;

            /**
             * Decodes an Update_My_Profile_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape} Update_My_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_My_Profile_Request & lingcat.methods.Update_My_Profile_Request.$Shape;

            /**
             * Verifies an Update_My_Profile_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_My_Profile_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_My_Profile_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_My_Profile_Request;

            /**
             * Creates a plain object from an Update_My_Profile_Request message. Also converts values to other types if specified.
             * @param message Update_My_Profile_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_My_Profile_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_My_Profile_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_My_Profile_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_My_Profile_Request {

            /** Properties of an Update_My_Profile_Request. */
            interface $Properties {

                /** Update_My_Profile_Request accessToken */
                accessToken?: (string|null);

                /** Update_My_Profile_Request avatarFileHash */
                avatarFileHash?: (string|null);

                /** Update_My_Profile_Request username */
                username?: (string|null);

                /** Update_My_Profile_Request nickname */
                nickname?: (string|null);

                /** Update_My_Profile_Request description */
                description?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_My_Profile_Request. */
            type $Shape = lingcat.methods.Update_My_Profile_Request.$Properties;
        }

        /**
         * Properties of an Update_My_Profile_Response.
         * @deprecated Use lingcat.methods.Update_My_Profile_Response.$Properties instead.
         */
        interface IUpdate_My_Profile_Response extends lingcat.methods.Update_My_Profile_Response.$Properties {
        }

        /** Represents an Update_My_Profile_Response. */
        class Update_My_Profile_Response {

            /**
             * Constructs a new Update_My_Profile_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_My_Profile_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Update_My_Profile_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_My_Profile_Response instance
             */
            static create(properties: lingcat.methods.Update_My_Profile_Response.$Shape): lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape;
            static create(properties?: lingcat.methods.Update_My_Profile_Response.$Properties): lingcat.methods.Update_My_Profile_Response;

            /**
             * Encodes the specified Update_My_Profile_Response message. Does not implicitly {@link lingcat.methods.Update_My_Profile_Response.verify|verify} messages.
             * @param message Update_My_Profile_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_My_Profile_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_My_Profile_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Profile_Response.verify|verify} messages.
             * @param message Update_My_Profile_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_My_Profile_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_My_Profile_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape} Update_My_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape;

            /**
             * Decodes an Update_My_Profile_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape} Update_My_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_My_Profile_Response & lingcat.methods.Update_My_Profile_Response.$Shape;

            /**
             * Verifies an Update_My_Profile_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_My_Profile_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_My_Profile_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_My_Profile_Response;

            /**
             * Creates a plain object from an Update_My_Profile_Response message. Also converts values to other types if specified.
             * @param message Update_My_Profile_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_My_Profile_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_My_Profile_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_My_Profile_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_My_Profile_Response {

            /** Properties of an Update_My_Profile_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_My_Profile_Response. */
            type $Shape = lingcat.methods.Update_My_Profile_Response.$Properties;
        }

        /**
         * Properties of an Update_Chat_Avatar_Request.
         * @deprecated Use lingcat.methods.Update_Chat_Avatar_Request.$Properties instead.
         */
        interface IUpdate_Chat_Avatar_Request extends lingcat.methods.Update_Chat_Avatar_Request.$Properties {
        }

        /** Represents an Update_Chat_Avatar_Request. */
        class Update_Chat_Avatar_Request {

            /**
             * Constructs a new Update_Chat_Avatar_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Avatar_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Update_Chat_Avatar_Request accessToken. */
            accessToken: string;

            /** Update_Chat_Avatar_Request chatId. */
            chatId: string;

            /** Update_Chat_Avatar_Request fileHash. */
            fileHash: string;

            /**
             * Creates a new Update_Chat_Avatar_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Avatar_Request instance
             */
            static create(properties: lingcat.methods.Update_Chat_Avatar_Request.$Shape): lingcat.methods.Update_Chat_Avatar_Request & lingcat.methods.Update_Chat_Avatar_Request.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Avatar_Request.$Properties): lingcat.methods.Update_Chat_Avatar_Request;

            /**
             * Encodes the specified Update_Chat_Avatar_Request message. Does not implicitly {@link lingcat.methods.Update_Chat_Avatar_Request.verify|verify} messages.
             * @param message Update_Chat_Avatar_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Avatar_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Avatar_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Avatar_Request.verify|verify} messages.
             * @param message Update_Chat_Avatar_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Avatar_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Avatar_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Avatar_Request & lingcat.methods.Update_Chat_Avatar_Request.$Shape} Update_Chat_Avatar_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Avatar_Request & lingcat.methods.Update_Chat_Avatar_Request.$Shape;

            /**
             * Decodes an Update_Chat_Avatar_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Avatar_Request & lingcat.methods.Update_Chat_Avatar_Request.$Shape} Update_Chat_Avatar_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Avatar_Request & lingcat.methods.Update_Chat_Avatar_Request.$Shape;

            /**
             * Verifies an Update_Chat_Avatar_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Avatar_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Avatar_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Avatar_Request;

            /**
             * Creates a plain object from an Update_Chat_Avatar_Request message. Also converts values to other types if specified.
             * @param message Update_Chat_Avatar_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Avatar_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Avatar_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Avatar_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Avatar_Request {

            /** Properties of an Update_Chat_Avatar_Request. */
            interface $Properties {

                /** Update_Chat_Avatar_Request accessToken */
                accessToken?: (string|null);

                /** Update_Chat_Avatar_Request chatId */
                chatId?: (string|null);

                /** Update_Chat_Avatar_Request fileHash */
                fileHash?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Avatar_Request. */
            type $Shape = lingcat.methods.Update_Chat_Avatar_Request.$Properties;
        }

        /**
         * Properties of an Update_Chat_Avatar_Response.
         * @deprecated Use lingcat.methods.Update_Chat_Avatar_Response.$Properties instead.
         */
        interface IUpdate_Chat_Avatar_Response extends lingcat.methods.Update_Chat_Avatar_Response.$Properties {
        }

        /** Represents an Update_Chat_Avatar_Response. */
        class Update_Chat_Avatar_Response {

            /**
             * Constructs a new Update_Chat_Avatar_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Avatar_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Update_Chat_Avatar_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Avatar_Response instance
             */
            static create(properties: lingcat.methods.Update_Chat_Avatar_Response.$Shape): lingcat.methods.Update_Chat_Avatar_Response & lingcat.methods.Update_Chat_Avatar_Response.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Avatar_Response.$Properties): lingcat.methods.Update_Chat_Avatar_Response;

            /**
             * Encodes the specified Update_Chat_Avatar_Response message. Does not implicitly {@link lingcat.methods.Update_Chat_Avatar_Response.verify|verify} messages.
             * @param message Update_Chat_Avatar_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Avatar_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Avatar_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Avatar_Response.verify|verify} messages.
             * @param message Update_Chat_Avatar_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Avatar_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Avatar_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Avatar_Response & lingcat.methods.Update_Chat_Avatar_Response.$Shape} Update_Chat_Avatar_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Avatar_Response & lingcat.methods.Update_Chat_Avatar_Response.$Shape;

            /**
             * Decodes an Update_Chat_Avatar_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Avatar_Response & lingcat.methods.Update_Chat_Avatar_Response.$Shape} Update_Chat_Avatar_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Avatar_Response & lingcat.methods.Update_Chat_Avatar_Response.$Shape;

            /**
             * Verifies an Update_Chat_Avatar_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Avatar_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Avatar_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Avatar_Response;

            /**
             * Creates a plain object from an Update_Chat_Avatar_Response message. Also converts values to other types if specified.
             * @param message Update_Chat_Avatar_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Avatar_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Avatar_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Avatar_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Avatar_Response {

            /** Properties of an Update_Chat_Avatar_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Avatar_Response. */
            type $Shape = lingcat.methods.Update_Chat_Avatar_Response.$Properties;
        }

        /**
         * Properties of a Get_Chat_Messages_Request.
         * @deprecated Use lingcat.methods.Get_Chat_Messages_Request.$Properties instead.
         */
        interface IGet_Chat_Messages_Request extends lingcat.methods.Get_Chat_Messages_Request.$Properties {
        }

        /** Represents a Get_Chat_Messages_Request. */
        class Get_Chat_Messages_Request {

            /**
             * Constructs a new Get_Chat_Messages_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Messages_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Messages_Request accessToken. */
            accessToken: string;

            /** Get_Chat_Messages_Request chatId. */
            chatId: string;

            /** Get_Chat_Messages_Request before. */
            before?: (number|Long|null);

            /** Get_Chat_Messages_Request after. */
            after?: (number|Long|null);

            /** Get_Chat_Messages_Request limit. */
            limit?: (number|null);

            /**
             * Creates a new Get_Chat_Messages_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Messages_Request instance
             */
            static create(properties: lingcat.methods.Get_Chat_Messages_Request.$Shape): lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Messages_Request.$Properties): lingcat.methods.Get_Chat_Messages_Request;

            /**
             * Encodes the specified Get_Chat_Messages_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Request.verify|verify} messages.
             * @param message Get_Chat_Messages_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Messages_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Messages_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Request.verify|verify} messages.
             * @param message Get_Chat_Messages_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Messages_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Messages_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape} Get_Chat_Messages_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape;

            /**
             * Decodes a Get_Chat_Messages_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape} Get_Chat_Messages_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Messages_Request & lingcat.methods.Get_Chat_Messages_Request.$Shape;

            /**
             * Verifies a Get_Chat_Messages_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Messages_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Messages_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Messages_Request;

            /**
             * Creates a plain object from a Get_Chat_Messages_Request message. Also converts values to other types if specified.
             * @param message Get_Chat_Messages_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Messages_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Messages_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Messages_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Messages_Request {

            /** Properties of a Get_Chat_Messages_Request. */
            interface $Properties {

                /** Get_Chat_Messages_Request accessToken */
                accessToken?: (string|null);

                /** Get_Chat_Messages_Request chatId */
                chatId?: (string|null);

                /** Get_Chat_Messages_Request before */
                before?: (number|Long|null);

                /** Get_Chat_Messages_Request after */
                after?: (number|Long|null);

                /** Get_Chat_Messages_Request limit */
                limit?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Messages_Request. */
            type $Shape = lingcat.methods.Get_Chat_Messages_Request.$Properties;
        }
    }
}
