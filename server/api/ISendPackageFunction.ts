import { Package } from "lingcat-protocol"

export type ISendPackageFunction = (p: Package, option?: {
    forceEncrypt: boolean;
}) => void
