import Markdown, { ReactRenderer } from "marked-react"
import ReloadableImage from "../ReloadableImage"
import React from "react"
import { Dropdown } from "mdui"
import useEventListener from "../useEventListener.ts"
import isMobileUI from "../isMobileUI.ts"

type Render = Partial<ReactRenderer>

function TextContainer({ children }: { children: React.ReactNode }) {
    return <div style={{
        padding: '13px',
    }}>
        {children}
    </div>
}

function TextContainerSystem({ children }: { children: React.ReactNode }) {
    return <div style={{
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '17px',
        paddingRight: '17px',
    }}>
        {children}
    </div>
}

function ChatQuote({ children }: { children: React.ReactNode }) {
    const [ellipsis, setEllipsis] = React.useState(true);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            color: 'rgb(var(--mdui-color-primary))',
            textDecoration: 'none',
            cursor: 'pointer',
            display: 'block',
        }} onClick={() => {
            setEllipsis((prev) => !prev)
        }}>
            <style>
                {ellipsis
                    ? `br { display: none; }`
                    : `br { display: inline; }`
                }
            </style>
            <span style={{
                display: 'block',
                wordWrap: 'break-word',
                wordBreak: 'break-all',
                maxWidth: '100%',
                fontSynthesis: 'style weight',
                whiteSpace: ellipsis ? 'nowrap' : 'pre-wrap',
                overflow: ellipsis ? 'hidden' : 'visible',
                textOverflow: ellipsis ? 'ellipsis' : 'unset',
            }}>{children}</span>
        </div>
    )
}
// ChatQuote.inline = true

export default function Message({
    message,
    senderName,
    render,
    hideSender,
    isAtRight,
    isSystem,
    avatar,
    onAvatarClick,
    time,
    messageMenus,
    avatarMenus,
}: {
    message: string
    avatar: string
    senderName: string
    render?: Render
    isSystem?: boolean
    hideSender?: boolean
    isAtRight?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
    time?: number,
}) {
    const defaultRender: Render = {
        text(text) {
            // console.log('text', text)
            return text
        },
        heading(children, _heading) {
            // console.log('heading', children)
            return <span>{children}</span>
        },
        blockquote(children) {
            return <div style={{ width: '100%', overflow: 'hidden' }}>
                <ChatQuote>{children}</ChatQuote>
            </div>
        },
        paragraph(children) {
            const elements: React.ReactNode[] = []
            let cache: React.ReactNode[] = []

            const flushCache = () => {
                if (cache.length > 0) {
                    if (isSystem)
                        elements.push(<TextContainerSystem>{cache}</TextContainerSystem>)
                    else
                        elements.push(<TextContainer>{cache}</TextContainer>)
                    cache = []
                }
            }

            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    // 如果是自定义组件（函数组件），视为“块级元素”
                    if (child.type instanceof Function/*  && !(child.type as any).inline */) {
                        // 先输出之前的文本缓存
                        flushCache()
                        // 直接添加图片本身，不包裹额外容器
                        elements.push(child)
                    } else {
                        // 普通内置元素（span, a 等）放入缓存
                        // 以及内联组件
                        cache.push(child)
                    }
                } else if (typeof child == 'string') {
                    cache.push(child)
                }
                // 其他类型（number, boolean 等）也可按需处理
            })
            // 末尾剩余的缓存
            flushCache()
            return <span>{elements}</span>
        },
        image(src, alt, _title) {
            // console.log('image', src)
            return <ReloadableImage src={src} alt={alt} />
        },
        ...render,
    }

    const dropDownRef = React.useRef<Dropdown>(null)
    useEventListener(dropDownRef, 'closed', () => {
        setDropDownOpen(false)
    })

    const avatarDropDownRef = React.useRef<Dropdown>(null)
    useEventListener(avatarDropDownRef, 'closed', () => {
        setAvatarDropDownOpen(false)
    })

    const [isDropDownOpen, setDropDownOpen_] = React.useState(false)
    const [isAvatarDropDownOpen, setAvatarDropDownOpen_] = React.useState(false)

    function setDropDownOpen(open: boolean) {
        setDropDownOpen_(open)
    }

    function setAvatarDropDownOpen(open: boolean) {
        setAvatarDropDownOpen_(open)
    }

    return isSystem
        ? <div style={{
            width: '100%',
            flexDirection: 'column',
            display: 'flex',
            marginTop: '25px',
            marginBottom: '20px',
        }}
            onContextMenu={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() != 'div') return
                if (isMobileUI()) return
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}
            onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() != 'div') return
                if (!isMobileUI()) {
                    isDropDownOpen && setDropDownOpen(false)
                    return
                }
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}>
            <div style={{ display: 'none' }} ref={avatarDropDownRef as any} />
            <mdui-dropdown ref={dropDownRef} open={isDropDownOpen} trigger="manual">
                <mdui-card slot="trigger"
                    variant="filled"
                    style={{
                        alignSelf: 'center',
                        fontSize: '92%',
                    }}>
                    <Markdown value={message} renderer={defaultRender} breaks={true} />
                </mdui-card>
                <mdui-menu>
                    {messageMenus}
                </mdui-menu>
            </mdui-dropdown>
        </div>
        : <div
            slot="trigger"
            onContextMenu={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() != 'div') return
                if (isMobileUI()) return
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}
            onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() != 'div') return
                if (!isMobileUI()) {
                    isDropDownOpen && setDropDownOpen(false)
                    return
                }
                e.preventDefault()
                setDropDownOpen(!isDropDownOpen)
            }}
            style={{
                display: 'flex',
                justifyContent: isAtRight ? "flex-end" : "flex-start",
                flexDirection: "column",
                padding: '10px',
                height: 'auto',
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
                    <mdui-dropdown ref={avatarDropDownRef} open={isAvatarDropDownOpen} trigger="manual">
                        <mdui-avatar
                            onContextMenu={(e) => {
                                if (isMobileUI()) return
                                e.preventDefault()
                                setAvatarDropDownOpen(!isDropDownOpen)
                            }}
                            onClick={(e) => {
                                if (!isMobileUI()) {
                                    onAvatarClick?.()
                                    isAvatarDropDownOpen && setAvatarDropDownOpen(false)
                                    return
                                }
                                e.preventDefault()
                                setAvatarDropDownOpen(!isDropDownOpen)
                            }}
                            slot="trigger"
                            src={avatar}
                            style={{
                                width: "43px",
                                height: "43px",
                                margin: "11px"
                            }} />
                        <mdui-menu>
                            {avatarMenus}
                        </mdui-menu>
                    </mdui-dropdown>
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
            <mdui-dropdown ref={dropDownRef} open={isDropDownOpen} trigger="manual">
                <mdui-card slot="trigger"
                    variant="elevated"
                    style={{
                        maxWidth: isMobileUI() ? '77%' : '50%',
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
                        <Markdown value={message} renderer={defaultRender} breaks={true} />
                    </span>
                </mdui-card>
                <mdui-menu>
                    {messageMenus}
                </mdui-menu>
            </mdui-dropdown>
            {
                time && <span style={{
                    padding: '10px',
                    fontSize: 'small',
                    minWidth: "0%",
                    [isAtRight ? "marginRight" : "marginLeft"]: "55px",
                    marginTop: '5px',
                    alignSelf: isAtRight ? "flex-end" : "flex-start",
                }}>
                    {
                        (() => {
                            const d = new Date(Number.parseInt(time + ''))
                            return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                        })()
                    }
                </span>
            }
        </div>

}