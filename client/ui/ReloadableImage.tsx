import { Img } from "react-image"
import React from "react"
import { motion } from "motion/react"

export default function ReloadableImage({ src, alt, ...props }: { src: string, alt?: string } & React.HTMLAttributes<HTMLImageElement>) {
    const [k, setK] = React.useState(Date.now() + '')

    return (
        <Img
            key={k}
            src={src}
            alt={alt}
            loader={<motion.div
                initial={{ opacity: 0.45 }}
                animate={{ opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center',
                }}>
                <mdui-circular-progress style={{
                    alignSelf: 'center',
                }}></mdui-circular-progress>
            </motion.div>}
            unloader={<div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                paddingLeft: '7px',
                paddingRight: '7px',
                paddingTop: '7px',
                paddingBottom: '7px',
            }}>
                <mdui-button-icon icon="broken_image" title="点击重载图片" onClick={() => setK(Date.now() + '')} style={{
                    alignSelf: 'center',
                }}></mdui-button-icon>
            </div>}
            {...props}
        />
    );
}