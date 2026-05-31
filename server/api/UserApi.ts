import { Package } from 'lingcat-protocol';
import type { ISendPackageFunction } from './ISendPackageFunction.ts'

export default class UserApi {
    static onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.METHOD_ID) {
            case 0: {

                break
            }
        }
    }
}