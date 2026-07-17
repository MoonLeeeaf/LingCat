import Markdown, { ReactRenderer } from "marked-react"
import ReloadableImage from "../ReloadableImage"
import React from "react"
import { Dropdown } from "mdui"

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
                        flushCache();
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
    function onMessageMenu() {
        dropDownRef.current!.open = true
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
            <mdui-dropdown ref={dropDownRef} trigger="manual">
                <mdui-card slot="trigger"
                    variant="elevated"
                    style={{
                        maxWidth: (window.matchMedia('(pointer: fine)') && "50%") || (window.matchMedia('(pointer: coarse)') && "77%"),
                        minWidth: "0%",
                        [isAtRight ? "marginRight" : "marginLeft"]: "55px",
                        marginTop: hideSender ? '5px' : "-5px",
                        alignSelf: isAtRight ? "flex-end" : "flex-start",
                    }}
                    onContextMenu={(e: React.MouseEvent) => {
                        e.preventDefault() // 阻止浏览器默认右键菜单
                        onMessageMenu?.()
                    }}
                    // 长按（移动端）
                    onTouchStart={(e: React.TouchEvent) => {
                        // 防止与滚动冲突：如果触摸目标是滚动容器，可加判断，但这里简单防误触
                        longPressTimer.current = setTimeout(() => {
                            setIsLongPress(true)
                            onMessageMenu?.()
                            // 可选：震动反馈
                            // navigator.vibrate?.(10)
                        }, 600) // 600ms 长按
                    }}
                    onTouchEnd={() => {
                        // 如果已经触发了长按，不再触发点击
                        if (isLongPress) {
                            setIsLongPress(false)
                        }
                        clearTimeout(longPressTimer.current!)
                    }}
                    onTouchMove={() => {
                        // 触摸滑动时取消长按（防止滚动时误触）
                        clearTimeout(longPressTimer.current!)
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
        </div>
}