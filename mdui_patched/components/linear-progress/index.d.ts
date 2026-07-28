import { MduiElement } from '@mdui/shared/base/mdui-element.js';
import type { CSSResultGroup, TemplateResult } from 'lit';
/**
 * @summary 线性进度条组件
 *
 * ```html
 * <mdui-linear-progress></mdui-linear-progress>
 * ```
 *
 * @csspart indicator - 指示器部分
 *
 * @cssprop --shape-corner - 组件的圆角大小。可以指定一个具体的像素值；但更推荐引用[设计令牌](/zh-cn/docs/2/styles/design-tokens#shape-corner)
 */
export declare class LinearProgress extends MduiElement<LinearProgressEventMap> {
    static styles: CSSResultGroup;
    /**
     * 进度条的最大值。默认为 `1`
     */
    max: number;
    /**
     * 进度条的当前值。如果未指定该值，则处于不确定状态
     */
    value?: number;
    protected render(): TemplateResult;
}
export interface LinearProgressEventMap {
}
declare global {
    interface HTMLElementTagNameMap {
        'mdui-linear-progress': LinearProgress;
    }
}
