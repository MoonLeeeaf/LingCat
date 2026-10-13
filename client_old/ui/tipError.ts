import showSnackbar from "./showSnackbar.ts"

export default function tipError(e: any, msg: string) {
    if (e.message)
        showSnackbar({
            message: `${msg}: [${e.code}] ${e.message}`
        })
    else
        showSnackbar({
            message: `${msg}: [-1] ${e}`
        })
}