import React from "react"
import { Dropdown } from "mdui"
import useEventListener from "../useEventListener.ts"
import isMobileUI from "../isMobileUI.ts"

export default function Message({
    children,
    senderName,
    hideSender,
    isAtRight,
    isSystem,
    avatar,
    onAvatarClick,
    time,
    messageMenus,
    avatarMenus,
    edited_time,
}: {
    children: React.ReactNode
    avatar: string
    senderName: string
    isSystem?: boolean
    hideSender?: boolean
    isAtRight?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
    time?: number
    edited_time?: number
}) {

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
                    {children}
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
                        {children}
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
                    {
                        edited_time && (() => {
                            const d = new Date(Number.parseInt(edited_time + ''))
                            return <>
                                <br></br>
                                {`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} (已编辑)`}
                            </>
                        })()
                    }
                </span>
            }
        </div>

}