import AnimatedIcon from '../AnimatedIcon.tsx'
import { useCopyFeedback } from '../useCopyFeedback.ts'

export default function CopyMessageMenuItem({ text }: { text: string }) {
    const { copied, copy } = useCopyFeedback()
    return <mdui-menu-item onClick={() => void copy(text)}>
        <AnimatedIcon slot="icon" name={copied ? 'check' : 'content_copy'} />
        {copied ? '已复制' : '复制'}
    </mdui-menu-item>
}
