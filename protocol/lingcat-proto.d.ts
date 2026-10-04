import * as $protobuf from "protobufjs/minimal.js";
import Long = require("long");

/** Namespace lingcat. */
export namespace lingcat {

    /** Namespace classes. */
    namespace classes {

        /**
         * Properties of a Package.
         * @deprecated Use lingcat.classes.Package.$Properties instead.
         */
        interface IPackage extends lingcat.classes.Package.$Properties {
        }

        /** Represents a Package. */
        class Package {

            /**
             * Constructs a new Package.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.Package.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Package methodId. */
            methodId: number;

            /** Package flags. */
            flags: number;

            /** Package requestId. */
            requestId: Uint8Array;

            /** Package seq. */
            seq: number;

            /** Package data. */
            data: Uint8Array;

            /** Package iv. */
            iv: Uint8Array;

            /** Package aad. */
            aad: Uint8Array;

            /** Package tag. */
            tag: Uint8Array;

            /** Package originServer. */
            originServer?: (string|null);

            /** Package signature. */
            signature?: (Uint8Array|null);

            /** Package protocolVersion. */
            protocolVersion?: (number|null);

            /**
             * Creates a new Package instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Package instance
             */
            static create(properties: lingcat.classes.Package.$Shape): lingcat.classes.Package & lingcat.classes.Package.$Shape;
            static create(properties?: lingcat.classes.Package.$Properties): lingcat.classes.Package;

            /**
             * Encodes the specified Package message. Does not implicitly {@link lingcat.classes.Package.verify|verify} messages.
             * @param message Package message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.Package.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Package message, length delimited. Does not implicitly {@link lingcat.classes.Package.verify|verify} messages.
             * @param message Package message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.Package.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Package message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.Package & lingcat.classes.Package.$Shape} Package
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.Package & lingcat.classes.Package.$Shape;

            /**
             * Decodes a Package message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.Package & lingcat.classes.Package.$Shape} Package
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.Package & lingcat.classes.Package.$Shape;

            /**
             * Verifies a Package message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Package message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Package
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.Package;

            /**
             * Creates a plain object from a Package message. Also converts values to other types if specified.
             * @param message Package
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.Package, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Package to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Package
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Package {

            /** Properties of a Package. */
            interface $Properties {

                /** Package methodId */
                methodId?: (number|null);

                /** Package flags */
                flags?: (number|null);

                /** Package requestId */
                requestId?: (Uint8Array|null);

                /** Package seq */
                seq?: (number|null);

                /** Package data */
                data?: (Uint8Array|null);

                /** Package iv */
                iv?: (Uint8Array|null);

                /** Package aad */
                aad?: (Uint8Array|null);

                /** Package tag */
                tag?: (Uint8Array|null);

                /** Package originServer */
                originServer?: (string|null);

                /** Package signature */
                signature?: (Uint8Array|null);

                /** Package protocolVersion */
                protocolVersion?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Package. */
            type $Shape = lingcat.classes.Package.$Properties;
        }

        /**
         * Properties of a FederationPackage.
         * @deprecated Use lingcat.classes.FederationPackage.$Properties instead.
         */
        interface IFederationPackage extends lingcat.classes.FederationPackage.$Properties {
        }

        /** Represents a FederationPackage. */
        class FederationPackage {

            /**
             * Constructs a new FederationPackage.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.FederationPackage.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** FederationPackage originServer. */
            originServer: string;

            /** FederationPackage targetServer. */
            targetServer: string;

            /** FederationPackage timestamp. */
            timestamp: (number|Long);

            /** FederationPackage payload. */
            payload: Uint8Array;

            /** FederationPackage signature. */
            signature: Uint8Array;

            /**
             * Creates a new FederationPackage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FederationPackage instance
             */
            static create(properties: lingcat.classes.FederationPackage.$Shape): lingcat.classes.FederationPackage & lingcat.classes.FederationPackage.$Shape;
            static create(properties?: lingcat.classes.FederationPackage.$Properties): lingcat.classes.FederationPackage;

            /**
             * Encodes the specified FederationPackage message. Does not implicitly {@link lingcat.classes.FederationPackage.verify|verify} messages.
             * @param message FederationPackage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.FederationPackage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FederationPackage message, length delimited. Does not implicitly {@link lingcat.classes.FederationPackage.verify|verify} messages.
             * @param message FederationPackage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.FederationPackage.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FederationPackage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.FederationPackage & lingcat.classes.FederationPackage.$Shape} FederationPackage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.FederationPackage & lingcat.classes.FederationPackage.$Shape;

            /**
             * Decodes a FederationPackage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.FederationPackage & lingcat.classes.FederationPackage.$Shape} FederationPackage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.FederationPackage & lingcat.classes.FederationPackage.$Shape;

            /**
             * Verifies a FederationPackage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FederationPackage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FederationPackage
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.FederationPackage;

            /**
             * Creates a plain object from a FederationPackage message. Also converts values to other types if specified.
             * @param message FederationPackage
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.FederationPackage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FederationPackage to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for FederationPackage
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace FederationPackage {

            /** Properties of a FederationPackage. */
            interface $Properties {

                /** FederationPackage originServer */
                originServer?: (string|null);

                /** FederationPackage targetServer */
                targetServer?: (string|null);

                /** FederationPackage timestamp */
                timestamp?: (number|Long|null);

                /** FederationPackage payload */
                payload?: (Uint8Array|null);

                /** FederationPackage signature */
                signature?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a FederationPackage. */
            type $Shape = lingcat.classes.FederationPackage.$Properties;
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
         * Properties of a IChatAdmin.
         * @deprecated Use lingcat.classes.IChatAdmin.$Properties instead.
         */
        interface IIChatAdmin extends lingcat.classes.IChatAdmin.$Properties {
        }

        /** Represents a IChatAdmin. */
        class IChatAdmin {

            /**
             * Constructs a new IChatAdmin.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IChatAdmin.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IChatAdmin id. */
            id: string;

            /** IChatAdmin username. */
            username?: (string|null);

            /** IChatAdmin nickname. */
            nickname: string;

            /** IChatAdmin description. */
            description?: (string|null);

            /** IChatAdmin avatarFileHash. */
            avatarFileHash?: (string|null);

            /** IChatAdmin role. */
            role: string;

            /** IChatAdmin permissions. */
            permissions: string;

            /** IChatAdmin belongToChatId. */
            belongToChatId: string;

            /**
             * Creates a new IChatAdmin instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IChatAdmin instance
             */
            static create(properties: lingcat.classes.IChatAdmin.$Shape): lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape;
            static create(properties?: lingcat.classes.IChatAdmin.$Properties): lingcat.classes.IChatAdmin;

            /**
             * Encodes the specified IChatAdmin message. Does not implicitly {@link lingcat.classes.IChatAdmin.verify|verify} messages.
             * @param message IChatAdmin message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IChatAdmin.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IChatAdmin message, length delimited. Does not implicitly {@link lingcat.classes.IChatAdmin.verify|verify} messages.
             * @param message IChatAdmin message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IChatAdmin.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IChatAdmin message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape} IChatAdmin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape;

            /**
             * Decodes a IChatAdmin message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape} IChatAdmin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IChatAdmin & lingcat.classes.IChatAdmin.$Shape;

            /**
             * Verifies a IChatAdmin message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IChatAdmin message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IChatAdmin
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IChatAdmin;

            /**
             * Creates a plain object from a IChatAdmin message. Also converts values to other types if specified.
             * @param message IChatAdmin
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IChatAdmin, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IChatAdmin to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IChatAdmin
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IChatAdmin {

            /** Properties of a IChatAdmin. */
            interface $Properties {

                /** IChatAdmin id */
                id?: (string|null);

                /** IChatAdmin username */
                username?: (string|null);

                /** IChatAdmin nickname */
                nickname?: (string|null);

                /** IChatAdmin description */
                description?: (string|null);

                /** IChatAdmin avatarFileHash */
                avatarFileHash?: (string|null);

                /** IChatAdmin role */
                role?: (string|null);

                /** IChatAdmin permissions */
                permissions?: (string|null);

                /** IChatAdmin belongToChatId */
                belongToChatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IChatAdmin. */
            type $Shape = lingcat.classes.IChatAdmin.$Properties;
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

            /** IChat chatUnique. */
            chatUnique?: (string|null);

            /** IChat type. */
            type: string;

            /** IChat avatarFileHash. */
            avatarFileHash?: (string|null);

            /** IChat settings. */
            settings: string;

            /** IChat lastMessageId. */
            lastMessageId: number;

            /** IChat lastMessageTime. */
            lastMessageTime: (number|Long);

            /** IChat description. */
            description?: (string|null);

            /** IChat lastMessageText. */
            lastMessageText?: (string|null);

            /** IChat isMember. */
            isMember: boolean;

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

                /** IChat chatUnique */
                chatUnique?: (string|null);

                /** IChat type */
                type?: (string|null);

                /** IChat avatarFileHash */
                avatarFileHash?: (string|null);

                /** IChat settings */
                settings?: (string|null);

                /** IChat lastMessageId */
                lastMessageId?: (number|null);

                /** IChat lastMessageTime */
                lastMessageTime?: (number|Long|null);

                /** IChat description */
                description?: (string|null);

                /** IChat lastMessageText */
                lastMessageText?: (string|null);

                /** IChat isMember */
                isMember?: (boolean|null);

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
         * Properties of a IMessageEntity.
         * @deprecated Use lingcat.classes.IMessageEntity.$Properties instead.
         */
        interface IIMessageEntity extends lingcat.classes.IMessageEntity.$Properties {
        }

        /** Represents a IMessageEntity. */
        class IMessageEntity {

            /**
             * Constructs a new IMessageEntity.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.classes.IMessageEntity.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** IMessageEntity type. */
            type: string;

            /** IMessageEntity offset. */
            offset: number;

            /** IMessageEntity length. */
            length: number;

            /** IMessageEntity data. */
            data?: (string|null);

            /**
             * Creates a new IMessageEntity instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IMessageEntity instance
             */
            static create(properties: lingcat.classes.IMessageEntity.$Shape): lingcat.classes.IMessageEntity & lingcat.classes.IMessageEntity.$Shape;
            static create(properties?: lingcat.classes.IMessageEntity.$Properties): lingcat.classes.IMessageEntity;

            /**
             * Encodes the specified IMessageEntity message. Does not implicitly {@link lingcat.classes.IMessageEntity.verify|verify} messages.
             * @param message IMessageEntity message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.classes.IMessageEntity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IMessageEntity message, length delimited. Does not implicitly {@link lingcat.classes.IMessageEntity.verify|verify} messages.
             * @param message IMessageEntity message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.classes.IMessageEntity.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a IMessageEntity message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.classes.IMessageEntity & lingcat.classes.IMessageEntity.$Shape} IMessageEntity
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.classes.IMessageEntity & lingcat.classes.IMessageEntity.$Shape;

            /**
             * Decodes a IMessageEntity message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.classes.IMessageEntity & lingcat.classes.IMessageEntity.$Shape} IMessageEntity
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.classes.IMessageEntity & lingcat.classes.IMessageEntity.$Shape;

            /**
             * Verifies a IMessageEntity message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a IMessageEntity message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IMessageEntity
             */
            static fromObject(object: { [k: string]: any }): lingcat.classes.IMessageEntity;

            /**
             * Creates a plain object from a IMessageEntity message. Also converts values to other types if specified.
             * @param message IMessageEntity
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.classes.IMessageEntity, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IMessageEntity to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for IMessageEntity
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace IMessageEntity {

            /** Properties of a IMessageEntity. */
            interface $Properties {

                /** IMessageEntity type */
                type?: (string|null);

                /** IMessageEntity offset */
                offset?: (number|null);

                /** IMessageEntity length */
                length?: (number|null);

                /** IMessageEntity data */
                data?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a IMessageEntity. */
            type $Shape = lingcat.classes.IMessageEntity.$Properties;
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
            id: number;

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

            /** IMessage entities. */
            entities: lingcat.classes.IMessageEntity.$Properties[];

            /** IMessage editedAt. */
            editedAt?: (number|Long|null);

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
                id?: (number|null);

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

                /** IMessage entities */
                entities?: (lingcat.classes.IMessageEntity.$Properties[]|null);

                /** IMessage editedAt */
                editedAt?: (number|Long|null);

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

            /** Request_File_Access_Request fileHash. */
            fileHash?: (string|null);

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

                /** Request_File_Access_Request fileHash */
                fileHash?: (string|null);

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

            /** Authorize_Request sessionId. */
            sessionId: string;

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

                /** Authorize_Request sessionId */
                sessionId?: (string|null);

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
         * Properties of an Update_Chat_Profile_Request.
         * @deprecated Use lingcat.methods.Update_Chat_Profile_Request.$Properties instead.
         */
        interface IUpdate_Chat_Profile_Request extends lingcat.methods.Update_Chat_Profile_Request.$Properties {
        }

        /** Represents an Update_Chat_Profile_Request. */
        class Update_Chat_Profile_Request {

            /**
             * Constructs a new Update_Chat_Profile_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Profile_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Update_Chat_Profile_Request accessToken. */
            accessToken: string;

            /** Update_Chat_Profile_Request chatId. */
            chatId: string;

            /** Update_Chat_Profile_Request avatarFileHash. */
            avatarFileHash?: (string|null);

            /** Update_Chat_Profile_Request title. */
            title?: (string|null);

            /** Update_Chat_Profile_Request description. */
            description?: (string|null);

            /** Update_Chat_Profile_Request unique. */
            unique?: (string|null);

            /**
             * Creates a new Update_Chat_Profile_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Profile_Request instance
             */
            static create(properties: lingcat.methods.Update_Chat_Profile_Request.$Shape): lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Profile_Request.$Properties): lingcat.methods.Update_Chat_Profile_Request;

            /**
             * Encodes the specified Update_Chat_Profile_Request message. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Request.verify|verify} messages.
             * @param message Update_Chat_Profile_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Profile_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Profile_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Request.verify|verify} messages.
             * @param message Update_Chat_Profile_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Profile_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Profile_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape} Update_Chat_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape;

            /**
             * Decodes an Update_Chat_Profile_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape} Update_Chat_Profile_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Profile_Request & lingcat.methods.Update_Chat_Profile_Request.$Shape;

            /**
             * Verifies an Update_Chat_Profile_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Profile_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Profile_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Profile_Request;

            /**
             * Creates a plain object from an Update_Chat_Profile_Request message. Also converts values to other types if specified.
             * @param message Update_Chat_Profile_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Profile_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Profile_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Profile_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Profile_Request {

            /** Properties of an Update_Chat_Profile_Request. */
            interface $Properties {

                /** Update_Chat_Profile_Request accessToken */
                accessToken?: (string|null);

                /** Update_Chat_Profile_Request chatId */
                chatId?: (string|null);

                /** Update_Chat_Profile_Request avatarFileHash */
                avatarFileHash?: (string|null);

                /** Update_Chat_Profile_Request title */
                title?: (string|null);

                /** Update_Chat_Profile_Request description */
                description?: (string|null);

                /** Update_Chat_Profile_Request unique */
                unique?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Profile_Request. */
            type $Shape = lingcat.methods.Update_Chat_Profile_Request.$Properties;
        }

        /**
         * Properties of an Update_Chat_Profile_Response.
         * @deprecated Use lingcat.methods.Update_Chat_Profile_Response.$Properties instead.
         */
        interface IUpdate_Chat_Profile_Response extends lingcat.methods.Update_Chat_Profile_Response.$Properties {
        }

        /** Represents an Update_Chat_Profile_Response. */
        class Update_Chat_Profile_Response {

            /**
             * Constructs a new Update_Chat_Profile_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Profile_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Update_Chat_Profile_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Profile_Response instance
             */
            static create(properties: lingcat.methods.Update_Chat_Profile_Response.$Shape): lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Profile_Response.$Properties): lingcat.methods.Update_Chat_Profile_Response;

            /**
             * Encodes the specified Update_Chat_Profile_Response message. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Response.verify|verify} messages.
             * @param message Update_Chat_Profile_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Profile_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Profile_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Profile_Response.verify|verify} messages.
             * @param message Update_Chat_Profile_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Profile_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Profile_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape} Update_Chat_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape;

            /**
             * Decodes an Update_Chat_Profile_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape} Update_Chat_Profile_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Profile_Response & lingcat.methods.Update_Chat_Profile_Response.$Shape;

            /**
             * Verifies an Update_Chat_Profile_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Profile_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Profile_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Profile_Response;

            /**
             * Creates a plain object from an Update_Chat_Profile_Response message. Also converts values to other types if specified.
             * @param message Update_Chat_Profile_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Profile_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Profile_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Profile_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Profile_Response {

            /** Properties of an Update_Chat_Profile_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Profile_Response. */
            type $Shape = lingcat.methods.Update_Chat_Profile_Response.$Properties;
        }

        /**
         * Properties of a Send_Chat_Message_Request.
         * @deprecated Use lingcat.methods.Send_Chat_Message_Request.$Properties instead.
         */
        interface ISend_Chat_Message_Request extends lingcat.methods.Send_Chat_Message_Request.$Properties {
        }

        /** Represents a Send_Chat_Message_Request. */
        class Send_Chat_Message_Request {

            /**
             * Constructs a new Send_Chat_Message_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Send_Chat_Message_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Send_Chat_Message_Request accessToken. */
            accessToken: string;

            /** Send_Chat_Message_Request chatId. */
            chatId: string;

            /** Send_Chat_Message_Request text. */
            text: string;

            /** Send_Chat_Message_Request entities. */
            entities: lingcat.classes.IMessageEntity.$Properties[];

            /**
             * Creates a new Send_Chat_Message_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Send_Chat_Message_Request instance
             */
            static create(properties: lingcat.methods.Send_Chat_Message_Request.$Shape): lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape;
            static create(properties?: lingcat.methods.Send_Chat_Message_Request.$Properties): lingcat.methods.Send_Chat_Message_Request;

            /**
             * Encodes the specified Send_Chat_Message_Request message. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Request.verify|verify} messages.
             * @param message Send_Chat_Message_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Send_Chat_Message_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Send_Chat_Message_Request message, length delimited. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Request.verify|verify} messages.
             * @param message Send_Chat_Message_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Send_Chat_Message_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Send_Chat_Message_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape} Send_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape;

            /**
             * Decodes a Send_Chat_Message_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape} Send_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Send_Chat_Message_Request & lingcat.methods.Send_Chat_Message_Request.$Shape;

            /**
             * Verifies a Send_Chat_Message_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Send_Chat_Message_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Send_Chat_Message_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Send_Chat_Message_Request;

            /**
             * Creates a plain object from a Send_Chat_Message_Request message. Also converts values to other types if specified.
             * @param message Send_Chat_Message_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Send_Chat_Message_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Send_Chat_Message_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Send_Chat_Message_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Send_Chat_Message_Request {

            /** Properties of a Send_Chat_Message_Request. */
            interface $Properties {

                /** Send_Chat_Message_Request accessToken */
                accessToken?: (string|null);

                /** Send_Chat_Message_Request chatId */
                chatId?: (string|null);

                /** Send_Chat_Message_Request text */
                text?: (string|null);

                /** Send_Chat_Message_Request entities */
                entities?: (lingcat.classes.IMessageEntity.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Send_Chat_Message_Request. */
            type $Shape = lingcat.methods.Send_Chat_Message_Request.$Properties;
        }

        /**
         * Properties of a Send_Chat_Message_Response.
         * @deprecated Use lingcat.methods.Send_Chat_Message_Response.$Properties instead.
         */
        interface ISend_Chat_Message_Response extends lingcat.methods.Send_Chat_Message_Response.$Properties {
        }

        /** Represents a Send_Chat_Message_Response. */
        class Send_Chat_Message_Response {

            /**
             * Constructs a new Send_Chat_Message_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Send_Chat_Message_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Send_Chat_Message_Response id. */
            id: number;

            /**
             * Creates a new Send_Chat_Message_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Send_Chat_Message_Response instance
             */
            static create(properties: lingcat.methods.Send_Chat_Message_Response.$Shape): lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape;
            static create(properties?: lingcat.methods.Send_Chat_Message_Response.$Properties): lingcat.methods.Send_Chat_Message_Response;

            /**
             * Encodes the specified Send_Chat_Message_Response message. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Response.verify|verify} messages.
             * @param message Send_Chat_Message_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Send_Chat_Message_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Send_Chat_Message_Response message, length delimited. Does not implicitly {@link lingcat.methods.Send_Chat_Message_Response.verify|verify} messages.
             * @param message Send_Chat_Message_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Send_Chat_Message_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Send_Chat_Message_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape} Send_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape;

            /**
             * Decodes a Send_Chat_Message_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape} Send_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Send_Chat_Message_Response & lingcat.methods.Send_Chat_Message_Response.$Shape;

            /**
             * Verifies a Send_Chat_Message_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Send_Chat_Message_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Send_Chat_Message_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Send_Chat_Message_Response;

            /**
             * Creates a plain object from a Send_Chat_Message_Response message. Also converts values to other types if specified.
             * @param message Send_Chat_Message_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Send_Chat_Message_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Send_Chat_Message_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Send_Chat_Message_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Send_Chat_Message_Response {

            /** Properties of a Send_Chat_Message_Response. */
            interface $Properties {

                /** Send_Chat_Message_Response id */
                id?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Send_Chat_Message_Response. */
            type $Shape = lingcat.methods.Send_Chat_Message_Response.$Properties;
        }

        /**
         * Properties of a Receive_Chat_Message_Event.
         * @deprecated Use lingcat.methods.Receive_Chat_Message_Event.$Properties instead.
         */
        interface IReceive_Chat_Message_Event extends lingcat.methods.Receive_Chat_Message_Event.$Properties {
        }

        /** Represents a Receive_Chat_Message_Event. */
        class Receive_Chat_Message_Event {

            /**
             * Constructs a new Receive_Chat_Message_Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Receive_Chat_Message_Event.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Receive_Chat_Message_Event msg. */
            msg?: (lingcat.classes.IMessage.$Properties|null);

            /**
             * Creates a new Receive_Chat_Message_Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Receive_Chat_Message_Event instance
             */
            static create(properties: lingcat.methods.Receive_Chat_Message_Event.$Shape): lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape;
            static create(properties?: lingcat.methods.Receive_Chat_Message_Event.$Properties): lingcat.methods.Receive_Chat_Message_Event;

            /**
             * Encodes the specified Receive_Chat_Message_Event message. Does not implicitly {@link lingcat.methods.Receive_Chat_Message_Event.verify|verify} messages.
             * @param message Receive_Chat_Message_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Receive_Chat_Message_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Receive_Chat_Message_Event message, length delimited. Does not implicitly {@link lingcat.methods.Receive_Chat_Message_Event.verify|verify} messages.
             * @param message Receive_Chat_Message_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Receive_Chat_Message_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Receive_Chat_Message_Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape} Receive_Chat_Message_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape;

            /**
             * Decodes a Receive_Chat_Message_Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape} Receive_Chat_Message_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Receive_Chat_Message_Event & lingcat.methods.Receive_Chat_Message_Event.$Shape;

            /**
             * Verifies a Receive_Chat_Message_Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Receive_Chat_Message_Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Receive_Chat_Message_Event
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Receive_Chat_Message_Event;

            /**
             * Creates a plain object from a Receive_Chat_Message_Event message. Also converts values to other types if specified.
             * @param message Receive_Chat_Message_Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Receive_Chat_Message_Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Receive_Chat_Message_Event to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Receive_Chat_Message_Event
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Receive_Chat_Message_Event {

            /** Properties of a Receive_Chat_Message_Event. */
            interface $Properties {

                /** Receive_Chat_Message_Event msg */
                msg?: (lingcat.classes.IMessage.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Receive_Chat_Message_Event. */
            type $Shape = lingcat.methods.Receive_Chat_Message_Event.$Properties;
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
            before?: (number|null);

            /** Get_Chat_Messages_Request after. */
            after?: (number|null);

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
                before?: (number|null);

                /** Get_Chat_Messages_Request after */
                after?: (number|null);

                /** Get_Chat_Messages_Request limit */
                limit?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Messages_Request. */
            type $Shape = lingcat.methods.Get_Chat_Messages_Request.$Properties;
        }

        /**
         * Properties of a Get_Chat_Messages_Response.
         * @deprecated Use lingcat.methods.Get_Chat_Messages_Response.$Properties instead.
         */
        interface IGet_Chat_Messages_Response extends lingcat.methods.Get_Chat_Messages_Response.$Properties {
        }

        /** Represents a Get_Chat_Messages_Response. */
        class Get_Chat_Messages_Response {

            /**
             * Constructs a new Get_Chat_Messages_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Messages_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Messages_Response messages. */
            messages: lingcat.classes.IMessage.$Properties[];

            /**
             * Creates a new Get_Chat_Messages_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Messages_Response instance
             */
            static create(properties: lingcat.methods.Get_Chat_Messages_Response.$Shape): lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Messages_Response.$Properties): lingcat.methods.Get_Chat_Messages_Response;

            /**
             * Encodes the specified Get_Chat_Messages_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Response.verify|verify} messages.
             * @param message Get_Chat_Messages_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Messages_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Messages_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Messages_Response.verify|verify} messages.
             * @param message Get_Chat_Messages_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Messages_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Messages_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape} Get_Chat_Messages_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape;

            /**
             * Decodes a Get_Chat_Messages_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape} Get_Chat_Messages_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Messages_Response & lingcat.methods.Get_Chat_Messages_Response.$Shape;

            /**
             * Verifies a Get_Chat_Messages_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Messages_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Messages_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Messages_Response;

            /**
             * Creates a plain object from a Get_Chat_Messages_Response message. Also converts values to other types if specified.
             * @param message Get_Chat_Messages_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Messages_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Messages_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Messages_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Messages_Response {

            /** Properties of a Get_Chat_Messages_Response. */
            interface $Properties {

                /** Get_Chat_Messages_Response messages */
                messages?: (lingcat.classes.IMessage.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Messages_Response. */
            type $Shape = lingcat.methods.Get_Chat_Messages_Response.$Properties;
        }

        /**
         * Properties of a Query_Chat_Info_Request.
         * @deprecated Use lingcat.methods.Query_Chat_Info_Request.$Properties instead.
         */
        interface IQuery_Chat_Info_Request extends lingcat.methods.Query_Chat_Info_Request.$Properties {
        }

        /** Represents a Query_Chat_Info_Request. */
        class Query_Chat_Info_Request {

            /**
             * Constructs a new Query_Chat_Info_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_Chat_Info_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_Chat_Info_Request accessToken. */
            accessToken: string;

            /** Query_Chat_Info_Request chatId. */
            chatId: string;

            /**
             * Creates a new Query_Chat_Info_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_Chat_Info_Request instance
             */
            static create(properties: lingcat.methods.Query_Chat_Info_Request.$Shape): lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape;
            static create(properties?: lingcat.methods.Query_Chat_Info_Request.$Properties): lingcat.methods.Query_Chat_Info_Request;

            /**
             * Encodes the specified Query_Chat_Info_Request message. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Request.verify|verify} messages.
             * @param message Query_Chat_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_Chat_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_Chat_Info_Request message, length delimited. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Request.verify|verify} messages.
             * @param message Query_Chat_Info_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_Chat_Info_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_Chat_Info_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape} Query_Chat_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape;

            /**
             * Decodes a Query_Chat_Info_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape} Query_Chat_Info_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_Chat_Info_Request & lingcat.methods.Query_Chat_Info_Request.$Shape;

            /**
             * Verifies a Query_Chat_Info_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_Chat_Info_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_Chat_Info_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_Chat_Info_Request;

            /**
             * Creates a plain object from a Query_Chat_Info_Request message. Also converts values to other types if specified.
             * @param message Query_Chat_Info_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_Chat_Info_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_Chat_Info_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_Chat_Info_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_Chat_Info_Request {

            /** Properties of a Query_Chat_Info_Request. */
            interface $Properties {

                /** Query_Chat_Info_Request accessToken */
                accessToken?: (string|null);

                /** Query_Chat_Info_Request chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_Chat_Info_Request. */
            type $Shape = lingcat.methods.Query_Chat_Info_Request.$Properties;
        }

        /**
         * Properties of a Query_Chat_Info_Response.
         * @deprecated Use lingcat.methods.Query_Chat_Info_Response.$Properties instead.
         */
        interface IQuery_Chat_Info_Response extends lingcat.methods.Query_Chat_Info_Response.$Properties {
        }

        /** Represents a Query_Chat_Info_Response. */
        class Query_Chat_Info_Response {

            /**
             * Constructs a new Query_Chat_Info_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Query_Chat_Info_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Query_Chat_Info_Response info. */
            info?: (lingcat.classes.IChat.$Properties|null);

            /**
             * Creates a new Query_Chat_Info_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Query_Chat_Info_Response instance
             */
            static create(properties: lingcat.methods.Query_Chat_Info_Response.$Shape): lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape;
            static create(properties?: lingcat.methods.Query_Chat_Info_Response.$Properties): lingcat.methods.Query_Chat_Info_Response;

            /**
             * Encodes the specified Query_Chat_Info_Response message. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Response.verify|verify} messages.
             * @param message Query_Chat_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Query_Chat_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Query_Chat_Info_Response message, length delimited. Does not implicitly {@link lingcat.methods.Query_Chat_Info_Response.verify|verify} messages.
             * @param message Query_Chat_Info_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Query_Chat_Info_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Query_Chat_Info_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape} Query_Chat_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape;

            /**
             * Decodes a Query_Chat_Info_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape} Query_Chat_Info_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Query_Chat_Info_Response & lingcat.methods.Query_Chat_Info_Response.$Shape;

            /**
             * Verifies a Query_Chat_Info_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Query_Chat_Info_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Query_Chat_Info_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Query_Chat_Info_Response;

            /**
             * Creates a plain object from a Query_Chat_Info_Response message. Also converts values to other types if specified.
             * @param message Query_Chat_Info_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Query_Chat_Info_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Query_Chat_Info_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Query_Chat_Info_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Query_Chat_Info_Response {

            /** Properties of a Query_Chat_Info_Response. */
            interface $Properties {

                /** Query_Chat_Info_Response info */
                info?: (lingcat.classes.IChat.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Query_Chat_Info_Response. */
            type $Shape = lingcat.methods.Query_Chat_Info_Response.$Properties;
        }

        /**
         * Properties of a Get_Or_Create_Private_Chat_Request.
         * @deprecated Use lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties instead.
         */
        interface IGet_Or_Create_Private_Chat_Request extends lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties {
        }

        /** Represents a Get_Or_Create_Private_Chat_Request. */
        class Get_Or_Create_Private_Chat_Request {

            /**
             * Constructs a new Get_Or_Create_Private_Chat_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Or_Create_Private_Chat_Request accessToken. */
            accessToken: string;

            /** Get_Or_Create_Private_Chat_Request targetUserId. */
            targetUserId: string;

            /**
             * Creates a new Get_Or_Create_Private_Chat_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Or_Create_Private_Chat_Request instance
             */
            static create(properties: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape): lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties): lingcat.methods.Get_Or_Create_Private_Chat_Request;

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Request message. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Request.verify|verify} messages.
             * @param message Get_Or_Create_Private_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Request.verify|verify} messages.
             * @param message Get_Or_Create_Private_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Or_Create_Private_Chat_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape} Get_Or_Create_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape;

            /**
             * Decodes a Get_Or_Create_Private_Chat_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape} Get_Or_Create_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Or_Create_Private_Chat_Request & lingcat.methods.Get_Or_Create_Private_Chat_Request.$Shape;

            /**
             * Verifies a Get_Or_Create_Private_Chat_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Or_Create_Private_Chat_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Or_Create_Private_Chat_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Or_Create_Private_Chat_Request;

            /**
             * Creates a plain object from a Get_Or_Create_Private_Chat_Request message. Also converts values to other types if specified.
             * @param message Get_Or_Create_Private_Chat_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Or_Create_Private_Chat_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Or_Create_Private_Chat_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Or_Create_Private_Chat_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Or_Create_Private_Chat_Request {

            /** Properties of a Get_Or_Create_Private_Chat_Request. */
            interface $Properties {

                /** Get_Or_Create_Private_Chat_Request accessToken */
                accessToken?: (string|null);

                /** Get_Or_Create_Private_Chat_Request targetUserId */
                targetUserId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Or_Create_Private_Chat_Request. */
            type $Shape = lingcat.methods.Get_Or_Create_Private_Chat_Request.$Properties;
        }

        /**
         * Properties of a Get_Or_Create_Private_Chat_Response.
         * @deprecated Use lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties instead.
         */
        interface IGet_Or_Create_Private_Chat_Response extends lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties {
        }

        /** Represents a Get_Or_Create_Private_Chat_Response. */
        class Get_Or_Create_Private_Chat_Response {

            /**
             * Constructs a new Get_Or_Create_Private_Chat_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Or_Create_Private_Chat_Response chatId. */
            chatId: string;

            /**
             * Creates a new Get_Or_Create_Private_Chat_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Or_Create_Private_Chat_Response instance
             */
            static create(properties: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape): lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties): lingcat.methods.Get_Or_Create_Private_Chat_Response;

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Response message. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Response.verify|verify} messages.
             * @param message Get_Or_Create_Private_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Or_Create_Private_Chat_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Or_Create_Private_Chat_Response.verify|verify} messages.
             * @param message Get_Or_Create_Private_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Or_Create_Private_Chat_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape} Get_Or_Create_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape;

            /**
             * Decodes a Get_Or_Create_Private_Chat_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape} Get_Or_Create_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Or_Create_Private_Chat_Response & lingcat.methods.Get_Or_Create_Private_Chat_Response.$Shape;

            /**
             * Verifies a Get_Or_Create_Private_Chat_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Or_Create_Private_Chat_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Or_Create_Private_Chat_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Or_Create_Private_Chat_Response;

            /**
             * Creates a plain object from a Get_Or_Create_Private_Chat_Response message. Also converts values to other types if specified.
             * @param message Get_Or_Create_Private_Chat_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Or_Create_Private_Chat_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Or_Create_Private_Chat_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Or_Create_Private_Chat_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Or_Create_Private_Chat_Response {

            /** Properties of a Get_Or_Create_Private_Chat_Response. */
            interface $Properties {

                /** Get_Or_Create_Private_Chat_Response chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Or_Create_Private_Chat_Response. */
            type $Shape = lingcat.methods.Get_Or_Create_Private_Chat_Response.$Properties;
        }

        /**
         * Properties of a Get_My_Chats_Request.
         * @deprecated Use lingcat.methods.Get_My_Chats_Request.$Properties instead.
         */
        interface IGet_My_Chats_Request extends lingcat.methods.Get_My_Chats_Request.$Properties {
        }

        /** Represents a Get_My_Chats_Request. */
        class Get_My_Chats_Request {

            /**
             * Constructs a new Get_My_Chats_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_My_Chats_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_My_Chats_Request accessToken. */
            accessToken: string;

            /** Get_My_Chats_Request limit. */
            limit?: (number|null);

            /** Get_My_Chats_Request offset. */
            offset?: (number|null);

            /**
             * Creates a new Get_My_Chats_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_My_Chats_Request instance
             */
            static create(properties: lingcat.methods.Get_My_Chats_Request.$Shape): lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape;
            static create(properties?: lingcat.methods.Get_My_Chats_Request.$Properties): lingcat.methods.Get_My_Chats_Request;

            /**
             * Encodes the specified Get_My_Chats_Request message. Does not implicitly {@link lingcat.methods.Get_My_Chats_Request.verify|verify} messages.
             * @param message Get_My_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_My_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_My_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Chats_Request.verify|verify} messages.
             * @param message Get_My_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_My_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_My_Chats_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape} Get_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape;

            /**
             * Decodes a Get_My_Chats_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape} Get_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_My_Chats_Request & lingcat.methods.Get_My_Chats_Request.$Shape;

            /**
             * Verifies a Get_My_Chats_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_My_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_My_Chats_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_My_Chats_Request;

            /**
             * Creates a plain object from a Get_My_Chats_Request message. Also converts values to other types if specified.
             * @param message Get_My_Chats_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_My_Chats_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_My_Chats_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_My_Chats_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_My_Chats_Request {

            /** Properties of a Get_My_Chats_Request. */
            interface $Properties {

                /** Get_My_Chats_Request accessToken */
                accessToken?: (string|null);

                /** Get_My_Chats_Request limit */
                limit?: (number|null);

                /** Get_My_Chats_Request offset */
                offset?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_My_Chats_Request. */
            type $Shape = lingcat.methods.Get_My_Chats_Request.$Properties;
        }

        /**
         * Properties of a Get_My_Chats_Response.
         * @deprecated Use lingcat.methods.Get_My_Chats_Response.$Properties instead.
         */
        interface IGet_My_Chats_Response extends lingcat.methods.Get_My_Chats_Response.$Properties {
        }

        /** Represents a Get_My_Chats_Response. */
        class Get_My_Chats_Response {

            /**
             * Constructs a new Get_My_Chats_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_My_Chats_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_My_Chats_Response chats. */
            chats: lingcat.classes.IChat.$Properties[];

            /**
             * Creates a new Get_My_Chats_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_My_Chats_Response instance
             */
            static create(properties: lingcat.methods.Get_My_Chats_Response.$Shape): lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape;
            static create(properties?: lingcat.methods.Get_My_Chats_Response.$Properties): lingcat.methods.Get_My_Chats_Response;

            /**
             * Encodes the specified Get_My_Chats_Response message. Does not implicitly {@link lingcat.methods.Get_My_Chats_Response.verify|verify} messages.
             * @param message Get_My_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_My_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_My_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Chats_Response.verify|verify} messages.
             * @param message Get_My_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_My_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_My_Chats_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape} Get_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape;

            /**
             * Decodes a Get_My_Chats_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape} Get_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_My_Chats_Response & lingcat.methods.Get_My_Chats_Response.$Shape;

            /**
             * Verifies a Get_My_Chats_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_My_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_My_Chats_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_My_Chats_Response;

            /**
             * Creates a plain object from a Get_My_Chats_Response message. Also converts values to other types if specified.
             * @param message Get_My_Chats_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_My_Chats_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_My_Chats_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_My_Chats_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_My_Chats_Response {

            /** Properties of a Get_My_Chats_Response. */
            interface $Properties {

                /** Get_My_Chats_Response chats */
                chats?: (lingcat.classes.IChat.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_My_Chats_Response. */
            type $Shape = lingcat.methods.Get_My_Chats_Response.$Properties;
        }

        /**
         * Properties of a Get_My_Favourite_Chats_Request.
         * @deprecated Use lingcat.methods.Get_My_Favourite_Chats_Request.$Properties instead.
         */
        interface IGet_My_Favourite_Chats_Request extends lingcat.methods.Get_My_Favourite_Chats_Request.$Properties {
        }

        /** Represents a Get_My_Favourite_Chats_Request. */
        class Get_My_Favourite_Chats_Request {

            /**
             * Constructs a new Get_My_Favourite_Chats_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_My_Favourite_Chats_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_My_Favourite_Chats_Request accessToken. */
            accessToken: string;

            /** Get_My_Favourite_Chats_Request limit. */
            limit?: (number|null);

            /** Get_My_Favourite_Chats_Request offset. */
            offset?: (number|null);

            /**
             * Creates a new Get_My_Favourite_Chats_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_My_Favourite_Chats_Request instance
             */
            static create(properties: lingcat.methods.Get_My_Favourite_Chats_Request.$Shape): lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape;
            static create(properties?: lingcat.methods.Get_My_Favourite_Chats_Request.$Properties): lingcat.methods.Get_My_Favourite_Chats_Request;

            /**
             * Encodes the specified Get_My_Favourite_Chats_Request message. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Request.verify|verify} messages.
             * @param message Get_My_Favourite_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_My_Favourite_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_My_Favourite_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Request.verify|verify} messages.
             * @param message Get_My_Favourite_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_My_Favourite_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_My_Favourite_Chats_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape} Get_My_Favourite_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape;

            /**
             * Decodes a Get_My_Favourite_Chats_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape} Get_My_Favourite_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_My_Favourite_Chats_Request & lingcat.methods.Get_My_Favourite_Chats_Request.$Shape;

            /**
             * Verifies a Get_My_Favourite_Chats_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_My_Favourite_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_My_Favourite_Chats_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_My_Favourite_Chats_Request;

            /**
             * Creates a plain object from a Get_My_Favourite_Chats_Request message. Also converts values to other types if specified.
             * @param message Get_My_Favourite_Chats_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_My_Favourite_Chats_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_My_Favourite_Chats_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_My_Favourite_Chats_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_My_Favourite_Chats_Request {

            /** Properties of a Get_My_Favourite_Chats_Request. */
            interface $Properties {

                /** Get_My_Favourite_Chats_Request accessToken */
                accessToken?: (string|null);

                /** Get_My_Favourite_Chats_Request limit */
                limit?: (number|null);

                /** Get_My_Favourite_Chats_Request offset */
                offset?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_My_Favourite_Chats_Request. */
            type $Shape = lingcat.methods.Get_My_Favourite_Chats_Request.$Properties;
        }

        /**
         * Properties of a Get_My_Favourite_Chats_Response.
         * @deprecated Use lingcat.methods.Get_My_Favourite_Chats_Response.$Properties instead.
         */
        interface IGet_My_Favourite_Chats_Response extends lingcat.methods.Get_My_Favourite_Chats_Response.$Properties {
        }

        /** Represents a Get_My_Favourite_Chats_Response. */
        class Get_My_Favourite_Chats_Response {

            /**
             * Constructs a new Get_My_Favourite_Chats_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_My_Favourite_Chats_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_My_Favourite_Chats_Response chats. */
            chats: lingcat.classes.IChat.$Properties[];

            /**
             * Creates a new Get_My_Favourite_Chats_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_My_Favourite_Chats_Response instance
             */
            static create(properties: lingcat.methods.Get_My_Favourite_Chats_Response.$Shape): lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape;
            static create(properties?: lingcat.methods.Get_My_Favourite_Chats_Response.$Properties): lingcat.methods.Get_My_Favourite_Chats_Response;

            /**
             * Encodes the specified Get_My_Favourite_Chats_Response message. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Response.verify|verify} messages.
             * @param message Get_My_Favourite_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_My_Favourite_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_My_Favourite_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_My_Favourite_Chats_Response.verify|verify} messages.
             * @param message Get_My_Favourite_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_My_Favourite_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_My_Favourite_Chats_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape} Get_My_Favourite_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape;

            /**
             * Decodes a Get_My_Favourite_Chats_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape} Get_My_Favourite_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_My_Favourite_Chats_Response & lingcat.methods.Get_My_Favourite_Chats_Response.$Shape;

            /**
             * Verifies a Get_My_Favourite_Chats_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_My_Favourite_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_My_Favourite_Chats_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_My_Favourite_Chats_Response;

            /**
             * Creates a plain object from a Get_My_Favourite_Chats_Response message. Also converts values to other types if specified.
             * @param message Get_My_Favourite_Chats_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_My_Favourite_Chats_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_My_Favourite_Chats_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_My_Favourite_Chats_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_My_Favourite_Chats_Response {

            /** Properties of a Get_My_Favourite_Chats_Response. */
            interface $Properties {

                /** Get_My_Favourite_Chats_Response chats */
                chats?: (lingcat.classes.IChat.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_My_Favourite_Chats_Response. */
            type $Shape = lingcat.methods.Get_My_Favourite_Chats_Response.$Properties;
        }

        /**
         * Properties of a Search_My_Chats_Request.
         * @deprecated Use lingcat.methods.Search_My_Chats_Request.$Properties instead.
         */
        interface ISearch_My_Chats_Request extends lingcat.methods.Search_My_Chats_Request.$Properties {
        }

        /** Represents a Search_My_Chats_Request. */
        class Search_My_Chats_Request {

            /**
             * Constructs a new Search_My_Chats_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Search_My_Chats_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Search_My_Chats_Request accessToken. */
            accessToken: string;

            /** Search_My_Chats_Request keyword. */
            keyword: string;

            /** Search_My_Chats_Request limit. */
            limit?: (number|null);

            /**
             * Creates a new Search_My_Chats_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Search_My_Chats_Request instance
             */
            static create(properties: lingcat.methods.Search_My_Chats_Request.$Shape): lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape;
            static create(properties?: lingcat.methods.Search_My_Chats_Request.$Properties): lingcat.methods.Search_My_Chats_Request;

            /**
             * Encodes the specified Search_My_Chats_Request message. Does not implicitly {@link lingcat.methods.Search_My_Chats_Request.verify|verify} messages.
             * @param message Search_My_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Search_My_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Search_My_Chats_Request message, length delimited. Does not implicitly {@link lingcat.methods.Search_My_Chats_Request.verify|verify} messages.
             * @param message Search_My_Chats_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Search_My_Chats_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Search_My_Chats_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape} Search_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape;

            /**
             * Decodes a Search_My_Chats_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape} Search_My_Chats_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Search_My_Chats_Request & lingcat.methods.Search_My_Chats_Request.$Shape;

            /**
             * Verifies a Search_My_Chats_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Search_My_Chats_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Search_My_Chats_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Search_My_Chats_Request;

            /**
             * Creates a plain object from a Search_My_Chats_Request message. Also converts values to other types if specified.
             * @param message Search_My_Chats_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Search_My_Chats_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Search_My_Chats_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Search_My_Chats_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Search_My_Chats_Request {

            /** Properties of a Search_My_Chats_Request. */
            interface $Properties {

                /** Search_My_Chats_Request accessToken */
                accessToken?: (string|null);

                /** Search_My_Chats_Request keyword */
                keyword?: (string|null);

                /** Search_My_Chats_Request limit */
                limit?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Search_My_Chats_Request. */
            type $Shape = lingcat.methods.Search_My_Chats_Request.$Properties;
        }

        /**
         * Properties of a Search_My_Chats_Response.
         * @deprecated Use lingcat.methods.Search_My_Chats_Response.$Properties instead.
         */
        interface ISearch_My_Chats_Response extends lingcat.methods.Search_My_Chats_Response.$Properties {
        }

        /** Represents a Search_My_Chats_Response. */
        class Search_My_Chats_Response {

            /**
             * Constructs a new Search_My_Chats_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Search_My_Chats_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Search_My_Chats_Response chats. */
            chats: lingcat.classes.IChat.$Properties[];

            /**
             * Creates a new Search_My_Chats_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Search_My_Chats_Response instance
             */
            static create(properties: lingcat.methods.Search_My_Chats_Response.$Shape): lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape;
            static create(properties?: lingcat.methods.Search_My_Chats_Response.$Properties): lingcat.methods.Search_My_Chats_Response;

            /**
             * Encodes the specified Search_My_Chats_Response message. Does not implicitly {@link lingcat.methods.Search_My_Chats_Response.verify|verify} messages.
             * @param message Search_My_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Search_My_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Search_My_Chats_Response message, length delimited. Does not implicitly {@link lingcat.methods.Search_My_Chats_Response.verify|verify} messages.
             * @param message Search_My_Chats_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Search_My_Chats_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Search_My_Chats_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape} Search_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape;

            /**
             * Decodes a Search_My_Chats_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape} Search_My_Chats_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Search_My_Chats_Response & lingcat.methods.Search_My_Chats_Response.$Shape;

            /**
             * Verifies a Search_My_Chats_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Search_My_Chats_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Search_My_Chats_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Search_My_Chats_Response;

            /**
             * Creates a plain object from a Search_My_Chats_Response message. Also converts values to other types if specified.
             * @param message Search_My_Chats_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Search_My_Chats_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Search_My_Chats_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Search_My_Chats_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Search_My_Chats_Response {

            /** Properties of a Search_My_Chats_Response. */
            interface $Properties {

                /** Search_My_Chats_Response chats */
                chats?: (lingcat.classes.IChat.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Search_My_Chats_Response. */
            type $Shape = lingcat.methods.Search_My_Chats_Response.$Properties;
        }

        /**
         * Properties of a Get_Another_User_From_Private_Chat_Request.
         * @deprecated Use lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties instead.
         */
        interface IGet_Another_User_From_Private_Chat_Request extends lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties {
        }

        /** Represents a Get_Another_User_From_Private_Chat_Request. */
        class Get_Another_User_From_Private_Chat_Request {

            /**
             * Constructs a new Get_Another_User_From_Private_Chat_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Another_User_From_Private_Chat_Request accessToken. */
            accessToken: string;

            /** Get_Another_User_From_Private_Chat_Request targetChatId. */
            targetChatId: string;

            /**
             * Creates a new Get_Another_User_From_Private_Chat_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Another_User_From_Private_Chat_Request instance
             */
            static create(properties: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape): lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties): lingcat.methods.Get_Another_User_From_Private_Chat_Request;

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Request message. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Request.verify|verify} messages.
             * @param message Get_Another_User_From_Private_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Request.verify|verify} messages.
             * @param message Get_Another_User_From_Private_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape} Get_Another_User_From_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape;

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape} Get_Another_User_From_Private_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Another_User_From_Private_Chat_Request & lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Shape;

            /**
             * Verifies a Get_Another_User_From_Private_Chat_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Another_User_From_Private_Chat_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Another_User_From_Private_Chat_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Another_User_From_Private_Chat_Request;

            /**
             * Creates a plain object from a Get_Another_User_From_Private_Chat_Request message. Also converts values to other types if specified.
             * @param message Get_Another_User_From_Private_Chat_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Another_User_From_Private_Chat_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Another_User_From_Private_Chat_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Another_User_From_Private_Chat_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Another_User_From_Private_Chat_Request {

            /** Properties of a Get_Another_User_From_Private_Chat_Request. */
            interface $Properties {

                /** Get_Another_User_From_Private_Chat_Request accessToken */
                accessToken?: (string|null);

                /** Get_Another_User_From_Private_Chat_Request targetChatId */
                targetChatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Another_User_From_Private_Chat_Request. */
            type $Shape = lingcat.methods.Get_Another_User_From_Private_Chat_Request.$Properties;
        }

        /**
         * Properties of a Get_Another_User_From_Private_Chat_Response.
         * @deprecated Use lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties instead.
         */
        interface IGet_Another_User_From_Private_Chat_Response extends lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties {
        }

        /** Represents a Get_Another_User_From_Private_Chat_Response. */
        class Get_Another_User_From_Private_Chat_Response {

            /**
             * Constructs a new Get_Another_User_From_Private_Chat_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Another_User_From_Private_Chat_Response userId. */
            userId: string;

            /**
             * Creates a new Get_Another_User_From_Private_Chat_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Another_User_From_Private_Chat_Response instance
             */
            static create(properties: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape): lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties): lingcat.methods.Get_Another_User_From_Private_Chat_Response;

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Response message. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Response.verify|verify} messages.
             * @param message Get_Another_User_From_Private_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Another_User_From_Private_Chat_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Another_User_From_Private_Chat_Response.verify|verify} messages.
             * @param message Get_Another_User_From_Private_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape} Get_Another_User_From_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape;

            /**
             * Decodes a Get_Another_User_From_Private_Chat_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape} Get_Another_User_From_Private_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Another_User_From_Private_Chat_Response & lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Shape;

            /**
             * Verifies a Get_Another_User_From_Private_Chat_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Another_User_From_Private_Chat_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Another_User_From_Private_Chat_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Another_User_From_Private_Chat_Response;

            /**
             * Creates a plain object from a Get_Another_User_From_Private_Chat_Response message. Also converts values to other types if specified.
             * @param message Get_Another_User_From_Private_Chat_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Another_User_From_Private_Chat_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Another_User_From_Private_Chat_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Another_User_From_Private_Chat_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Another_User_From_Private_Chat_Response {

            /** Properties of a Get_Another_User_From_Private_Chat_Response. */
            interface $Properties {

                /** Get_Another_User_From_Private_Chat_Response userId */
                userId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Another_User_From_Private_Chat_Response. */
            type $Shape = lingcat.methods.Get_Another_User_From_Private_Chat_Response.$Properties;
        }

        /**
         * Properties of a Set_Chat_Favourited_Request.
         * @deprecated Use lingcat.methods.Set_Chat_Favourited_Request.$Properties instead.
         */
        interface ISet_Chat_Favourited_Request extends lingcat.methods.Set_Chat_Favourited_Request.$Properties {
        }

        /** Represents a Set_Chat_Favourited_Request. */
        class Set_Chat_Favourited_Request {

            /**
             * Constructs a new Set_Chat_Favourited_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Set_Chat_Favourited_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Set_Chat_Favourited_Request accessToken. */
            accessToken: string;

            /** Set_Chat_Favourited_Request chatId. */
            chatId: string;

            /** Set_Chat_Favourited_Request favourited. */
            favourited: boolean;

            /**
             * Creates a new Set_Chat_Favourited_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Set_Chat_Favourited_Request instance
             */
            static create(properties: lingcat.methods.Set_Chat_Favourited_Request.$Shape): lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape;
            static create(properties?: lingcat.methods.Set_Chat_Favourited_Request.$Properties): lingcat.methods.Set_Chat_Favourited_Request;

            /**
             * Encodes the specified Set_Chat_Favourited_Request message. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Request.verify|verify} messages.
             * @param message Set_Chat_Favourited_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Set_Chat_Favourited_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Set_Chat_Favourited_Request message, length delimited. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Request.verify|verify} messages.
             * @param message Set_Chat_Favourited_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Set_Chat_Favourited_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Set_Chat_Favourited_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape} Set_Chat_Favourited_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape;

            /**
             * Decodes a Set_Chat_Favourited_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape} Set_Chat_Favourited_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Set_Chat_Favourited_Request & lingcat.methods.Set_Chat_Favourited_Request.$Shape;

            /**
             * Verifies a Set_Chat_Favourited_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Set_Chat_Favourited_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Set_Chat_Favourited_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Set_Chat_Favourited_Request;

            /**
             * Creates a plain object from a Set_Chat_Favourited_Request message. Also converts values to other types if specified.
             * @param message Set_Chat_Favourited_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Set_Chat_Favourited_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Set_Chat_Favourited_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Set_Chat_Favourited_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Set_Chat_Favourited_Request {

            /** Properties of a Set_Chat_Favourited_Request. */
            interface $Properties {

                /** Set_Chat_Favourited_Request accessToken */
                accessToken?: (string|null);

                /** Set_Chat_Favourited_Request chatId */
                chatId?: (string|null);

                /** Set_Chat_Favourited_Request favourited */
                favourited?: (boolean|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Set_Chat_Favourited_Request. */
            type $Shape = lingcat.methods.Set_Chat_Favourited_Request.$Properties;
        }

        /**
         * Properties of a Set_Chat_Favourited_Response.
         * @deprecated Use lingcat.methods.Set_Chat_Favourited_Response.$Properties instead.
         */
        interface ISet_Chat_Favourited_Response extends lingcat.methods.Set_Chat_Favourited_Response.$Properties {
        }

        /** Represents a Set_Chat_Favourited_Response. */
        class Set_Chat_Favourited_Response {

            /**
             * Constructs a new Set_Chat_Favourited_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Set_Chat_Favourited_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Set_Chat_Favourited_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Set_Chat_Favourited_Response instance
             */
            static create(properties: lingcat.methods.Set_Chat_Favourited_Response.$Shape): lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape;
            static create(properties?: lingcat.methods.Set_Chat_Favourited_Response.$Properties): lingcat.methods.Set_Chat_Favourited_Response;

            /**
             * Encodes the specified Set_Chat_Favourited_Response message. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Response.verify|verify} messages.
             * @param message Set_Chat_Favourited_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Set_Chat_Favourited_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Set_Chat_Favourited_Response message, length delimited. Does not implicitly {@link lingcat.methods.Set_Chat_Favourited_Response.verify|verify} messages.
             * @param message Set_Chat_Favourited_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Set_Chat_Favourited_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Set_Chat_Favourited_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape} Set_Chat_Favourited_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape;

            /**
             * Decodes a Set_Chat_Favourited_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape} Set_Chat_Favourited_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Set_Chat_Favourited_Response & lingcat.methods.Set_Chat_Favourited_Response.$Shape;

            /**
             * Verifies a Set_Chat_Favourited_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Set_Chat_Favourited_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Set_Chat_Favourited_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Set_Chat_Favourited_Response;

            /**
             * Creates a plain object from a Set_Chat_Favourited_Response message. Also converts values to other types if specified.
             * @param message Set_Chat_Favourited_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Set_Chat_Favourited_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Set_Chat_Favourited_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Set_Chat_Favourited_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Set_Chat_Favourited_Response {

            /** Properties of a Set_Chat_Favourited_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Set_Chat_Favourited_Response. */
            type $Shape = lingcat.methods.Set_Chat_Favourited_Response.$Properties;
        }

        /**
         * Properties of a Get_User_Id_By_Username_Request.
         * @deprecated Use lingcat.methods.Get_User_Id_By_Username_Request.$Properties instead.
         */
        interface IGet_User_Id_By_Username_Request extends lingcat.methods.Get_User_Id_By_Username_Request.$Properties {
        }

        /** Represents a Get_User_Id_By_Username_Request. */
        class Get_User_Id_By_Username_Request {

            /**
             * Constructs a new Get_User_Id_By_Username_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_User_Id_By_Username_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_User_Id_By_Username_Request accessToken. */
            accessToken: string;

            /** Get_User_Id_By_Username_Request username. */
            username: string;

            /**
             * Creates a new Get_User_Id_By_Username_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_User_Id_By_Username_Request instance
             */
            static create(properties: lingcat.methods.Get_User_Id_By_Username_Request.$Shape): lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape;
            static create(properties?: lingcat.methods.Get_User_Id_By_Username_Request.$Properties): lingcat.methods.Get_User_Id_By_Username_Request;

            /**
             * Encodes the specified Get_User_Id_By_Username_Request message. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Request.verify|verify} messages.
             * @param message Get_User_Id_By_Username_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_User_Id_By_Username_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_User_Id_By_Username_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Request.verify|verify} messages.
             * @param message Get_User_Id_By_Username_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_User_Id_By_Username_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_User_Id_By_Username_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape} Get_User_Id_By_Username_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape;

            /**
             * Decodes a Get_User_Id_By_Username_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape} Get_User_Id_By_Username_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_User_Id_By_Username_Request & lingcat.methods.Get_User_Id_By_Username_Request.$Shape;

            /**
             * Verifies a Get_User_Id_By_Username_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_User_Id_By_Username_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_User_Id_By_Username_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_User_Id_By_Username_Request;

            /**
             * Creates a plain object from a Get_User_Id_By_Username_Request message. Also converts values to other types if specified.
             * @param message Get_User_Id_By_Username_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_User_Id_By_Username_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_User_Id_By_Username_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_User_Id_By_Username_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_User_Id_By_Username_Request {

            /** Properties of a Get_User_Id_By_Username_Request. */
            interface $Properties {

                /** Get_User_Id_By_Username_Request accessToken */
                accessToken?: (string|null);

                /** Get_User_Id_By_Username_Request username */
                username?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_User_Id_By_Username_Request. */
            type $Shape = lingcat.methods.Get_User_Id_By_Username_Request.$Properties;
        }

        /**
         * Properties of a Get_User_Id_By_Username_Response.
         * @deprecated Use lingcat.methods.Get_User_Id_By_Username_Response.$Properties instead.
         */
        interface IGet_User_Id_By_Username_Response extends lingcat.methods.Get_User_Id_By_Username_Response.$Properties {
        }

        /** Represents a Get_User_Id_By_Username_Response. */
        class Get_User_Id_By_Username_Response {

            /**
             * Constructs a new Get_User_Id_By_Username_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_User_Id_By_Username_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_User_Id_By_Username_Response userId. */
            userId: string;

            /**
             * Creates a new Get_User_Id_By_Username_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_User_Id_By_Username_Response instance
             */
            static create(properties: lingcat.methods.Get_User_Id_By_Username_Response.$Shape): lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape;
            static create(properties?: lingcat.methods.Get_User_Id_By_Username_Response.$Properties): lingcat.methods.Get_User_Id_By_Username_Response;

            /**
             * Encodes the specified Get_User_Id_By_Username_Response message. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Response.verify|verify} messages.
             * @param message Get_User_Id_By_Username_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_User_Id_By_Username_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_User_Id_By_Username_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_User_Id_By_Username_Response.verify|verify} messages.
             * @param message Get_User_Id_By_Username_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_User_Id_By_Username_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_User_Id_By_Username_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape} Get_User_Id_By_Username_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape;

            /**
             * Decodes a Get_User_Id_By_Username_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape} Get_User_Id_By_Username_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_User_Id_By_Username_Response & lingcat.methods.Get_User_Id_By_Username_Response.$Shape;

            /**
             * Verifies a Get_User_Id_By_Username_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_User_Id_By_Username_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_User_Id_By_Username_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_User_Id_By_Username_Response;

            /**
             * Creates a plain object from a Get_User_Id_By_Username_Response message. Also converts values to other types if specified.
             * @param message Get_User_Id_By_Username_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_User_Id_By_Username_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_User_Id_By_Username_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_User_Id_By_Username_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_User_Id_By_Username_Response {

            /** Properties of a Get_User_Id_By_Username_Response. */
            interface $Properties {

                /** Get_User_Id_By_Username_Response userId */
                userId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_User_Id_By_Username_Response. */
            type $Shape = lingcat.methods.Get_User_Id_By_Username_Response.$Properties;
        }

        /**
         * Properties of a Resolve_Chat_Identifier_Request.
         * @deprecated Use lingcat.methods.Resolve_Chat_Identifier_Request.$Properties instead.
         */
        interface IResolve_Chat_Identifier_Request extends lingcat.methods.Resolve_Chat_Identifier_Request.$Properties {
        }

        /** Represents a Resolve_Chat_Identifier_Request. */
        class Resolve_Chat_Identifier_Request {

            /**
             * Constructs a new Resolve_Chat_Identifier_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Resolve_Chat_Identifier_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Resolve_Chat_Identifier_Request accessToken. */
            accessToken: string;

            /** Resolve_Chat_Identifier_Request identifier. */
            identifier: string;

            /**
             * Creates a new Resolve_Chat_Identifier_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Resolve_Chat_Identifier_Request instance
             */
            static create(properties: lingcat.methods.Resolve_Chat_Identifier_Request.$Shape): lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape;
            static create(properties?: lingcat.methods.Resolve_Chat_Identifier_Request.$Properties): lingcat.methods.Resolve_Chat_Identifier_Request;

            /**
             * Encodes the specified Resolve_Chat_Identifier_Request message. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Request.verify|verify} messages.
             * @param message Resolve_Chat_Identifier_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Resolve_Chat_Identifier_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Resolve_Chat_Identifier_Request message, length delimited. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Request.verify|verify} messages.
             * @param message Resolve_Chat_Identifier_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Resolve_Chat_Identifier_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Resolve_Chat_Identifier_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape} Resolve_Chat_Identifier_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape;

            /**
             * Decodes a Resolve_Chat_Identifier_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape} Resolve_Chat_Identifier_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Resolve_Chat_Identifier_Request & lingcat.methods.Resolve_Chat_Identifier_Request.$Shape;

            /**
             * Verifies a Resolve_Chat_Identifier_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Resolve_Chat_Identifier_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Resolve_Chat_Identifier_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Resolve_Chat_Identifier_Request;

            /**
             * Creates a plain object from a Resolve_Chat_Identifier_Request message. Also converts values to other types if specified.
             * @param message Resolve_Chat_Identifier_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Resolve_Chat_Identifier_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Resolve_Chat_Identifier_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Resolve_Chat_Identifier_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Resolve_Chat_Identifier_Request {

            /** Properties of a Resolve_Chat_Identifier_Request. */
            interface $Properties {

                /** Resolve_Chat_Identifier_Request accessToken */
                accessToken?: (string|null);

                /** Resolve_Chat_Identifier_Request identifier */
                identifier?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Resolve_Chat_Identifier_Request. */
            type $Shape = lingcat.methods.Resolve_Chat_Identifier_Request.$Properties;
        }

        /**
         * Properties of a Resolve_Chat_Identifier_Response.
         * @deprecated Use lingcat.methods.Resolve_Chat_Identifier_Response.$Properties instead.
         */
        interface IResolve_Chat_Identifier_Response extends lingcat.methods.Resolve_Chat_Identifier_Response.$Properties {
        }

        /** Represents a Resolve_Chat_Identifier_Response. */
        class Resolve_Chat_Identifier_Response {

            /**
             * Constructs a new Resolve_Chat_Identifier_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Resolve_Chat_Identifier_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Resolve_Chat_Identifier_Response chatId. */
            chatId: string;

            /**
             * Creates a new Resolve_Chat_Identifier_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Resolve_Chat_Identifier_Response instance
             */
            static create(properties: lingcat.methods.Resolve_Chat_Identifier_Response.$Shape): lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape;
            static create(properties?: lingcat.methods.Resolve_Chat_Identifier_Response.$Properties): lingcat.methods.Resolve_Chat_Identifier_Response;

            /**
             * Encodes the specified Resolve_Chat_Identifier_Response message. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Response.verify|verify} messages.
             * @param message Resolve_Chat_Identifier_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Resolve_Chat_Identifier_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Resolve_Chat_Identifier_Response message, length delimited. Does not implicitly {@link lingcat.methods.Resolve_Chat_Identifier_Response.verify|verify} messages.
             * @param message Resolve_Chat_Identifier_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Resolve_Chat_Identifier_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Resolve_Chat_Identifier_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape} Resolve_Chat_Identifier_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape;

            /**
             * Decodes a Resolve_Chat_Identifier_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape} Resolve_Chat_Identifier_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Resolve_Chat_Identifier_Response & lingcat.methods.Resolve_Chat_Identifier_Response.$Shape;

            /**
             * Verifies a Resolve_Chat_Identifier_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Resolve_Chat_Identifier_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Resolve_Chat_Identifier_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Resolve_Chat_Identifier_Response;

            /**
             * Creates a plain object from a Resolve_Chat_Identifier_Response message. Also converts values to other types if specified.
             * @param message Resolve_Chat_Identifier_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Resolve_Chat_Identifier_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Resolve_Chat_Identifier_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Resolve_Chat_Identifier_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Resolve_Chat_Identifier_Response {

            /** Properties of a Resolve_Chat_Identifier_Response. */
            interface $Properties {

                /** Resolve_Chat_Identifier_Response chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Resolve_Chat_Identifier_Response. */
            type $Shape = lingcat.methods.Resolve_Chat_Identifier_Response.$Properties;
        }

        /**
         * Properties of an Update_My_Chats_Event.
         * @deprecated Use lingcat.methods.Update_My_Chats_Event.$Properties instead.
         */
        interface IUpdate_My_Chats_Event extends lingcat.methods.Update_My_Chats_Event.$Properties {
        }

        /** Represents an Update_My_Chats_Event. */
        class Update_My_Chats_Event {

            /**
             * Constructs a new Update_My_Chats_Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_My_Chats_Event.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Update_My_Chats_Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_My_Chats_Event instance
             */
            static create(properties: lingcat.methods.Update_My_Chats_Event.$Shape): lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape;
            static create(properties?: lingcat.methods.Update_My_Chats_Event.$Properties): lingcat.methods.Update_My_Chats_Event;

            /**
             * Encodes the specified Update_My_Chats_Event message. Does not implicitly {@link lingcat.methods.Update_My_Chats_Event.verify|verify} messages.
             * @param message Update_My_Chats_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_My_Chats_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_My_Chats_Event message, length delimited. Does not implicitly {@link lingcat.methods.Update_My_Chats_Event.verify|verify} messages.
             * @param message Update_My_Chats_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_My_Chats_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_My_Chats_Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape} Update_My_Chats_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape;

            /**
             * Decodes an Update_My_Chats_Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape} Update_My_Chats_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_My_Chats_Event & lingcat.methods.Update_My_Chats_Event.$Shape;

            /**
             * Verifies an Update_My_Chats_Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_My_Chats_Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_My_Chats_Event
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_My_Chats_Event;

            /**
             * Creates a plain object from an Update_My_Chats_Event message. Also converts values to other types if specified.
             * @param message Update_My_Chats_Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_My_Chats_Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_My_Chats_Event to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_My_Chats_Event
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_My_Chats_Event {

            /** Properties of an Update_My_Chats_Event. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_My_Chats_Event. */
            type $Shape = lingcat.methods.Update_My_Chats_Event.$Properties;
        }

        /**
         * Properties of a Create_Group_Request.
         * @deprecated Use lingcat.methods.Create_Group_Request.$Properties instead.
         */
        interface ICreate_Group_Request extends lingcat.methods.Create_Group_Request.$Properties {
        }

        /** Represents a Create_Group_Request. */
        class Create_Group_Request {

            /**
             * Constructs a new Create_Group_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Create_Group_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Create_Group_Request accessToken. */
            accessToken: string;

            /** Create_Group_Request title. */
            title: string;

            /** Create_Group_Request unique. */
            unique?: (string|null);

            /**
             * Creates a new Create_Group_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Create_Group_Request instance
             */
            static create(properties: lingcat.methods.Create_Group_Request.$Shape): lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape;
            static create(properties?: lingcat.methods.Create_Group_Request.$Properties): lingcat.methods.Create_Group_Request;

            /**
             * Encodes the specified Create_Group_Request message. Does not implicitly {@link lingcat.methods.Create_Group_Request.verify|verify} messages.
             * @param message Create_Group_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Create_Group_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Create_Group_Request message, length delimited. Does not implicitly {@link lingcat.methods.Create_Group_Request.verify|verify} messages.
             * @param message Create_Group_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Create_Group_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Create_Group_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape} Create_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape;

            /**
             * Decodes a Create_Group_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape} Create_Group_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Create_Group_Request & lingcat.methods.Create_Group_Request.$Shape;

            /**
             * Verifies a Create_Group_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Create_Group_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Create_Group_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Create_Group_Request;

            /**
             * Creates a plain object from a Create_Group_Request message. Also converts values to other types if specified.
             * @param message Create_Group_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Create_Group_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Create_Group_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Create_Group_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Create_Group_Request {

            /** Properties of a Create_Group_Request. */
            interface $Properties {

                /** Create_Group_Request accessToken */
                accessToken?: (string|null);

                /** Create_Group_Request title */
                title?: (string|null);

                /** Create_Group_Request unique */
                unique?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Create_Group_Request. */
            type $Shape = lingcat.methods.Create_Group_Request.$Properties;
        }

        /**
         * Properties of a Create_Group_Response.
         * @deprecated Use lingcat.methods.Create_Group_Response.$Properties instead.
         */
        interface ICreate_Group_Response extends lingcat.methods.Create_Group_Response.$Properties {
        }

        /** Represents a Create_Group_Response. */
        class Create_Group_Response {

            /**
             * Constructs a new Create_Group_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Create_Group_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Create_Group_Response chatId. */
            chatId: string;

            /**
             * Creates a new Create_Group_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Create_Group_Response instance
             */
            static create(properties: lingcat.methods.Create_Group_Response.$Shape): lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape;
            static create(properties?: lingcat.methods.Create_Group_Response.$Properties): lingcat.methods.Create_Group_Response;

            /**
             * Encodes the specified Create_Group_Response message. Does not implicitly {@link lingcat.methods.Create_Group_Response.verify|verify} messages.
             * @param message Create_Group_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Create_Group_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Create_Group_Response message, length delimited. Does not implicitly {@link lingcat.methods.Create_Group_Response.verify|verify} messages.
             * @param message Create_Group_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Create_Group_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Create_Group_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape} Create_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape;

            /**
             * Decodes a Create_Group_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape} Create_Group_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Create_Group_Response & lingcat.methods.Create_Group_Response.$Shape;

            /**
             * Verifies a Create_Group_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Create_Group_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Create_Group_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Create_Group_Response;

            /**
             * Creates a plain object from a Create_Group_Response message. Also converts values to other types if specified.
             * @param message Create_Group_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Create_Group_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Create_Group_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Create_Group_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Create_Group_Response {

            /** Properties of a Create_Group_Response. */
            interface $Properties {

                /** Create_Group_Response chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Create_Group_Response. */
            type $Shape = lingcat.methods.Create_Group_Response.$Properties;
        }

        /**
         * Properties of a Join_Chat_Request.
         * @deprecated Use lingcat.methods.Join_Chat_Request.$Properties instead.
         */
        interface IJoin_Chat_Request extends lingcat.methods.Join_Chat_Request.$Properties {
        }

        /** Represents a Join_Chat_Request. */
        class Join_Chat_Request {

            /**
             * Constructs a new Join_Chat_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Join_Chat_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Join_Chat_Request accessToken. */
            accessToken: string;

            /** Join_Chat_Request chatId. */
            chatId: string;

            /** Join_Chat_Request answer. */
            answer?: (string|null);

            /**
             * Creates a new Join_Chat_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Join_Chat_Request instance
             */
            static create(properties: lingcat.methods.Join_Chat_Request.$Shape): lingcat.methods.Join_Chat_Request & lingcat.methods.Join_Chat_Request.$Shape;
            static create(properties?: lingcat.methods.Join_Chat_Request.$Properties): lingcat.methods.Join_Chat_Request;

            /**
             * Encodes the specified Join_Chat_Request message. Does not implicitly {@link lingcat.methods.Join_Chat_Request.verify|verify} messages.
             * @param message Join_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Join_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Join_Chat_Request message, length delimited. Does not implicitly {@link lingcat.methods.Join_Chat_Request.verify|verify} messages.
             * @param message Join_Chat_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Join_Chat_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Join_Chat_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Join_Chat_Request & lingcat.methods.Join_Chat_Request.$Shape} Join_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Join_Chat_Request & lingcat.methods.Join_Chat_Request.$Shape;

            /**
             * Decodes a Join_Chat_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Join_Chat_Request & lingcat.methods.Join_Chat_Request.$Shape} Join_Chat_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Join_Chat_Request & lingcat.methods.Join_Chat_Request.$Shape;

            /**
             * Verifies a Join_Chat_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Join_Chat_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Join_Chat_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Join_Chat_Request;

            /**
             * Creates a plain object from a Join_Chat_Request message. Also converts values to other types if specified.
             * @param message Join_Chat_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Join_Chat_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Join_Chat_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Join_Chat_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Join_Chat_Request {

            /** Properties of a Join_Chat_Request. */
            interface $Properties {

                /** Join_Chat_Request accessToken */
                accessToken?: (string|null);

                /** Join_Chat_Request chatId */
                chatId?: (string|null);

                /** Join_Chat_Request answer */
                answer?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Join_Chat_Request. */
            type $Shape = lingcat.methods.Join_Chat_Request.$Properties;
        }

        /**
         * Properties of a Join_Chat_Response.
         * @deprecated Use lingcat.methods.Join_Chat_Response.$Properties instead.
         */
        interface IJoin_Chat_Response extends lingcat.methods.Join_Chat_Response.$Properties {
        }

        /** Represents a Join_Chat_Response. */
        class Join_Chat_Response {

            /**
             * Constructs a new Join_Chat_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Join_Chat_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Join_Chat_Response pendingApproval. */
            pendingApproval: boolean;

            /**
             * Creates a new Join_Chat_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Join_Chat_Response instance
             */
            static create(properties: lingcat.methods.Join_Chat_Response.$Shape): lingcat.methods.Join_Chat_Response & lingcat.methods.Join_Chat_Response.$Shape;
            static create(properties?: lingcat.methods.Join_Chat_Response.$Properties): lingcat.methods.Join_Chat_Response;

            /**
             * Encodes the specified Join_Chat_Response message. Does not implicitly {@link lingcat.methods.Join_Chat_Response.verify|verify} messages.
             * @param message Join_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Join_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Join_Chat_Response message, length delimited. Does not implicitly {@link lingcat.methods.Join_Chat_Response.verify|verify} messages.
             * @param message Join_Chat_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Join_Chat_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Join_Chat_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Join_Chat_Response & lingcat.methods.Join_Chat_Response.$Shape} Join_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Join_Chat_Response & lingcat.methods.Join_Chat_Response.$Shape;

            /**
             * Decodes a Join_Chat_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Join_Chat_Response & lingcat.methods.Join_Chat_Response.$Shape} Join_Chat_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Join_Chat_Response & lingcat.methods.Join_Chat_Response.$Shape;

            /**
             * Verifies a Join_Chat_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Join_Chat_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Join_Chat_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Join_Chat_Response;

            /**
             * Creates a plain object from a Join_Chat_Response message. Also converts values to other types if specified.
             * @param message Join_Chat_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Join_Chat_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Join_Chat_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Join_Chat_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Join_Chat_Response {

            /** Properties of a Join_Chat_Response. */
            interface $Properties {

                /** Join_Chat_Response pendingApproval */
                pendingApproval?: (boolean|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Join_Chat_Response. */
            type $Shape = lingcat.methods.Join_Chat_Response.$Properties;
        }

        /**
         * Properties of a Remove_Chat_Member_Request.
         * @deprecated Use lingcat.methods.Remove_Chat_Member_Request.$Properties instead.
         */
        interface IRemove_Chat_Member_Request extends lingcat.methods.Remove_Chat_Member_Request.$Properties {
        }

        /** Represents a Remove_Chat_Member_Request. */
        class Remove_Chat_Member_Request {

            /**
             * Constructs a new Remove_Chat_Member_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Remove_Chat_Member_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Remove_Chat_Member_Request accessToken. */
            accessToken: string;

            /** Remove_Chat_Member_Request chatId. */
            chatId: string;

            /** Remove_Chat_Member_Request targetUserId. */
            targetUserId: string;

            /**
             * Creates a new Remove_Chat_Member_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Remove_Chat_Member_Request instance
             */
            static create(properties: lingcat.methods.Remove_Chat_Member_Request.$Shape): lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape;
            static create(properties?: lingcat.methods.Remove_Chat_Member_Request.$Properties): lingcat.methods.Remove_Chat_Member_Request;

            /**
             * Encodes the specified Remove_Chat_Member_Request message. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Request.verify|verify} messages.
             * @param message Remove_Chat_Member_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Remove_Chat_Member_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Remove_Chat_Member_Request message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Request.verify|verify} messages.
             * @param message Remove_Chat_Member_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Remove_Chat_Member_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Remove_Chat_Member_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape} Remove_Chat_Member_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape;

            /**
             * Decodes a Remove_Chat_Member_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape} Remove_Chat_Member_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Remove_Chat_Member_Request & lingcat.methods.Remove_Chat_Member_Request.$Shape;

            /**
             * Verifies a Remove_Chat_Member_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Remove_Chat_Member_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Remove_Chat_Member_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Remove_Chat_Member_Request;

            /**
             * Creates a plain object from a Remove_Chat_Member_Request message. Also converts values to other types if specified.
             * @param message Remove_Chat_Member_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Remove_Chat_Member_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Remove_Chat_Member_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Remove_Chat_Member_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Remove_Chat_Member_Request {

            /** Properties of a Remove_Chat_Member_Request. */
            interface $Properties {

                /** Remove_Chat_Member_Request accessToken */
                accessToken?: (string|null);

                /** Remove_Chat_Member_Request chatId */
                chatId?: (string|null);

                /** Remove_Chat_Member_Request targetUserId */
                targetUserId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Remove_Chat_Member_Request. */
            type $Shape = lingcat.methods.Remove_Chat_Member_Request.$Properties;
        }

        /**
         * Properties of a Remove_Chat_Member_Response.
         * @deprecated Use lingcat.methods.Remove_Chat_Member_Response.$Properties instead.
         */
        interface IRemove_Chat_Member_Response extends lingcat.methods.Remove_Chat_Member_Response.$Properties {
        }

        /** Represents a Remove_Chat_Member_Response. */
        class Remove_Chat_Member_Response {

            /**
             * Constructs a new Remove_Chat_Member_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Remove_Chat_Member_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Remove_Chat_Member_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Remove_Chat_Member_Response instance
             */
            static create(properties: lingcat.methods.Remove_Chat_Member_Response.$Shape): lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape;
            static create(properties?: lingcat.methods.Remove_Chat_Member_Response.$Properties): lingcat.methods.Remove_Chat_Member_Response;

            /**
             * Encodes the specified Remove_Chat_Member_Response message. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Response.verify|verify} messages.
             * @param message Remove_Chat_Member_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Remove_Chat_Member_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Remove_Chat_Member_Response message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Member_Response.verify|verify} messages.
             * @param message Remove_Chat_Member_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Remove_Chat_Member_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Remove_Chat_Member_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape} Remove_Chat_Member_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape;

            /**
             * Decodes a Remove_Chat_Member_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape} Remove_Chat_Member_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Remove_Chat_Member_Response & lingcat.methods.Remove_Chat_Member_Response.$Shape;

            /**
             * Verifies a Remove_Chat_Member_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Remove_Chat_Member_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Remove_Chat_Member_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Remove_Chat_Member_Response;

            /**
             * Creates a plain object from a Remove_Chat_Member_Response message. Also converts values to other types if specified.
             * @param message Remove_Chat_Member_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Remove_Chat_Member_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Remove_Chat_Member_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Remove_Chat_Member_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Remove_Chat_Member_Response {

            /** Properties of a Remove_Chat_Member_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Remove_Chat_Member_Response. */
            type $Shape = lingcat.methods.Remove_Chat_Member_Response.$Properties;
        }

        /**
         * Properties of an Update_Chat_Settings_Request.
         * @deprecated Use lingcat.methods.Update_Chat_Settings_Request.$Properties instead.
         */
        interface IUpdate_Chat_Settings_Request extends lingcat.methods.Update_Chat_Settings_Request.$Properties {
        }

        /** Represents an Update_Chat_Settings_Request. */
        class Update_Chat_Settings_Request {

            /**
             * Constructs a new Update_Chat_Settings_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Settings_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Update_Chat_Settings_Request accessToken. */
            accessToken: string;

            /** Update_Chat_Settings_Request chatId. */
            chatId: string;

            /** Update_Chat_Settings_Request settings. */
            settings: string;

            /**
             * Creates a new Update_Chat_Settings_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Settings_Request instance
             */
            static create(properties: lingcat.methods.Update_Chat_Settings_Request.$Shape): lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Settings_Request.$Properties): lingcat.methods.Update_Chat_Settings_Request;

            /**
             * Encodes the specified Update_Chat_Settings_Request message. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Request.verify|verify} messages.
             * @param message Update_Chat_Settings_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Settings_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Settings_Request message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Request.verify|verify} messages.
             * @param message Update_Chat_Settings_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Settings_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Settings_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape} Update_Chat_Settings_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape;

            /**
             * Decodes an Update_Chat_Settings_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape} Update_Chat_Settings_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Settings_Request & lingcat.methods.Update_Chat_Settings_Request.$Shape;

            /**
             * Verifies an Update_Chat_Settings_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Settings_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Settings_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Settings_Request;

            /**
             * Creates a plain object from an Update_Chat_Settings_Request message. Also converts values to other types if specified.
             * @param message Update_Chat_Settings_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Settings_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Settings_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Settings_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Settings_Request {

            /** Properties of an Update_Chat_Settings_Request. */
            interface $Properties {

                /** Update_Chat_Settings_Request accessToken */
                accessToken?: (string|null);

                /** Update_Chat_Settings_Request chatId */
                chatId?: (string|null);

                /** Update_Chat_Settings_Request settings */
                settings?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Settings_Request. */
            type $Shape = lingcat.methods.Update_Chat_Settings_Request.$Properties;
        }

        /**
         * Properties of an Update_Chat_Settings_Response.
         * @deprecated Use lingcat.methods.Update_Chat_Settings_Response.$Properties instead.
         */
        interface IUpdate_Chat_Settings_Response extends lingcat.methods.Update_Chat_Settings_Response.$Properties {
        }

        /** Represents an Update_Chat_Settings_Response. */
        class Update_Chat_Settings_Response {

            /**
             * Constructs a new Update_Chat_Settings_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Update_Chat_Settings_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Update_Chat_Settings_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Update_Chat_Settings_Response instance
             */
            static create(properties: lingcat.methods.Update_Chat_Settings_Response.$Shape): lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape;
            static create(properties?: lingcat.methods.Update_Chat_Settings_Response.$Properties): lingcat.methods.Update_Chat_Settings_Response;

            /**
             * Encodes the specified Update_Chat_Settings_Response message. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Response.verify|verify} messages.
             * @param message Update_Chat_Settings_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Update_Chat_Settings_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Update_Chat_Settings_Response message, length delimited. Does not implicitly {@link lingcat.methods.Update_Chat_Settings_Response.verify|verify} messages.
             * @param message Update_Chat_Settings_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Update_Chat_Settings_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Update_Chat_Settings_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape} Update_Chat_Settings_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape;

            /**
             * Decodes an Update_Chat_Settings_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape} Update_Chat_Settings_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Update_Chat_Settings_Response & lingcat.methods.Update_Chat_Settings_Response.$Shape;

            /**
             * Verifies an Update_Chat_Settings_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Update_Chat_Settings_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Update_Chat_Settings_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Update_Chat_Settings_Response;

            /**
             * Creates a plain object from an Update_Chat_Settings_Response message. Also converts values to other types if specified.
             * @param message Update_Chat_Settings_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Update_Chat_Settings_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Update_Chat_Settings_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Update_Chat_Settings_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Update_Chat_Settings_Response {

            /** Properties of an Update_Chat_Settings_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Update_Chat_Settings_Response. */
            type $Shape = lingcat.methods.Update_Chat_Settings_Response.$Properties;
        }

        /**
         * Properties of a Get_Chat_Admins_Request.
         * @deprecated Use lingcat.methods.Get_Chat_Admins_Request.$Properties instead.
         */
        interface IGet_Chat_Admins_Request extends lingcat.methods.Get_Chat_Admins_Request.$Properties {
        }

        /** Represents a Get_Chat_Admins_Request. */
        class Get_Chat_Admins_Request {

            /**
             * Constructs a new Get_Chat_Admins_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Admins_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Admins_Request accessToken. */
            accessToken: string;

            /** Get_Chat_Admins_Request chatId. */
            chatId: string;

            /**
             * Creates a new Get_Chat_Admins_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Admins_Request instance
             */
            static create(properties: lingcat.methods.Get_Chat_Admins_Request.$Shape): lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Admins_Request.$Properties): lingcat.methods.Get_Chat_Admins_Request;

            /**
             * Encodes the specified Get_Chat_Admins_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Request.verify|verify} messages.
             * @param message Get_Chat_Admins_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Admins_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Admins_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Request.verify|verify} messages.
             * @param message Get_Chat_Admins_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Admins_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Admins_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape} Get_Chat_Admins_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape;

            /**
             * Decodes a Get_Chat_Admins_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape} Get_Chat_Admins_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Admins_Request & lingcat.methods.Get_Chat_Admins_Request.$Shape;

            /**
             * Verifies a Get_Chat_Admins_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Admins_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Admins_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Admins_Request;

            /**
             * Creates a plain object from a Get_Chat_Admins_Request message. Also converts values to other types if specified.
             * @param message Get_Chat_Admins_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Admins_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Admins_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Admins_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Admins_Request {

            /** Properties of a Get_Chat_Admins_Request. */
            interface $Properties {

                /** Get_Chat_Admins_Request accessToken */
                accessToken?: (string|null);

                /** Get_Chat_Admins_Request chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Admins_Request. */
            type $Shape = lingcat.methods.Get_Chat_Admins_Request.$Properties;
        }

        /**
         * Properties of a Get_Chat_Admins_Response.
         * @deprecated Use lingcat.methods.Get_Chat_Admins_Response.$Properties instead.
         */
        interface IGet_Chat_Admins_Response extends lingcat.methods.Get_Chat_Admins_Response.$Properties {
        }

        /** Represents a Get_Chat_Admins_Response. */
        class Get_Chat_Admins_Response {

            /**
             * Constructs a new Get_Chat_Admins_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Admins_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Admins_Response admins. */
            admins: lingcat.classes.IChatAdmin.$Properties[];

            /**
             * Creates a new Get_Chat_Admins_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Admins_Response instance
             */
            static create(properties: lingcat.methods.Get_Chat_Admins_Response.$Shape): lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Admins_Response.$Properties): lingcat.methods.Get_Chat_Admins_Response;

            /**
             * Encodes the specified Get_Chat_Admins_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Response.verify|verify} messages.
             * @param message Get_Chat_Admins_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Admins_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Admins_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Admins_Response.verify|verify} messages.
             * @param message Get_Chat_Admins_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Admins_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Admins_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape} Get_Chat_Admins_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape;

            /**
             * Decodes a Get_Chat_Admins_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape} Get_Chat_Admins_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Admins_Response & lingcat.methods.Get_Chat_Admins_Response.$Shape;

            /**
             * Verifies a Get_Chat_Admins_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Admins_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Admins_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Admins_Response;

            /**
             * Creates a plain object from a Get_Chat_Admins_Response message. Also converts values to other types if specified.
             * @param message Get_Chat_Admins_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Admins_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Admins_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Admins_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Admins_Response {

            /** Properties of a Get_Chat_Admins_Response. */
            interface $Properties {

                /** Get_Chat_Admins_Response admins */
                admins?: (lingcat.classes.IChatAdmin.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Admins_Response. */
            type $Shape = lingcat.methods.Get_Chat_Admins_Response.$Properties;
        }

        /**
         * Properties of a Get_Chat_Members_Request.
         * @deprecated Use lingcat.methods.Get_Chat_Members_Request.$Properties instead.
         */
        interface IGet_Chat_Members_Request extends lingcat.methods.Get_Chat_Members_Request.$Properties {
        }

        /** Represents a Get_Chat_Members_Request. */
        class Get_Chat_Members_Request {

            /**
             * Constructs a new Get_Chat_Members_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Members_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Members_Request accessToken. */
            accessToken: string;

            /** Get_Chat_Members_Request chatId. */
            chatId: string;

            /**
             * Creates a new Get_Chat_Members_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Members_Request instance
             */
            static create(properties: lingcat.methods.Get_Chat_Members_Request.$Shape): lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Members_Request.$Properties): lingcat.methods.Get_Chat_Members_Request;

            /**
             * Encodes the specified Get_Chat_Members_Request message. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Request.verify|verify} messages.
             * @param message Get_Chat_Members_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Members_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Members_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Request.verify|verify} messages.
             * @param message Get_Chat_Members_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Members_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Members_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape} Get_Chat_Members_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape;

            /**
             * Decodes a Get_Chat_Members_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape} Get_Chat_Members_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Members_Request & lingcat.methods.Get_Chat_Members_Request.$Shape;

            /**
             * Verifies a Get_Chat_Members_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Members_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Members_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Members_Request;

            /**
             * Creates a plain object from a Get_Chat_Members_Request message. Also converts values to other types if specified.
             * @param message Get_Chat_Members_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Members_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Members_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Members_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Members_Request {

            /** Properties of a Get_Chat_Members_Request. */
            interface $Properties {

                /** Get_Chat_Members_Request accessToken */
                accessToken?: (string|null);

                /** Get_Chat_Members_Request chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Members_Request. */
            type $Shape = lingcat.methods.Get_Chat_Members_Request.$Properties;
        }

        /**
         * Properties of a Get_Chat_Members_Response.
         * @deprecated Use lingcat.methods.Get_Chat_Members_Response.$Properties instead.
         */
        interface IGet_Chat_Members_Response extends lingcat.methods.Get_Chat_Members_Response.$Properties {
        }

        /** Represents a Get_Chat_Members_Response. */
        class Get_Chat_Members_Response {

            /**
             * Constructs a new Get_Chat_Members_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Chat_Members_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Chat_Members_Response members. */
            members: lingcat.classes.IUser.$Properties[];

            /**
             * Creates a new Get_Chat_Members_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Chat_Members_Response instance
             */
            static create(properties: lingcat.methods.Get_Chat_Members_Response.$Shape): lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Chat_Members_Response.$Properties): lingcat.methods.Get_Chat_Members_Response;

            /**
             * Encodes the specified Get_Chat_Members_Response message. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Response.verify|verify} messages.
             * @param message Get_Chat_Members_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Chat_Members_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Chat_Members_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Chat_Members_Response.verify|verify} messages.
             * @param message Get_Chat_Members_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Chat_Members_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Chat_Members_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape} Get_Chat_Members_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape;

            /**
             * Decodes a Get_Chat_Members_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape} Get_Chat_Members_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Chat_Members_Response & lingcat.methods.Get_Chat_Members_Response.$Shape;

            /**
             * Verifies a Get_Chat_Members_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Chat_Members_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Chat_Members_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Chat_Members_Response;

            /**
             * Creates a plain object from a Get_Chat_Members_Response message. Also converts values to other types if specified.
             * @param message Get_Chat_Members_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Chat_Members_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Chat_Members_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Chat_Members_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Chat_Members_Response {

            /** Properties of a Get_Chat_Members_Response. */
            interface $Properties {

                /** Get_Chat_Members_Response members */
                members?: (lingcat.classes.IUser.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Chat_Members_Response. */
            type $Shape = lingcat.methods.Get_Chat_Members_Response.$Properties;
        }

        /**
         * Properties of an Add_Chat_Admin_Request.
         * @deprecated Use lingcat.methods.Add_Chat_Admin_Request.$Properties instead.
         */
        interface IAdd_Chat_Admin_Request extends lingcat.methods.Add_Chat_Admin_Request.$Properties {
        }

        /** Represents an Add_Chat_Admin_Request. */
        class Add_Chat_Admin_Request {

            /**
             * Constructs a new Add_Chat_Admin_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Add_Chat_Admin_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Add_Chat_Admin_Request accessToken. */
            accessToken: string;

            /** Add_Chat_Admin_Request chatId. */
            chatId: string;

            /** Add_Chat_Admin_Request targetUserId. */
            targetUserId: string;

            /** Add_Chat_Admin_Request permissions. */
            permissions?: (string|null);

            /**
             * Creates a new Add_Chat_Admin_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Add_Chat_Admin_Request instance
             */
            static create(properties: lingcat.methods.Add_Chat_Admin_Request.$Shape): lingcat.methods.Add_Chat_Admin_Request & lingcat.methods.Add_Chat_Admin_Request.$Shape;
            static create(properties?: lingcat.methods.Add_Chat_Admin_Request.$Properties): lingcat.methods.Add_Chat_Admin_Request;

            /**
             * Encodes the specified Add_Chat_Admin_Request message. Does not implicitly {@link lingcat.methods.Add_Chat_Admin_Request.verify|verify} messages.
             * @param message Add_Chat_Admin_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Add_Chat_Admin_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Add_Chat_Admin_Request message, length delimited. Does not implicitly {@link lingcat.methods.Add_Chat_Admin_Request.verify|verify} messages.
             * @param message Add_Chat_Admin_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Add_Chat_Admin_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Add_Chat_Admin_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Add_Chat_Admin_Request & lingcat.methods.Add_Chat_Admin_Request.$Shape} Add_Chat_Admin_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Add_Chat_Admin_Request & lingcat.methods.Add_Chat_Admin_Request.$Shape;

            /**
             * Decodes an Add_Chat_Admin_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Add_Chat_Admin_Request & lingcat.methods.Add_Chat_Admin_Request.$Shape} Add_Chat_Admin_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Add_Chat_Admin_Request & lingcat.methods.Add_Chat_Admin_Request.$Shape;

            /**
             * Verifies an Add_Chat_Admin_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Add_Chat_Admin_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Add_Chat_Admin_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Add_Chat_Admin_Request;

            /**
             * Creates a plain object from an Add_Chat_Admin_Request message. Also converts values to other types if specified.
             * @param message Add_Chat_Admin_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Add_Chat_Admin_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Add_Chat_Admin_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Add_Chat_Admin_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Add_Chat_Admin_Request {

            /** Properties of an Add_Chat_Admin_Request. */
            interface $Properties {

                /** Add_Chat_Admin_Request accessToken */
                accessToken?: (string|null);

                /** Add_Chat_Admin_Request chatId */
                chatId?: (string|null);

                /** Add_Chat_Admin_Request targetUserId */
                targetUserId?: (string|null);

                /** Add_Chat_Admin_Request permissions */
                permissions?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Add_Chat_Admin_Request. */
            type $Shape = lingcat.methods.Add_Chat_Admin_Request.$Properties;
        }

        /**
         * Properties of an Add_Chat_Admin_Response.
         * @deprecated Use lingcat.methods.Add_Chat_Admin_Response.$Properties instead.
         */
        interface IAdd_Chat_Admin_Response extends lingcat.methods.Add_Chat_Admin_Response.$Properties {
        }

        /** Represents an Add_Chat_Admin_Response. */
        class Add_Chat_Admin_Response {

            /**
             * Constructs a new Add_Chat_Admin_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Add_Chat_Admin_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Add_Chat_Admin_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Add_Chat_Admin_Response instance
             */
            static create(properties: lingcat.methods.Add_Chat_Admin_Response.$Shape): lingcat.methods.Add_Chat_Admin_Response & lingcat.methods.Add_Chat_Admin_Response.$Shape;
            static create(properties?: lingcat.methods.Add_Chat_Admin_Response.$Properties): lingcat.methods.Add_Chat_Admin_Response;

            /**
             * Encodes the specified Add_Chat_Admin_Response message. Does not implicitly {@link lingcat.methods.Add_Chat_Admin_Response.verify|verify} messages.
             * @param message Add_Chat_Admin_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Add_Chat_Admin_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Add_Chat_Admin_Response message, length delimited. Does not implicitly {@link lingcat.methods.Add_Chat_Admin_Response.verify|verify} messages.
             * @param message Add_Chat_Admin_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Add_Chat_Admin_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Add_Chat_Admin_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Add_Chat_Admin_Response & lingcat.methods.Add_Chat_Admin_Response.$Shape} Add_Chat_Admin_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Add_Chat_Admin_Response & lingcat.methods.Add_Chat_Admin_Response.$Shape;

            /**
             * Decodes an Add_Chat_Admin_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Add_Chat_Admin_Response & lingcat.methods.Add_Chat_Admin_Response.$Shape} Add_Chat_Admin_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Add_Chat_Admin_Response & lingcat.methods.Add_Chat_Admin_Response.$Shape;

            /**
             * Verifies an Add_Chat_Admin_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Add_Chat_Admin_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Add_Chat_Admin_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Add_Chat_Admin_Response;

            /**
             * Creates a plain object from an Add_Chat_Admin_Response message. Also converts values to other types if specified.
             * @param message Add_Chat_Admin_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Add_Chat_Admin_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Add_Chat_Admin_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Add_Chat_Admin_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Add_Chat_Admin_Response {

            /** Properties of an Add_Chat_Admin_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Add_Chat_Admin_Response. */
            type $Shape = lingcat.methods.Add_Chat_Admin_Response.$Properties;
        }

        /**
         * Properties of an Edit_Chat_Admin_Permissions_Request.
         * @deprecated Use lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties instead.
         */
        interface IEdit_Chat_Admin_Permissions_Request extends lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties {
        }

        /** Represents an Edit_Chat_Admin_Permissions_Request. */
        class Edit_Chat_Admin_Permissions_Request {

            /**
             * Constructs a new Edit_Chat_Admin_Permissions_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Edit_Chat_Admin_Permissions_Request accessToken. */
            accessToken: string;

            /** Edit_Chat_Admin_Permissions_Request chatId. */
            chatId: string;

            /** Edit_Chat_Admin_Permissions_Request targetUserId. */
            targetUserId: string;

            /** Edit_Chat_Admin_Permissions_Request permissions. */
            permissions: string;

            /**
             * Creates a new Edit_Chat_Admin_Permissions_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edit_Chat_Admin_Permissions_Request instance
             */
            static create(properties: lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape): lingcat.methods.Edit_Chat_Admin_Permissions_Request & lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape;
            static create(properties?: lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties): lingcat.methods.Edit_Chat_Admin_Permissions_Request;

            /**
             * Encodes the specified Edit_Chat_Admin_Permissions_Request message. Does not implicitly {@link lingcat.methods.Edit_Chat_Admin_Permissions_Request.verify|verify} messages.
             * @param message Edit_Chat_Admin_Permissions_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edit_Chat_Admin_Permissions_Request message, length delimited. Does not implicitly {@link lingcat.methods.Edit_Chat_Admin_Permissions_Request.verify|verify} messages.
             * @param message Edit_Chat_Admin_Permissions_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edit_Chat_Admin_Permissions_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Edit_Chat_Admin_Permissions_Request & lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape} Edit_Chat_Admin_Permissions_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Edit_Chat_Admin_Permissions_Request & lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape;

            /**
             * Decodes an Edit_Chat_Admin_Permissions_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Edit_Chat_Admin_Permissions_Request & lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape} Edit_Chat_Admin_Permissions_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Edit_Chat_Admin_Permissions_Request & lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Shape;

            /**
             * Verifies an Edit_Chat_Admin_Permissions_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edit_Chat_Admin_Permissions_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edit_Chat_Admin_Permissions_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Edit_Chat_Admin_Permissions_Request;

            /**
             * Creates a plain object from an Edit_Chat_Admin_Permissions_Request message. Also converts values to other types if specified.
             * @param message Edit_Chat_Admin_Permissions_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Edit_Chat_Admin_Permissions_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edit_Chat_Admin_Permissions_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Edit_Chat_Admin_Permissions_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Edit_Chat_Admin_Permissions_Request {

            /** Properties of an Edit_Chat_Admin_Permissions_Request. */
            interface $Properties {

                /** Edit_Chat_Admin_Permissions_Request accessToken */
                accessToken?: (string|null);

                /** Edit_Chat_Admin_Permissions_Request chatId */
                chatId?: (string|null);

                /** Edit_Chat_Admin_Permissions_Request targetUserId */
                targetUserId?: (string|null);

                /** Edit_Chat_Admin_Permissions_Request permissions */
                permissions?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Edit_Chat_Admin_Permissions_Request. */
            type $Shape = lingcat.methods.Edit_Chat_Admin_Permissions_Request.$Properties;
        }

        /**
         * Properties of an Edit_Chat_Admin_Permissions_Response.
         * @deprecated Use lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties instead.
         */
        interface IEdit_Chat_Admin_Permissions_Response extends lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties {
        }

        /** Represents an Edit_Chat_Admin_Permissions_Response. */
        class Edit_Chat_Admin_Permissions_Response {

            /**
             * Constructs a new Edit_Chat_Admin_Permissions_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Edit_Chat_Admin_Permissions_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edit_Chat_Admin_Permissions_Response instance
             */
            static create(properties: lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape): lingcat.methods.Edit_Chat_Admin_Permissions_Response & lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape;
            static create(properties?: lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties): lingcat.methods.Edit_Chat_Admin_Permissions_Response;

            /**
             * Encodes the specified Edit_Chat_Admin_Permissions_Response message. Does not implicitly {@link lingcat.methods.Edit_Chat_Admin_Permissions_Response.verify|verify} messages.
             * @param message Edit_Chat_Admin_Permissions_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edit_Chat_Admin_Permissions_Response message, length delimited. Does not implicitly {@link lingcat.methods.Edit_Chat_Admin_Permissions_Response.verify|verify} messages.
             * @param message Edit_Chat_Admin_Permissions_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edit_Chat_Admin_Permissions_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Edit_Chat_Admin_Permissions_Response & lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape} Edit_Chat_Admin_Permissions_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Edit_Chat_Admin_Permissions_Response & lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape;

            /**
             * Decodes an Edit_Chat_Admin_Permissions_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Edit_Chat_Admin_Permissions_Response & lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape} Edit_Chat_Admin_Permissions_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Edit_Chat_Admin_Permissions_Response & lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Shape;

            /**
             * Verifies an Edit_Chat_Admin_Permissions_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edit_Chat_Admin_Permissions_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edit_Chat_Admin_Permissions_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Edit_Chat_Admin_Permissions_Response;

            /**
             * Creates a plain object from an Edit_Chat_Admin_Permissions_Response message. Also converts values to other types if specified.
             * @param message Edit_Chat_Admin_Permissions_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Edit_Chat_Admin_Permissions_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edit_Chat_Admin_Permissions_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Edit_Chat_Admin_Permissions_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Edit_Chat_Admin_Permissions_Response {

            /** Properties of an Edit_Chat_Admin_Permissions_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Edit_Chat_Admin_Permissions_Response. */
            type $Shape = lingcat.methods.Edit_Chat_Admin_Permissions_Response.$Properties;
        }

        /**
         * Properties of a Remove_Chat_Admin_Request.
         * @deprecated Use lingcat.methods.Remove_Chat_Admin_Request.$Properties instead.
         */
        interface IRemove_Chat_Admin_Request extends lingcat.methods.Remove_Chat_Admin_Request.$Properties {
        }

        /** Represents a Remove_Chat_Admin_Request. */
        class Remove_Chat_Admin_Request {

            /**
             * Constructs a new Remove_Chat_Admin_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Remove_Chat_Admin_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Remove_Chat_Admin_Request accessToken. */
            accessToken: string;

            /** Remove_Chat_Admin_Request chatId. */
            chatId: string;

            /** Remove_Chat_Admin_Request targetUserId. */
            targetUserId: string;

            /**
             * Creates a new Remove_Chat_Admin_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Remove_Chat_Admin_Request instance
             */
            static create(properties: lingcat.methods.Remove_Chat_Admin_Request.$Shape): lingcat.methods.Remove_Chat_Admin_Request & lingcat.methods.Remove_Chat_Admin_Request.$Shape;
            static create(properties?: lingcat.methods.Remove_Chat_Admin_Request.$Properties): lingcat.methods.Remove_Chat_Admin_Request;

            /**
             * Encodes the specified Remove_Chat_Admin_Request message. Does not implicitly {@link lingcat.methods.Remove_Chat_Admin_Request.verify|verify} messages.
             * @param message Remove_Chat_Admin_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Remove_Chat_Admin_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Remove_Chat_Admin_Request message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Admin_Request.verify|verify} messages.
             * @param message Remove_Chat_Admin_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Remove_Chat_Admin_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Remove_Chat_Admin_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Admin_Request & lingcat.methods.Remove_Chat_Admin_Request.$Shape} Remove_Chat_Admin_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Remove_Chat_Admin_Request & lingcat.methods.Remove_Chat_Admin_Request.$Shape;

            /**
             * Decodes a Remove_Chat_Admin_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Admin_Request & lingcat.methods.Remove_Chat_Admin_Request.$Shape} Remove_Chat_Admin_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Remove_Chat_Admin_Request & lingcat.methods.Remove_Chat_Admin_Request.$Shape;

            /**
             * Verifies a Remove_Chat_Admin_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Remove_Chat_Admin_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Remove_Chat_Admin_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Remove_Chat_Admin_Request;

            /**
             * Creates a plain object from a Remove_Chat_Admin_Request message. Also converts values to other types if specified.
             * @param message Remove_Chat_Admin_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Remove_Chat_Admin_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Remove_Chat_Admin_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Remove_Chat_Admin_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Remove_Chat_Admin_Request {

            /** Properties of a Remove_Chat_Admin_Request. */
            interface $Properties {

                /** Remove_Chat_Admin_Request accessToken */
                accessToken?: (string|null);

                /** Remove_Chat_Admin_Request chatId */
                chatId?: (string|null);

                /** Remove_Chat_Admin_Request targetUserId */
                targetUserId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Remove_Chat_Admin_Request. */
            type $Shape = lingcat.methods.Remove_Chat_Admin_Request.$Properties;
        }

        /**
         * Properties of a Remove_Chat_Admin_Response.
         * @deprecated Use lingcat.methods.Remove_Chat_Admin_Response.$Properties instead.
         */
        interface IRemove_Chat_Admin_Response extends lingcat.methods.Remove_Chat_Admin_Response.$Properties {
        }

        /** Represents a Remove_Chat_Admin_Response. */
        class Remove_Chat_Admin_Response {

            /**
             * Constructs a new Remove_Chat_Admin_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Remove_Chat_Admin_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Remove_Chat_Admin_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Remove_Chat_Admin_Response instance
             */
            static create(properties: lingcat.methods.Remove_Chat_Admin_Response.$Shape): lingcat.methods.Remove_Chat_Admin_Response & lingcat.methods.Remove_Chat_Admin_Response.$Shape;
            static create(properties?: lingcat.methods.Remove_Chat_Admin_Response.$Properties): lingcat.methods.Remove_Chat_Admin_Response;

            /**
             * Encodes the specified Remove_Chat_Admin_Response message. Does not implicitly {@link lingcat.methods.Remove_Chat_Admin_Response.verify|verify} messages.
             * @param message Remove_Chat_Admin_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Remove_Chat_Admin_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Remove_Chat_Admin_Response message, length delimited. Does not implicitly {@link lingcat.methods.Remove_Chat_Admin_Response.verify|verify} messages.
             * @param message Remove_Chat_Admin_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Remove_Chat_Admin_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Remove_Chat_Admin_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Remove_Chat_Admin_Response & lingcat.methods.Remove_Chat_Admin_Response.$Shape} Remove_Chat_Admin_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Remove_Chat_Admin_Response & lingcat.methods.Remove_Chat_Admin_Response.$Shape;

            /**
             * Decodes a Remove_Chat_Admin_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Remove_Chat_Admin_Response & lingcat.methods.Remove_Chat_Admin_Response.$Shape} Remove_Chat_Admin_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Remove_Chat_Admin_Response & lingcat.methods.Remove_Chat_Admin_Response.$Shape;

            /**
             * Verifies a Remove_Chat_Admin_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Remove_Chat_Admin_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Remove_Chat_Admin_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Remove_Chat_Admin_Response;

            /**
             * Creates a plain object from a Remove_Chat_Admin_Response message. Also converts values to other types if specified.
             * @param message Remove_Chat_Admin_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Remove_Chat_Admin_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Remove_Chat_Admin_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Remove_Chat_Admin_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Remove_Chat_Admin_Response {

            /** Properties of a Remove_Chat_Admin_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Remove_Chat_Admin_Response. */
            type $Shape = lingcat.methods.Remove_Chat_Admin_Response.$Properties;
        }

        /**
         * Properties of a Verify_Password_Identity_Request.
         * @deprecated Use lingcat.methods.Verify_Password_Identity_Request.$Properties instead.
         */
        interface IVerify_Password_Identity_Request extends lingcat.methods.Verify_Password_Identity_Request.$Properties {
        }

        /** Represents a Verify_Password_Identity_Request. */
        class Verify_Password_Identity_Request {

            /**
             * Constructs a new Verify_Password_Identity_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Verify_Password_Identity_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Verify_Password_Identity_Request accessToken. */
            accessToken: string;

            /** Verify_Password_Identity_Request oldPassword. */
            oldPassword?: (string|null);

            /**
             * Creates a new Verify_Password_Identity_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Verify_Password_Identity_Request instance
             */
            static create(properties: lingcat.methods.Verify_Password_Identity_Request.$Shape): lingcat.methods.Verify_Password_Identity_Request & lingcat.methods.Verify_Password_Identity_Request.$Shape;
            static create(properties?: lingcat.methods.Verify_Password_Identity_Request.$Properties): lingcat.methods.Verify_Password_Identity_Request;

            /**
             * Encodes the specified Verify_Password_Identity_Request message. Does not implicitly {@link lingcat.methods.Verify_Password_Identity_Request.verify|verify} messages.
             * @param message Verify_Password_Identity_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Verify_Password_Identity_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Verify_Password_Identity_Request message, length delimited. Does not implicitly {@link lingcat.methods.Verify_Password_Identity_Request.verify|verify} messages.
             * @param message Verify_Password_Identity_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Verify_Password_Identity_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Verify_Password_Identity_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Verify_Password_Identity_Request & lingcat.methods.Verify_Password_Identity_Request.$Shape} Verify_Password_Identity_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Verify_Password_Identity_Request & lingcat.methods.Verify_Password_Identity_Request.$Shape;

            /**
             * Decodes a Verify_Password_Identity_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Verify_Password_Identity_Request & lingcat.methods.Verify_Password_Identity_Request.$Shape} Verify_Password_Identity_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Verify_Password_Identity_Request & lingcat.methods.Verify_Password_Identity_Request.$Shape;

            /**
             * Verifies a Verify_Password_Identity_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Verify_Password_Identity_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Verify_Password_Identity_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Verify_Password_Identity_Request;

            /**
             * Creates a plain object from a Verify_Password_Identity_Request message. Also converts values to other types if specified.
             * @param message Verify_Password_Identity_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Verify_Password_Identity_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Verify_Password_Identity_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Verify_Password_Identity_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Verify_Password_Identity_Request {

            /** Properties of a Verify_Password_Identity_Request. */
            interface $Properties {

                /** Verify_Password_Identity_Request accessToken */
                accessToken?: (string|null);

                /** Verify_Password_Identity_Request oldPassword */
                oldPassword?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Verify_Password_Identity_Request. */
            type $Shape = lingcat.methods.Verify_Password_Identity_Request.$Properties;
        }

        /**
         * Properties of a Verify_Password_Identity_Response.
         * @deprecated Use lingcat.methods.Verify_Password_Identity_Response.$Properties instead.
         */
        interface IVerify_Password_Identity_Response extends lingcat.methods.Verify_Password_Identity_Response.$Properties {
        }

        /** Represents a Verify_Password_Identity_Response. */
        class Verify_Password_Identity_Response {

            /**
             * Constructs a new Verify_Password_Identity_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Verify_Password_Identity_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Verify_Password_Identity_Response changeToken. */
            changeToken: string;

            /**
             * Creates a new Verify_Password_Identity_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Verify_Password_Identity_Response instance
             */
            static create(properties: lingcat.methods.Verify_Password_Identity_Response.$Shape): lingcat.methods.Verify_Password_Identity_Response & lingcat.methods.Verify_Password_Identity_Response.$Shape;
            static create(properties?: lingcat.methods.Verify_Password_Identity_Response.$Properties): lingcat.methods.Verify_Password_Identity_Response;

            /**
             * Encodes the specified Verify_Password_Identity_Response message. Does not implicitly {@link lingcat.methods.Verify_Password_Identity_Response.verify|verify} messages.
             * @param message Verify_Password_Identity_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Verify_Password_Identity_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Verify_Password_Identity_Response message, length delimited. Does not implicitly {@link lingcat.methods.Verify_Password_Identity_Response.verify|verify} messages.
             * @param message Verify_Password_Identity_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Verify_Password_Identity_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Verify_Password_Identity_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Verify_Password_Identity_Response & lingcat.methods.Verify_Password_Identity_Response.$Shape} Verify_Password_Identity_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Verify_Password_Identity_Response & lingcat.methods.Verify_Password_Identity_Response.$Shape;

            /**
             * Decodes a Verify_Password_Identity_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Verify_Password_Identity_Response & lingcat.methods.Verify_Password_Identity_Response.$Shape} Verify_Password_Identity_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Verify_Password_Identity_Response & lingcat.methods.Verify_Password_Identity_Response.$Shape;

            /**
             * Verifies a Verify_Password_Identity_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Verify_Password_Identity_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Verify_Password_Identity_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Verify_Password_Identity_Response;

            /**
             * Creates a plain object from a Verify_Password_Identity_Response message. Also converts values to other types if specified.
             * @param message Verify_Password_Identity_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Verify_Password_Identity_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Verify_Password_Identity_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Verify_Password_Identity_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Verify_Password_Identity_Response {

            /** Properties of a Verify_Password_Identity_Response. */
            interface $Properties {

                /** Verify_Password_Identity_Response changeToken */
                changeToken?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Verify_Password_Identity_Response. */
            type $Shape = lingcat.methods.Verify_Password_Identity_Response.$Properties;
        }

        /**
         * Properties of a Change_Password_Request.
         * @deprecated Use lingcat.methods.Change_Password_Request.$Properties instead.
         */
        interface IChange_Password_Request extends lingcat.methods.Change_Password_Request.$Properties {
        }

        /** Represents a Change_Password_Request. */
        class Change_Password_Request {

            /**
             * Constructs a new Change_Password_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Change_Password_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Change_Password_Request accessToken. */
            accessToken: string;

            /** Change_Password_Request changeToken. */
            changeToken: string;

            /** Change_Password_Request newPassword. */
            newPassword: string;

            /**
             * Creates a new Change_Password_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Change_Password_Request instance
             */
            static create(properties: lingcat.methods.Change_Password_Request.$Shape): lingcat.methods.Change_Password_Request & lingcat.methods.Change_Password_Request.$Shape;
            static create(properties?: lingcat.methods.Change_Password_Request.$Properties): lingcat.methods.Change_Password_Request;

            /**
             * Encodes the specified Change_Password_Request message. Does not implicitly {@link lingcat.methods.Change_Password_Request.verify|verify} messages.
             * @param message Change_Password_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Change_Password_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Change_Password_Request message, length delimited. Does not implicitly {@link lingcat.methods.Change_Password_Request.verify|verify} messages.
             * @param message Change_Password_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Change_Password_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Change_Password_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Change_Password_Request & lingcat.methods.Change_Password_Request.$Shape} Change_Password_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Change_Password_Request & lingcat.methods.Change_Password_Request.$Shape;

            /**
             * Decodes a Change_Password_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Change_Password_Request & lingcat.methods.Change_Password_Request.$Shape} Change_Password_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Change_Password_Request & lingcat.methods.Change_Password_Request.$Shape;

            /**
             * Verifies a Change_Password_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Change_Password_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Change_Password_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Change_Password_Request;

            /**
             * Creates a plain object from a Change_Password_Request message. Also converts values to other types if specified.
             * @param message Change_Password_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Change_Password_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Change_Password_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Change_Password_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Change_Password_Request {

            /** Properties of a Change_Password_Request. */
            interface $Properties {

                /** Change_Password_Request accessToken */
                accessToken?: (string|null);

                /** Change_Password_Request changeToken */
                changeToken?: (string|null);

                /** Change_Password_Request newPassword */
                newPassword?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Change_Password_Request. */
            type $Shape = lingcat.methods.Change_Password_Request.$Properties;
        }

        /**
         * Properties of a Change_Password_Response.
         * @deprecated Use lingcat.methods.Change_Password_Response.$Properties instead.
         */
        interface IChange_Password_Response extends lingcat.methods.Change_Password_Response.$Properties {
        }

        /** Represents a Change_Password_Response. */
        class Change_Password_Response {

            /**
             * Constructs a new Change_Password_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Change_Password_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Change_Password_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Change_Password_Response instance
             */
            static create(properties: lingcat.methods.Change_Password_Response.$Shape): lingcat.methods.Change_Password_Response & lingcat.methods.Change_Password_Response.$Shape;
            static create(properties?: lingcat.methods.Change_Password_Response.$Properties): lingcat.methods.Change_Password_Response;

            /**
             * Encodes the specified Change_Password_Response message. Does not implicitly {@link lingcat.methods.Change_Password_Response.verify|verify} messages.
             * @param message Change_Password_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Change_Password_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Change_Password_Response message, length delimited. Does not implicitly {@link lingcat.methods.Change_Password_Response.verify|verify} messages.
             * @param message Change_Password_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Change_Password_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Change_Password_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Change_Password_Response & lingcat.methods.Change_Password_Response.$Shape} Change_Password_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Change_Password_Response & lingcat.methods.Change_Password_Response.$Shape;

            /**
             * Decodes a Change_Password_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Change_Password_Response & lingcat.methods.Change_Password_Response.$Shape} Change_Password_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Change_Password_Response & lingcat.methods.Change_Password_Response.$Shape;

            /**
             * Verifies a Change_Password_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Change_Password_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Change_Password_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Change_Password_Response;

            /**
             * Creates a plain object from a Change_Password_Response message. Also converts values to other types if specified.
             * @param message Change_Password_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Change_Password_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Change_Password_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Change_Password_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Change_Password_Response {

            /** Properties of a Change_Password_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Change_Password_Response. */
            type $Shape = lingcat.methods.Change_Password_Response.$Properties;
        }

        /**
         * Properties of an Edit_Chat_Message_Request.
         * @deprecated Use lingcat.methods.Edit_Chat_Message_Request.$Properties instead.
         */
        interface IEdit_Chat_Message_Request extends lingcat.methods.Edit_Chat_Message_Request.$Properties {
        }

        /** Represents an Edit_Chat_Message_Request. */
        class Edit_Chat_Message_Request {

            /**
             * Constructs a new Edit_Chat_Message_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Edit_Chat_Message_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Edit_Chat_Message_Request accessToken. */
            accessToken: string;

            /** Edit_Chat_Message_Request chatId. */
            chatId: string;

            /** Edit_Chat_Message_Request messageId. */
            messageId: number;

            /** Edit_Chat_Message_Request text. */
            text: string;

            /** Edit_Chat_Message_Request entities. */
            entities: lingcat.classes.IMessageEntity.$Properties[];

            /**
             * Creates a new Edit_Chat_Message_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edit_Chat_Message_Request instance
             */
            static create(properties: lingcat.methods.Edit_Chat_Message_Request.$Shape): lingcat.methods.Edit_Chat_Message_Request & lingcat.methods.Edit_Chat_Message_Request.$Shape;
            static create(properties?: lingcat.methods.Edit_Chat_Message_Request.$Properties): lingcat.methods.Edit_Chat_Message_Request;

            /**
             * Encodes the specified Edit_Chat_Message_Request message. Does not implicitly {@link lingcat.methods.Edit_Chat_Message_Request.verify|verify} messages.
             * @param message Edit_Chat_Message_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Edit_Chat_Message_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edit_Chat_Message_Request message, length delimited. Does not implicitly {@link lingcat.methods.Edit_Chat_Message_Request.verify|verify} messages.
             * @param message Edit_Chat_Message_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Edit_Chat_Message_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edit_Chat_Message_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Edit_Chat_Message_Request & lingcat.methods.Edit_Chat_Message_Request.$Shape} Edit_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Edit_Chat_Message_Request & lingcat.methods.Edit_Chat_Message_Request.$Shape;

            /**
             * Decodes an Edit_Chat_Message_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Edit_Chat_Message_Request & lingcat.methods.Edit_Chat_Message_Request.$Shape} Edit_Chat_Message_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Edit_Chat_Message_Request & lingcat.methods.Edit_Chat_Message_Request.$Shape;

            /**
             * Verifies an Edit_Chat_Message_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edit_Chat_Message_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edit_Chat_Message_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Edit_Chat_Message_Request;

            /**
             * Creates a plain object from an Edit_Chat_Message_Request message. Also converts values to other types if specified.
             * @param message Edit_Chat_Message_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Edit_Chat_Message_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edit_Chat_Message_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Edit_Chat_Message_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Edit_Chat_Message_Request {

            /** Properties of an Edit_Chat_Message_Request. */
            interface $Properties {

                /** Edit_Chat_Message_Request accessToken */
                accessToken?: (string|null);

                /** Edit_Chat_Message_Request chatId */
                chatId?: (string|null);

                /** Edit_Chat_Message_Request messageId */
                messageId?: (number|null);

                /** Edit_Chat_Message_Request text */
                text?: (string|null);

                /** Edit_Chat_Message_Request entities */
                entities?: (lingcat.classes.IMessageEntity.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Edit_Chat_Message_Request. */
            type $Shape = lingcat.methods.Edit_Chat_Message_Request.$Properties;
        }

        /**
         * Properties of an Edit_Chat_Message_Response.
         * @deprecated Use lingcat.methods.Edit_Chat_Message_Response.$Properties instead.
         */
        interface IEdit_Chat_Message_Response extends lingcat.methods.Edit_Chat_Message_Response.$Properties {
        }

        /** Represents an Edit_Chat_Message_Response. */
        class Edit_Chat_Message_Response {

            /**
             * Constructs a new Edit_Chat_Message_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Edit_Chat_Message_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new Edit_Chat_Message_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edit_Chat_Message_Response instance
             */
            static create(properties: lingcat.methods.Edit_Chat_Message_Response.$Shape): lingcat.methods.Edit_Chat_Message_Response & lingcat.methods.Edit_Chat_Message_Response.$Shape;
            static create(properties?: lingcat.methods.Edit_Chat_Message_Response.$Properties): lingcat.methods.Edit_Chat_Message_Response;

            /**
             * Encodes the specified Edit_Chat_Message_Response message. Does not implicitly {@link lingcat.methods.Edit_Chat_Message_Response.verify|verify} messages.
             * @param message Edit_Chat_Message_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Edit_Chat_Message_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edit_Chat_Message_Response message, length delimited. Does not implicitly {@link lingcat.methods.Edit_Chat_Message_Response.verify|verify} messages.
             * @param message Edit_Chat_Message_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Edit_Chat_Message_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edit_Chat_Message_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Edit_Chat_Message_Response & lingcat.methods.Edit_Chat_Message_Response.$Shape} Edit_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Edit_Chat_Message_Response & lingcat.methods.Edit_Chat_Message_Response.$Shape;

            /**
             * Decodes an Edit_Chat_Message_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Edit_Chat_Message_Response & lingcat.methods.Edit_Chat_Message_Response.$Shape} Edit_Chat_Message_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Edit_Chat_Message_Response & lingcat.methods.Edit_Chat_Message_Response.$Shape;

            /**
             * Verifies an Edit_Chat_Message_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edit_Chat_Message_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edit_Chat_Message_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Edit_Chat_Message_Response;

            /**
             * Creates a plain object from an Edit_Chat_Message_Response message. Also converts values to other types if specified.
             * @param message Edit_Chat_Message_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Edit_Chat_Message_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edit_Chat_Message_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Edit_Chat_Message_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Edit_Chat_Message_Response {

            /** Properties of an Edit_Chat_Message_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Edit_Chat_Message_Response. */
            type $Shape = lingcat.methods.Edit_Chat_Message_Response.$Properties;
        }

        /**
         * Properties of a Message_Edited_Event.
         * @deprecated Use lingcat.methods.Message_Edited_Event.$Properties instead.
         */
        interface IMessage_Edited_Event extends lingcat.methods.Message_Edited_Event.$Properties {
        }

        /** Represents a Message_Edited_Event. */
        class Message_Edited_Event {

            /**
             * Constructs a new Message_Edited_Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Message_Edited_Event.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Message_Edited_Event id. */
            id: number;

            /** Message_Edited_Event chatId. */
            chatId: string;

            /** Message_Edited_Event text. */
            text: string;

            /** Message_Edited_Event entities. */
            entities: lingcat.classes.IMessageEntity.$Properties[];

            /** Message_Edited_Event editedAt. */
            editedAt: (number|Long);

            /**
             * Creates a new Message_Edited_Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Message_Edited_Event instance
             */
            static create(properties: lingcat.methods.Message_Edited_Event.$Shape): lingcat.methods.Message_Edited_Event & lingcat.methods.Message_Edited_Event.$Shape;
            static create(properties?: lingcat.methods.Message_Edited_Event.$Properties): lingcat.methods.Message_Edited_Event;

            /**
             * Encodes the specified Message_Edited_Event message. Does not implicitly {@link lingcat.methods.Message_Edited_Event.verify|verify} messages.
             * @param message Message_Edited_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Message_Edited_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Message_Edited_Event message, length delimited. Does not implicitly {@link lingcat.methods.Message_Edited_Event.verify|verify} messages.
             * @param message Message_Edited_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Message_Edited_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Message_Edited_Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Message_Edited_Event & lingcat.methods.Message_Edited_Event.$Shape} Message_Edited_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Message_Edited_Event & lingcat.methods.Message_Edited_Event.$Shape;

            /**
             * Decodes a Message_Edited_Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Message_Edited_Event & lingcat.methods.Message_Edited_Event.$Shape} Message_Edited_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Message_Edited_Event & lingcat.methods.Message_Edited_Event.$Shape;

            /**
             * Verifies a Message_Edited_Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Message_Edited_Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Message_Edited_Event
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Message_Edited_Event;

            /**
             * Creates a plain object from a Message_Edited_Event message. Also converts values to other types if specified.
             * @param message Message_Edited_Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Message_Edited_Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Message_Edited_Event to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Message_Edited_Event
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Message_Edited_Event {

            /** Properties of a Message_Edited_Event. */
            interface $Properties {

                /** Message_Edited_Event id */
                id?: (number|null);

                /** Message_Edited_Event chatId */
                chatId?: (string|null);

                /** Message_Edited_Event text */
                text?: (string|null);

                /** Message_Edited_Event entities */
                entities?: (lingcat.classes.IMessageEntity.$Properties[]|null);

                /** Message_Edited_Event editedAt */
                editedAt?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Message_Edited_Event. */
            type $Shape = lingcat.methods.Message_Edited_Event.$Properties;
        }

        /**
         * Properties of a Start_Meeting_Request.
         * @deprecated Use lingcat.methods.Start_Meeting_Request.$Properties instead.
         */
        interface IStart_Meeting_Request extends lingcat.methods.Start_Meeting_Request.$Properties {
        }

        /** Represents a Start_Meeting_Request. */
        class Start_Meeting_Request {

            /**
             * Constructs a new Start_Meeting_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Start_Meeting_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Start_Meeting_Request accessToken. */
            accessToken: string;

            /** Start_Meeting_Request chatId. */
            chatId: string;

            /** Start_Meeting_Request title. */
            title?: (string|null);

            /**
             * Creates a new Start_Meeting_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Start_Meeting_Request instance
             */
            static create(properties: lingcat.methods.Start_Meeting_Request.$Shape): lingcat.methods.Start_Meeting_Request & lingcat.methods.Start_Meeting_Request.$Shape;
            static create(properties?: lingcat.methods.Start_Meeting_Request.$Properties): lingcat.methods.Start_Meeting_Request;

            /**
             * Encodes the specified Start_Meeting_Request message. Does not implicitly {@link lingcat.methods.Start_Meeting_Request.verify|verify} messages.
             * @param message Start_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Start_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Start_Meeting_Request message, length delimited. Does not implicitly {@link lingcat.methods.Start_Meeting_Request.verify|verify} messages.
             * @param message Start_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Start_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Start_Meeting_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Start_Meeting_Request & lingcat.methods.Start_Meeting_Request.$Shape} Start_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Start_Meeting_Request & lingcat.methods.Start_Meeting_Request.$Shape;

            /**
             * Decodes a Start_Meeting_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Start_Meeting_Request & lingcat.methods.Start_Meeting_Request.$Shape} Start_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Start_Meeting_Request & lingcat.methods.Start_Meeting_Request.$Shape;

            /**
             * Verifies a Start_Meeting_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Start_Meeting_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Start_Meeting_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Start_Meeting_Request;

            /**
             * Creates a plain object from a Start_Meeting_Request message. Also converts values to other types if specified.
             * @param message Start_Meeting_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Start_Meeting_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Start_Meeting_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Start_Meeting_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Start_Meeting_Request {

            /** Properties of a Start_Meeting_Request. */
            interface $Properties {

                /** Start_Meeting_Request accessToken */
                accessToken?: (string|null);

                /** Start_Meeting_Request chatId */
                chatId?: (string|null);

                /** Start_Meeting_Request title */
                title?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Start_Meeting_Request. */
            type $Shape = lingcat.methods.Start_Meeting_Request.$Properties;
        }

        /**
         * Properties of a Start_Meeting_Response.
         * @deprecated Use lingcat.methods.Start_Meeting_Response.$Properties instead.
         */
        interface IStart_Meeting_Response extends lingcat.methods.Start_Meeting_Response.$Properties {
        }

        /** Represents a Start_Meeting_Response. */
        class Start_Meeting_Response {

            /**
             * Constructs a new Start_Meeting_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Start_Meeting_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Start_Meeting_Response meetingId. */
            meetingId: string;

            /** Start_Meeting_Response room. */
            room: string;

            /** Start_Meeting_Response starterUserId. */
            starterUserId: string;

            /**
             * Creates a new Start_Meeting_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Start_Meeting_Response instance
             */
            static create(properties: lingcat.methods.Start_Meeting_Response.$Shape): lingcat.methods.Start_Meeting_Response & lingcat.methods.Start_Meeting_Response.$Shape;
            static create(properties?: lingcat.methods.Start_Meeting_Response.$Properties): lingcat.methods.Start_Meeting_Response;

            /**
             * Encodes the specified Start_Meeting_Response message. Does not implicitly {@link lingcat.methods.Start_Meeting_Response.verify|verify} messages.
             * @param message Start_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Start_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Start_Meeting_Response message, length delimited. Does not implicitly {@link lingcat.methods.Start_Meeting_Response.verify|verify} messages.
             * @param message Start_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Start_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Start_Meeting_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Start_Meeting_Response & lingcat.methods.Start_Meeting_Response.$Shape} Start_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Start_Meeting_Response & lingcat.methods.Start_Meeting_Response.$Shape;

            /**
             * Decodes a Start_Meeting_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Start_Meeting_Response & lingcat.methods.Start_Meeting_Response.$Shape} Start_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Start_Meeting_Response & lingcat.methods.Start_Meeting_Response.$Shape;

            /**
             * Verifies a Start_Meeting_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Start_Meeting_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Start_Meeting_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Start_Meeting_Response;

            /**
             * Creates a plain object from a Start_Meeting_Response message. Also converts values to other types if specified.
             * @param message Start_Meeting_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Start_Meeting_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Start_Meeting_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Start_Meeting_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Start_Meeting_Response {

            /** Properties of a Start_Meeting_Response. */
            interface $Properties {

                /** Start_Meeting_Response meetingId */
                meetingId?: (string|null);

                /** Start_Meeting_Response room */
                room?: (string|null);

                /** Start_Meeting_Response starterUserId */
                starterUserId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Start_Meeting_Response. */
            type $Shape = lingcat.methods.Start_Meeting_Response.$Properties;
        }

        /**
         * Properties of a Get_Meeting_Token_Request.
         * @deprecated Use lingcat.methods.Get_Meeting_Token_Request.$Properties instead.
         */
        interface IGet_Meeting_Token_Request extends lingcat.methods.Get_Meeting_Token_Request.$Properties {
        }

        /** Represents a Get_Meeting_Token_Request. */
        class Get_Meeting_Token_Request {

            /**
             * Constructs a new Get_Meeting_Token_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Meeting_Token_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Meeting_Token_Request accessToken. */
            accessToken: string;

            /** Get_Meeting_Token_Request chatId. */
            chatId: string;

            /** Get_Meeting_Token_Request meetingId. */
            meetingId: string;

            /**
             * Creates a new Get_Meeting_Token_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Meeting_Token_Request instance
             */
            static create(properties: lingcat.methods.Get_Meeting_Token_Request.$Shape): lingcat.methods.Get_Meeting_Token_Request & lingcat.methods.Get_Meeting_Token_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Meeting_Token_Request.$Properties): lingcat.methods.Get_Meeting_Token_Request;

            /**
             * Encodes the specified Get_Meeting_Token_Request message. Does not implicitly {@link lingcat.methods.Get_Meeting_Token_Request.verify|verify} messages.
             * @param message Get_Meeting_Token_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Meeting_Token_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Meeting_Token_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Meeting_Token_Request.verify|verify} messages.
             * @param message Get_Meeting_Token_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Meeting_Token_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Meeting_Token_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Meeting_Token_Request & lingcat.methods.Get_Meeting_Token_Request.$Shape} Get_Meeting_Token_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Meeting_Token_Request & lingcat.methods.Get_Meeting_Token_Request.$Shape;

            /**
             * Decodes a Get_Meeting_Token_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Meeting_Token_Request & lingcat.methods.Get_Meeting_Token_Request.$Shape} Get_Meeting_Token_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Meeting_Token_Request & lingcat.methods.Get_Meeting_Token_Request.$Shape;

            /**
             * Verifies a Get_Meeting_Token_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Meeting_Token_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Meeting_Token_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Meeting_Token_Request;

            /**
             * Creates a plain object from a Get_Meeting_Token_Request message. Also converts values to other types if specified.
             * @param message Get_Meeting_Token_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Meeting_Token_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Meeting_Token_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Meeting_Token_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Meeting_Token_Request {

            /** Properties of a Get_Meeting_Token_Request. */
            interface $Properties {

                /** Get_Meeting_Token_Request accessToken */
                accessToken?: (string|null);

                /** Get_Meeting_Token_Request chatId */
                chatId?: (string|null);

                /** Get_Meeting_Token_Request meetingId */
                meetingId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Meeting_Token_Request. */
            type $Shape = lingcat.methods.Get_Meeting_Token_Request.$Properties;
        }

        /**
         * Properties of a Get_Meeting_Token_Response.
         * @deprecated Use lingcat.methods.Get_Meeting_Token_Response.$Properties instead.
         */
        interface IGet_Meeting_Token_Response extends lingcat.methods.Get_Meeting_Token_Response.$Properties {
        }

        /** Represents a Get_Meeting_Token_Response. */
        class Get_Meeting_Token_Response {

            /**
             * Constructs a new Get_Meeting_Token_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Meeting_Token_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Meeting_Token_Response url. */
            url: string;

            /** Get_Meeting_Token_Response room. */
            room: string;

            /** Get_Meeting_Token_Response token. */
            token: string;

            /** Get_Meeting_Token_Response maxParticipants. */
            maxParticipants: number;

            /**
             * Creates a new Get_Meeting_Token_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Meeting_Token_Response instance
             */
            static create(properties: lingcat.methods.Get_Meeting_Token_Response.$Shape): lingcat.methods.Get_Meeting_Token_Response & lingcat.methods.Get_Meeting_Token_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Meeting_Token_Response.$Properties): lingcat.methods.Get_Meeting_Token_Response;

            /**
             * Encodes the specified Get_Meeting_Token_Response message. Does not implicitly {@link lingcat.methods.Get_Meeting_Token_Response.verify|verify} messages.
             * @param message Get_Meeting_Token_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Meeting_Token_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Meeting_Token_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Meeting_Token_Response.verify|verify} messages.
             * @param message Get_Meeting_Token_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Meeting_Token_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Meeting_Token_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Meeting_Token_Response & lingcat.methods.Get_Meeting_Token_Response.$Shape} Get_Meeting_Token_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Meeting_Token_Response & lingcat.methods.Get_Meeting_Token_Response.$Shape;

            /**
             * Decodes a Get_Meeting_Token_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Meeting_Token_Response & lingcat.methods.Get_Meeting_Token_Response.$Shape} Get_Meeting_Token_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Meeting_Token_Response & lingcat.methods.Get_Meeting_Token_Response.$Shape;

            /**
             * Verifies a Get_Meeting_Token_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Meeting_Token_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Meeting_Token_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Meeting_Token_Response;

            /**
             * Creates a plain object from a Get_Meeting_Token_Response message. Also converts values to other types if specified.
             * @param message Get_Meeting_Token_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Meeting_Token_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Meeting_Token_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Meeting_Token_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Meeting_Token_Response {

            /** Properties of a Get_Meeting_Token_Response. */
            interface $Properties {

                /** Get_Meeting_Token_Response url */
                url?: (string|null);

                /** Get_Meeting_Token_Response room */
                room?: (string|null);

                /** Get_Meeting_Token_Response token */
                token?: (string|null);

                /** Get_Meeting_Token_Response maxParticipants */
                maxParticipants?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Meeting_Token_Response. */
            type $Shape = lingcat.methods.Get_Meeting_Token_Response.$Properties;
        }

        /**
         * Properties of an End_Meeting_Request.
         * @deprecated Use lingcat.methods.End_Meeting_Request.$Properties instead.
         */
        interface IEnd_Meeting_Request extends lingcat.methods.End_Meeting_Request.$Properties {
        }

        /** Represents an End_Meeting_Request. */
        class End_Meeting_Request {

            /**
             * Constructs a new End_Meeting_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.End_Meeting_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** End_Meeting_Request accessToken. */
            accessToken: string;

            /** End_Meeting_Request chatId. */
            chatId: string;

            /** End_Meeting_Request meetingId. */
            meetingId: string;

            /**
             * Creates a new End_Meeting_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns End_Meeting_Request instance
             */
            static create(properties: lingcat.methods.End_Meeting_Request.$Shape): lingcat.methods.End_Meeting_Request & lingcat.methods.End_Meeting_Request.$Shape;
            static create(properties?: lingcat.methods.End_Meeting_Request.$Properties): lingcat.methods.End_Meeting_Request;

            /**
             * Encodes the specified End_Meeting_Request message. Does not implicitly {@link lingcat.methods.End_Meeting_Request.verify|verify} messages.
             * @param message End_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.End_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified End_Meeting_Request message, length delimited. Does not implicitly {@link lingcat.methods.End_Meeting_Request.verify|verify} messages.
             * @param message End_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.End_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an End_Meeting_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.End_Meeting_Request & lingcat.methods.End_Meeting_Request.$Shape} End_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.End_Meeting_Request & lingcat.methods.End_Meeting_Request.$Shape;

            /**
             * Decodes an End_Meeting_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.End_Meeting_Request & lingcat.methods.End_Meeting_Request.$Shape} End_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.End_Meeting_Request & lingcat.methods.End_Meeting_Request.$Shape;

            /**
             * Verifies an End_Meeting_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an End_Meeting_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns End_Meeting_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.End_Meeting_Request;

            /**
             * Creates a plain object from an End_Meeting_Request message. Also converts values to other types if specified.
             * @param message End_Meeting_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.End_Meeting_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this End_Meeting_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for End_Meeting_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace End_Meeting_Request {

            /** Properties of an End_Meeting_Request. */
            interface $Properties {

                /** End_Meeting_Request accessToken */
                accessToken?: (string|null);

                /** End_Meeting_Request chatId */
                chatId?: (string|null);

                /** End_Meeting_Request meetingId */
                meetingId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an End_Meeting_Request. */
            type $Shape = lingcat.methods.End_Meeting_Request.$Properties;
        }

        /**
         * Properties of an End_Meeting_Response.
         * @deprecated Use lingcat.methods.End_Meeting_Response.$Properties instead.
         */
        interface IEnd_Meeting_Response extends lingcat.methods.End_Meeting_Response.$Properties {
        }

        /** Represents an End_Meeting_Response. */
        class End_Meeting_Response {

            /**
             * Constructs a new End_Meeting_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.End_Meeting_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /**
             * Creates a new End_Meeting_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns End_Meeting_Response instance
             */
            static create(properties: lingcat.methods.End_Meeting_Response.$Shape): lingcat.methods.End_Meeting_Response & lingcat.methods.End_Meeting_Response.$Shape;
            static create(properties?: lingcat.methods.End_Meeting_Response.$Properties): lingcat.methods.End_Meeting_Response;

            /**
             * Encodes the specified End_Meeting_Response message. Does not implicitly {@link lingcat.methods.End_Meeting_Response.verify|verify} messages.
             * @param message End_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.End_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified End_Meeting_Response message, length delimited. Does not implicitly {@link lingcat.methods.End_Meeting_Response.verify|verify} messages.
             * @param message End_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.End_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an End_Meeting_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.End_Meeting_Response & lingcat.methods.End_Meeting_Response.$Shape} End_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.End_Meeting_Response & lingcat.methods.End_Meeting_Response.$Shape;

            /**
             * Decodes an End_Meeting_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.End_Meeting_Response & lingcat.methods.End_Meeting_Response.$Shape} End_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.End_Meeting_Response & lingcat.methods.End_Meeting_Response.$Shape;

            /**
             * Verifies an End_Meeting_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an End_Meeting_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns End_Meeting_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.End_Meeting_Response;

            /**
             * Creates a plain object from an End_Meeting_Response message. Also converts values to other types if specified.
             * @param message End_Meeting_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.End_Meeting_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this End_Meeting_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for End_Meeting_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace End_Meeting_Response {

            /** Properties of an End_Meeting_Response. */
            interface $Properties {

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an End_Meeting_Response. */
            type $Shape = lingcat.methods.End_Meeting_Response.$Properties;
        }

        /**
         * Properties of a Meeting_Started_Event.
         * @deprecated Use lingcat.methods.Meeting_Started_Event.$Properties instead.
         */
        interface IMeeting_Started_Event extends lingcat.methods.Meeting_Started_Event.$Properties {
        }

        /** Represents a Meeting_Started_Event. */
        class Meeting_Started_Event {

            /**
             * Constructs a new Meeting_Started_Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Meeting_Started_Event.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Meeting_Started_Event chatId. */
            chatId: string;

            /** Meeting_Started_Event meetingId. */
            meetingId: string;

            /** Meeting_Started_Event room. */
            room: string;

            /** Meeting_Started_Event starterUserId. */
            starterUserId: string;

            /** Meeting_Started_Event title. */
            title?: (string|null);

            /**
             * Creates a new Meeting_Started_Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Meeting_Started_Event instance
             */
            static create(properties: lingcat.methods.Meeting_Started_Event.$Shape): lingcat.methods.Meeting_Started_Event & lingcat.methods.Meeting_Started_Event.$Shape;
            static create(properties?: lingcat.methods.Meeting_Started_Event.$Properties): lingcat.methods.Meeting_Started_Event;

            /**
             * Encodes the specified Meeting_Started_Event message. Does not implicitly {@link lingcat.methods.Meeting_Started_Event.verify|verify} messages.
             * @param message Meeting_Started_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Meeting_Started_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Meeting_Started_Event message, length delimited. Does not implicitly {@link lingcat.methods.Meeting_Started_Event.verify|verify} messages.
             * @param message Meeting_Started_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Meeting_Started_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Meeting_Started_Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Meeting_Started_Event & lingcat.methods.Meeting_Started_Event.$Shape} Meeting_Started_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Meeting_Started_Event & lingcat.methods.Meeting_Started_Event.$Shape;

            /**
             * Decodes a Meeting_Started_Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Meeting_Started_Event & lingcat.methods.Meeting_Started_Event.$Shape} Meeting_Started_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Meeting_Started_Event & lingcat.methods.Meeting_Started_Event.$Shape;

            /**
             * Verifies a Meeting_Started_Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Meeting_Started_Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Meeting_Started_Event
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Meeting_Started_Event;

            /**
             * Creates a plain object from a Meeting_Started_Event message. Also converts values to other types if specified.
             * @param message Meeting_Started_Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Meeting_Started_Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Meeting_Started_Event to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Meeting_Started_Event
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Meeting_Started_Event {

            /** Properties of a Meeting_Started_Event. */
            interface $Properties {

                /** Meeting_Started_Event chatId */
                chatId?: (string|null);

                /** Meeting_Started_Event meetingId */
                meetingId?: (string|null);

                /** Meeting_Started_Event room */
                room?: (string|null);

                /** Meeting_Started_Event starterUserId */
                starterUserId?: (string|null);

                /** Meeting_Started_Event title */
                title?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Meeting_Started_Event. */
            type $Shape = lingcat.methods.Meeting_Started_Event.$Properties;
        }

        /**
         * Properties of a Meeting_Ended_Event.
         * @deprecated Use lingcat.methods.Meeting_Ended_Event.$Properties instead.
         */
        interface IMeeting_Ended_Event extends lingcat.methods.Meeting_Ended_Event.$Properties {
        }

        /** Represents a Meeting_Ended_Event. */
        class Meeting_Ended_Event {

            /**
             * Constructs a new Meeting_Ended_Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Meeting_Ended_Event.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Meeting_Ended_Event chatId. */
            chatId: string;

            /** Meeting_Ended_Event meetingId. */
            meetingId: string;

            /**
             * Creates a new Meeting_Ended_Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Meeting_Ended_Event instance
             */
            static create(properties: lingcat.methods.Meeting_Ended_Event.$Shape): lingcat.methods.Meeting_Ended_Event & lingcat.methods.Meeting_Ended_Event.$Shape;
            static create(properties?: lingcat.methods.Meeting_Ended_Event.$Properties): lingcat.methods.Meeting_Ended_Event;

            /**
             * Encodes the specified Meeting_Ended_Event message. Does not implicitly {@link lingcat.methods.Meeting_Ended_Event.verify|verify} messages.
             * @param message Meeting_Ended_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Meeting_Ended_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Meeting_Ended_Event message, length delimited. Does not implicitly {@link lingcat.methods.Meeting_Ended_Event.verify|verify} messages.
             * @param message Meeting_Ended_Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Meeting_Ended_Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Meeting_Ended_Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Meeting_Ended_Event & lingcat.methods.Meeting_Ended_Event.$Shape} Meeting_Ended_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Meeting_Ended_Event & lingcat.methods.Meeting_Ended_Event.$Shape;

            /**
             * Decodes a Meeting_Ended_Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Meeting_Ended_Event & lingcat.methods.Meeting_Ended_Event.$Shape} Meeting_Ended_Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Meeting_Ended_Event & lingcat.methods.Meeting_Ended_Event.$Shape;

            /**
             * Verifies a Meeting_Ended_Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Meeting_Ended_Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Meeting_Ended_Event
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Meeting_Ended_Event;

            /**
             * Creates a plain object from a Meeting_Ended_Event message. Also converts values to other types if specified.
             * @param message Meeting_Ended_Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Meeting_Ended_Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Meeting_Ended_Event to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Meeting_Ended_Event
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Meeting_Ended_Event {

            /** Properties of a Meeting_Ended_Event. */
            interface $Properties {

                /** Meeting_Ended_Event chatId */
                chatId?: (string|null);

                /** Meeting_Ended_Event meetingId */
                meetingId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Meeting_Ended_Event. */
            type $Shape = lingcat.methods.Meeting_Ended_Event.$Properties;
        }

        /**
         * Properties of a Get_Active_Meeting_Request.
         * @deprecated Use lingcat.methods.Get_Active_Meeting_Request.$Properties instead.
         */
        interface IGet_Active_Meeting_Request extends lingcat.methods.Get_Active_Meeting_Request.$Properties {
        }

        /** Represents a Get_Active_Meeting_Request. */
        class Get_Active_Meeting_Request {

            /**
             * Constructs a new Get_Active_Meeting_Request.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Active_Meeting_Request.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Active_Meeting_Request accessToken. */
            accessToken: string;

            /** Get_Active_Meeting_Request chatId. */
            chatId: string;

            /**
             * Creates a new Get_Active_Meeting_Request instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Active_Meeting_Request instance
             */
            static create(properties: lingcat.methods.Get_Active_Meeting_Request.$Shape): lingcat.methods.Get_Active_Meeting_Request & lingcat.methods.Get_Active_Meeting_Request.$Shape;
            static create(properties?: lingcat.methods.Get_Active_Meeting_Request.$Properties): lingcat.methods.Get_Active_Meeting_Request;

            /**
             * Encodes the specified Get_Active_Meeting_Request message. Does not implicitly {@link lingcat.methods.Get_Active_Meeting_Request.verify|verify} messages.
             * @param message Get_Active_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Active_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Active_Meeting_Request message, length delimited. Does not implicitly {@link lingcat.methods.Get_Active_Meeting_Request.verify|verify} messages.
             * @param message Get_Active_Meeting_Request message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Active_Meeting_Request.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Active_Meeting_Request message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Active_Meeting_Request & lingcat.methods.Get_Active_Meeting_Request.$Shape} Get_Active_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Active_Meeting_Request & lingcat.methods.Get_Active_Meeting_Request.$Shape;

            /**
             * Decodes a Get_Active_Meeting_Request message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Active_Meeting_Request & lingcat.methods.Get_Active_Meeting_Request.$Shape} Get_Active_Meeting_Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Active_Meeting_Request & lingcat.methods.Get_Active_Meeting_Request.$Shape;

            /**
             * Verifies a Get_Active_Meeting_Request message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Active_Meeting_Request message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Active_Meeting_Request
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Active_Meeting_Request;

            /**
             * Creates a plain object from a Get_Active_Meeting_Request message. Also converts values to other types if specified.
             * @param message Get_Active_Meeting_Request
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Active_Meeting_Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Active_Meeting_Request to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Active_Meeting_Request
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Active_Meeting_Request {

            /** Properties of a Get_Active_Meeting_Request. */
            interface $Properties {

                /** Get_Active_Meeting_Request accessToken */
                accessToken?: (string|null);

                /** Get_Active_Meeting_Request chatId */
                chatId?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Active_Meeting_Request. */
            type $Shape = lingcat.methods.Get_Active_Meeting_Request.$Properties;
        }

        /**
         * Properties of a Get_Active_Meeting_Response.
         * @deprecated Use lingcat.methods.Get_Active_Meeting_Response.$Properties instead.
         */
        interface IGet_Active_Meeting_Response extends lingcat.methods.Get_Active_Meeting_Response.$Properties {
        }

        /** Represents a Get_Active_Meeting_Response. */
        class Get_Active_Meeting_Response {

            /**
             * Constructs a new Get_Active_Meeting_Response.
             * @param [properties] Properties to set
             */
            constructor(properties?: lingcat.methods.Get_Active_Meeting_Response.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Get_Active_Meeting_Response meetingId. */
            meetingId: string;

            /** Get_Active_Meeting_Response hasMeeting. */
            hasMeeting: boolean;

            /** Get_Active_Meeting_Response room. */
            room: string;

            /** Get_Active_Meeting_Response starterUserId. */
            starterUserId: string;

            /** Get_Active_Meeting_Response title. */
            title?: (string|null);

            /**
             * Creates a new Get_Active_Meeting_Response instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Get_Active_Meeting_Response instance
             */
            static create(properties: lingcat.methods.Get_Active_Meeting_Response.$Shape): lingcat.methods.Get_Active_Meeting_Response & lingcat.methods.Get_Active_Meeting_Response.$Shape;
            static create(properties?: lingcat.methods.Get_Active_Meeting_Response.$Properties): lingcat.methods.Get_Active_Meeting_Response;

            /**
             * Encodes the specified Get_Active_Meeting_Response message. Does not implicitly {@link lingcat.methods.Get_Active_Meeting_Response.verify|verify} messages.
             * @param message Get_Active_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: lingcat.methods.Get_Active_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Get_Active_Meeting_Response message, length delimited. Does not implicitly {@link lingcat.methods.Get_Active_Meeting_Response.verify|verify} messages.
             * @param message Get_Active_Meeting_Response message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: lingcat.methods.Get_Active_Meeting_Response.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Get_Active_Meeting_Response message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {lingcat.methods.Get_Active_Meeting_Response & lingcat.methods.Get_Active_Meeting_Response.$Shape} Get_Active_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lingcat.methods.Get_Active_Meeting_Response & lingcat.methods.Get_Active_Meeting_Response.$Shape;

            /**
             * Decodes a Get_Active_Meeting_Response message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {lingcat.methods.Get_Active_Meeting_Response & lingcat.methods.Get_Active_Meeting_Response.$Shape} Get_Active_Meeting_Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lingcat.methods.Get_Active_Meeting_Response & lingcat.methods.Get_Active_Meeting_Response.$Shape;

            /**
             * Verifies a Get_Active_Meeting_Response message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Get_Active_Meeting_Response message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Get_Active_Meeting_Response
             */
            static fromObject(object: { [k: string]: any }): lingcat.methods.Get_Active_Meeting_Response;

            /**
             * Creates a plain object from a Get_Active_Meeting_Response message. Also converts values to other types if specified.
             * @param message Get_Active_Meeting_Response
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: lingcat.methods.Get_Active_Meeting_Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Get_Active_Meeting_Response to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Get_Active_Meeting_Response
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Get_Active_Meeting_Response {

            /** Properties of a Get_Active_Meeting_Response. */
            interface $Properties {

                /** Get_Active_Meeting_Response meetingId */
                meetingId?: (string|null);

                /** Get_Active_Meeting_Response hasMeeting */
                hasMeeting?: (boolean|null);

                /** Get_Active_Meeting_Response room */
                room?: (string|null);

                /** Get_Active_Meeting_Response starterUserId */
                starterUserId?: (string|null);

                /** Get_Active_Meeting_Response title */
                title?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Get_Active_Meeting_Response. */
            type $Shape = lingcat.methods.Get_Active_Meeting_Response.$Properties;
        }
    }
}
