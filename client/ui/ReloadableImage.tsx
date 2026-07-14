import { Img } from "react-image"
import React from "react"

export default function ReloadableImage({ src, alt, ...props }: { src: string, alt?: string } & React.HTMLAttributes<HTMLImageElement>) {
    const [k, setK] = React.useState(Date.now() + '')

    return (
        <Img
            key={k}
            src={src}
            alt={alt}
            loader={<div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
            }}>
                <mdui-circular-progress style={{
                    alignSelf: 'center',
                }}></mdui-circular-progress>
            </div>}
            unloader={<div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                paddingLeft: '7px',
                paddingRight: '7px',
                paddingTop: '7px',
                paddingBottom: '7px',
            }}>
                <mdui-tooltip content="点击重载图片">
                    <mdui-button-icon icon="broken_image" onClick={() => setK(Date.now() + '')} style={{
                        alignSelf: 'center',
                    }}></mdui-button-icon>
                </mdui-tooltip>
            </div>}
            {...props}
        />
    );
}