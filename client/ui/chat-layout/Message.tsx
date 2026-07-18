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
        paragraph(children) {
            const elements: React.ReactNode[] = []
            let cache: React.ReactNode[] = []

            const flushCache = () => {
                if (cache.length > 0) {
                    elements.push(<TextContainer>{cache}</TextContainer>)
                    cache = []
                }
            }

            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    // 如果是自定义组件（函数组件），视为“块级元素”
                    if (child.type instanceof Function) {
                        // 先输出之前的文本缓存
                        flushCache()
                        // 直接添加图片本身，不包裹额外容器
                        elements.push(child)
                    } else {
                        // 普通内置元素（span, a 等）放入缓存
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

    const [isLongPress, setIsLongPress] = React.useState(false)
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

    const dropDownRef = React.useRef<Dropdown>(null)
    useEventListener(dropDownRef, 'closed', () => {
        setDropDownOpen(false)
    })

    const [isDropDownOpen, setDropDownOpen_] = React.useState(false)

    function setDropDownOpen(open: boolean) {
        setDropDownOpen_(open)

    }

    return isSystem
        ? <div style={{
            width: '100%',
            flexDirection: 'column',
            display: 'flex',
            marginTop: '25px',
            marginBottom: '20px',
        }}>
            <mdui-card
                variant="filled"
                style={{
                    alignSelf: 'center',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '17px',
                    paddingRight: '17px',
                    fontSize: '92%',
                }}>
                <Markdown value={message} renderer={defaultRender} breaks={true} />
            </mdui-card>
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
                    <mdui-avatar
                        onClick={() => onAvatarClick?.()}
                        slot="trigger"
                        src={avatar}
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