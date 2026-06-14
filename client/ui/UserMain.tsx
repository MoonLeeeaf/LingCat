import Message from "./chat-layout/Message.tsx"
import MessageContainer from "./chat-layout/MessageContainer.tsx"

export default function UserMain({ access_token }: { access_token: string }) {
    return <>
        <mdui-navigation-drawer open>
            <mdui-list>
                <mdui-list-item>Navigation drawer</mdui-list-item>
            </mdui-list>
        </mdui-navigation-drawer>

        <mdui-layout-main style={{
            flexGrow: 1,
            display: 'flex'
        }}>
            <MessageContainer>
                <div style={{
                    overflowY: 'auto',
                }}>
                    <Message message={"**喵**\n我是开头![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                    <Message message={"**喵**\n我是末尾![image](icon.png)\n喵"} senderName={"月月"} />
                </div>
                <div style={{
                    flexGrow: 1,
                }}></div>
                <mdui-text-field variant="outlined" autosize max-rows={10} placeholder="输入...">
                    <mdui-button-icon slot="end-icon" icon="attachment"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="send"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '5px' }}></div>
                </mdui-text-field>
            </MessageContainer>
        </mdui-layout-main>
    </>
}