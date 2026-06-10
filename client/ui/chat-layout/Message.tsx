import Markdown, { ReactRenderer } from "marked-react"
import default_avatar from '../../default_avatar.png'
import ReloadableImage from "../ReloadableImage"
import React from "react"

type Render = Partial<ReactRenderer>

function TextContainer({ children }: { children: React.ReactNode }) {
    return <div style={{
        padding: '13px',
    }}>
        {children}
    </div>
}

export default function Message({ message, senderName, render }: { message: string, senderName: string, render?: Render }) {
    const isAtRight = true
    const hideSender = false

    const defaultRender: Render = {
        text(text) {
            // console.log('text', text)
            return text
        },
        heading(children, _heading) {
            // console.log('heading', children)
            return <span>{children}</span>
        },
        paragraph(children) {
            // console.log('paragraph', children)
            const ls = []
            let cache: React.ReactNode[] = []
            React.Children.map(children, (child, _index) => {
                if (React.isValidElement(child)) {
                    if (child.type instanceof Function) {
                        ls.push(<TextContainer>{cache}</TextContainer>)
                        cache = []
                        ls.push(child)
                    } else {
                        cache.push(child)
                    }
                }
                if (typeof child == 'string') {
                    cache.push(child)
                }
            })
            ls.push(<TextContainer>{cache}</TextContainer>)
            return <span>{ls}</span>
        },
        image(src, alt, title) {
            // console.log('image', src)
            return <ReloadableImage src={src} alt={alt} />
        },
        ...render
    }

    return <mdui-layout-item style={{
        padding: '10px',
    }}>
        <div
            style={{
                width: "100%",
                display: 'flex',
                justifyContent: isAtRight ? "flex-end" : "flex-start",
                flexDirection: "column"
            }}>
            {
                <div
                    style={{
                        display: hideSender ? "none" : "flex",
                        justifyContent: isAtRight ? "flex-end" : "flex-start",
                    }}>
                    {
                        // 发送者昵称(左)
                        isAtRight && <span
                            style={{
                                alignSelf: "center",
                                fontSize: "90%"
                            }}>
                            {senderName}
                        </span>
                    }
                    {
                        // 发送者头像
                    }
                    <mdui-avatar
                        slot="trigger"
                        src={default_avatar}
                        style={{
                            width: "43px",
                            height: "43px",
                            margin: "11px"
                        }} />
                    {
                        // 发送者昵称(右)
                        !isAtRight && <span
                            style={{
                                alignSelf: "center",
                                fontSize: "90%"
                            }}>
                            {senderName}
                        </span>
                    }
                </div>
            }
            <mdui-card
                variant="elevated"
                style={{
                    maxWidth: (window.matchMedia('(pointer: fine)') && "50%") || (window.matchMedia('(pointer: coarse)') && "77%"),
                    minWidth: "0%",
                    [isAtRight ? "marginRight" : "marginLeft"]: "55px",
                    marginTop: hideSender ? '5px' : "-5px",
                    alignSelf: isAtRight ? "flex-end" : "flex-start",
                }}>
                <span
                    id="msg"
                    style={{
                        fontSize: "94%",
                        wordBreak: 'break-word',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                    <Markdown value={message} renderer={defaultRender} />
                </span>
            </mdui-card>

        </div>

    </mdui-layout-item>
}