import { useEffect, useState } from "react"
import { useAsyncEffect } from "../useAsyncEffect.ts"
import SessionEnv from "../SessionEnv.ts"
import { RouterProvider } from "@tanstack/react-router"
import { Router } from "./routes/Router.ts"

export default function Main() {
    const [loaded, setLoaded] = useState(false)

    useAsyncEffect(async (signal) => {
        try {
            const url = `${import.meta.env.BASE_URL}config.json`
            const re = await fetch(url, { method: 'HEAD', signal })
            SessionEnv.isOutOfServer = !re.ok
        } catch {
            if (!signal.aborted) SessionEnv.isOutOfServer = true
        }
        if (!signal.aborted) setLoaded(true)
    }, [])

    return loaded
        ? <RouterProvider router={Router} />
        : <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
        }}>
            <mdui-circular-progress></mdui-circular-progress>
        </div>
}
