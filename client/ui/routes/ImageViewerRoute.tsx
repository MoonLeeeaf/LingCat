import { createRoute, useNavigate } from '@tanstack/react-router'
import React from 'react'
import { AuthRoute } from './AuthRoute.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import { ImageViewerContent } from '../viewer/ImageViewerContent.tsx'
import tipError from '../tipError.ts'
import { useDialogRouteClose } from '../../lib/useDialogRouteClose.ts'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

function ImageViewerPage() {
    const search = ImageViewerRoute.useSearch()
    const [uniqueClass] = React.useState(
        () => `image-viewer-${Math.random().toString(36).slice(2, 10)}`,
    )

    if (!search.url) {
        // 无 url 参数 → 提示 + 自动关
        React.useEffect(() => {
            tipError(new Error('缺少图片 URL'), '无法打开图片')
            close()
        }, [])
        return null
    }

    const close = useDialogRouteClose()

    return (
        <DialogForRouter
            open
            fullscreen
            className={uniqueClass}
            closeOnEsc
            closeOnOverlayClick={false}
            onCloseRequest={close}
        >
            <ImageViewerContent
                src={search.url}
                onClose={close}
                uniqueClass={uniqueClass}
            />
        </DialogForRouter>
    )
}

export const ImageViewerRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/viewer/image',
    validateSearch: (s): { url: string } => ({
        url: typeof s.url === 'string' ? s.url : '',
    }),
    component: ImageViewerPage,
})