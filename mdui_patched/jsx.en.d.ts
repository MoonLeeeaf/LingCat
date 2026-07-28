import React from 'react';
import { JQ } from '@mdui/jq';

type HTMLElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        /**
        * Avatar Component 
       * 
       * ```html
       * <mdui-avatar src="https://avatars githubusercontent com/u/3030330?s=40&v=4"></mdui-avatar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/avatar
        */
        'mdui-avatar': {
          /**
          * URL of the avatar image.
          * @see https://www.mdui.org/en/docs/2/components/avatar#attributes-src
          */
          'src'?: string;
        /**
          * Image resizing method, similar to the CSS [`object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) property. Possible values:
         * 
         * * `contain`: Scales the image to fit within the box while preserving aspect ratio. The image will be "letterboxed" if the aspect ratios do not match.
         * * `cover`: Scales the image to fill the box while preserving aspect ratio. The image will be clipped if the aspect ratios do not match.
         * * `fill`: Default. Scales the image to fill the box; the image may be stretched if aspect ratios do not match.
         * * `none`: No resizing.
         * * `scale-down`: Scales the image down to fit. Behaves like `none` or `contain`, whichever results in the smaller image.
          * @see https://www.mdui.org/en/docs/2/components/avatar#attributes-fit
          */
          'fit'?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
        /**
          * The Material Icons name for the avatar.
          * @see https://www.mdui.org/en/docs/2/components/avatar#attributes-icon
          */
          'icon'?: string;
        /**
          * Text description of the avatar.
          * @see https://www.mdui.org/en/docs/2/components/avatar#attributes-label
          */
          'label'?: string;
        } & HTMLElementProps;
      /**
        * Badge Component 
       * 
       * ```html
       * <mdui-badge>12</mdui-badge>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/badge
        */
        'mdui-badge': {
          /**
          * Defines the badge size. Possible values:
         * * `small`: A small badge without text.
         * * `large`: A large badge with text.
          * @see https://www.mdui.org/en/docs/2/components/badge#attributes-variant
          */
          'variant'?: 'small' | 'large';
        } & HTMLElementProps;
      /**
        * Bottom App Bar Component 
       * 
       * ```html
       * <mdui-bottom-app-bar>
       *   <mdui-button-icon icon="check_box--outlined"></mdui-button-icon>
       *   <mdui-button-icon icon="edit--outlined"></mdui-button-icon>
       *   <mdui-button-icon icon="mic_none--outlined"></mdui-button-icon>
       *   <mdui-button-icon icon="image--outlined"></mdui-button-icon>
       *   <div style="flex-grow: 1"></div>
       *   <mdui-fab icon="add"></mdui-fab>
       * </mdui-bottom-app-bar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar
        */
        'mdui-bottom-app-bar': {
          /**
          * Whether the bottom app bar is hidden.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-hide
          */
          'hide'?: boolean;
        /**
          * If set, detaches the [`<mdui-fab>`](/en/docs/2/components/fab) from the bottom app bar. The [`<mdui-fab>`](/en/docs/2/components/fab) remains on the page even after the app bar is hidden.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-fab-detach
          */
          'fab-detach'?: boolean;
        /**
          * Specifies the scroll behavior. Possible values:
         * 
         * * `hide`: Hides when scrolling.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-scroll-behavior
          */
          'scroll-behavior'?: 'hide' | 'shrink' | 'elevate';
        /**
          * The element to watch for scroll events. Accepts a CSS selector, a DOM element, or a [JQ object](/en/docs/2/functions/jq). Defaults to `window`.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-scroll-target
          */
          'scroll-target'?: string | HTMLElement | JQ<HTMLElement>;
        /**
          * The scroll distance (in pixels) required to trigger the scroll behavior.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-scroll-threshold
          */
          'scroll-threshold'?: number;
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/bottom-app-bar#attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      /**
        * Icon Button Component 
       * 
       * ```html
       * <mdui-button-icon icon="search"></mdui-button-icon>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/button-icon
        */
        'mdui-button-icon': {
          /**
          * Defines the icon button variant. Possible values:
         * * `standard`: For low-priority actions.
         * * `filled`: Has the strongest visual emphasis and works well for high-priority actions.
         * * `tonal`: Blends `filled` and `outlined`, and works well for medium- to high-priority actions.
         * * `outlined`: For medium-priority or secondary actions.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-variant
          */
          'variant'?: 'standard' | 'filled' | 'tonal' | 'outlined';
        /**
          * Specifies the Material Icons name. Alternatively, use the default slot.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name when selected. Alternatively, use `slot="selected-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-selected-icon
          */
          'selected-icon'?: string;
        /**
          * Makes the button selectable.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-selectable
          */
          'selectable'?: boolean;
        /**
          * Indicates whether the button is selected.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-selected
          */
          'selected'?: boolean;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates an auxiliary browsing context if the hyperlink would otherwise create a top-level browsing context that is not an auxiliary one (i.e., when `target="_blank"`).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Disables the element.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Indicates that the element is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-loading
          */
          'loading'?: boolean;
        /**
          * The button name submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-name
          */
          'name'?: string;
        /**
          * The button value submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-value
          */
          'value'?: string;
        /**
          * Specifies the button's default action. Default: `button`. Possible values:
         * 
         * * `submit`: Submits the form data to the server.
         * * `reset`: Restores all controls to their initial values.
         * * `button`: Does nothing by default.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-type
          */
          'type'?: 'submit' | 'reset' | 'button';
        /**
          * Associates the button with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the button uses its parent `<form>`, if any.
         * 
         * This lets the button target any form in the document, not just the one it is nested in.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the URL that processes the button's submitted information. Overrides the `action` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-formaction
          */
          'formaction'?: string;
        /**
          * Specifies how to encode the form data. Possible values:
         * 
         * * `application/x-www-form-urlencoded`: Default when the attribute is omitted.
         * * `multipart/form-data`: Used for `<input>` elements with `type="file"`.
         * * `text/plain`: Useful for debugging, but not for actual form submissions.
         * 
         * Overrides the `enctype` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-formenctype
          */
          'formenctype'?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        /**
          * Specifies the HTTP method for form submission. Possible values:
         * 
         * * `post`: Sends the form data in the request body.
         * * `get`: Appends the form data to the `action` URL.
         * 
         * Overrides the `method` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-formmethod
          */
          'formmethod'?: 'post' | 'get';
        /**
          * Specifies that the form should not be validated on submission. Overrides the `novalidate` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-formnovalidate
          */
          'formnovalidate'?: boolean;
        /**
          * Specifies where to open the response after form submission. Possible values:
         * 
         * * `_self`: Current browsing context (default).
         * * `_blank`: New tab or window.
         * * `_parent`: Parent browsing context, or `_self` if there is no parent.
         * * `_top`: Topmost browsing context, or `_self` if there are no ancestors.
         * 
         * Overrides the `target` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button-icon#attributes-formtarget
          */
          'formtarget'?: '_self' | '_blank' | '_parent' | '_top';
        } & HTMLElementProps;
      /**
        * Button Component 
       * 
       * ```html
       * <mdui-button>Button</mdui-button>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/button
        */
        'mdui-button': {
          /**
          * Defines the button variant. Possible values:
         * * `elevated`: A button with a shadow for visual emphasis.
         * * `filled`: Used for final actions like 'Save' or 'Confirm'.
         * * `tonal`: Blends `filled` and `outlined`, and works well for medium- to high-priority actions.
         * * `outlined`: A bordered button for medium-priority and secondary actions.
         * * `text`: A text button for low-priority actions.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-variant
          */
          'variant'?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
        /**
          * If set, the button expands to fill the width of its container.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-full-width
          */
          'full-width'?: boolean;
        /**
          * Specifies the Material Icons name on the left. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name on the right. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates an auxiliary browsing context if the hyperlink would otherwise create a top-level browsing context that is not an auxiliary one (i.e., when `target="_blank"`).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Disables the element.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Indicates that the element is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-loading
          */
          'loading'?: boolean;
        /**
          * The button name submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-name
          */
          'name'?: string;
        /**
          * The button value submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-value
          */
          'value'?: string;
        /**
          * Specifies the button's default action. Default: `button`. Possible values:
         * 
         * * `submit`: Submits the form data to the server.
         * * `reset`: Restores all controls to their initial values.
         * * `button`: Does nothing by default.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-type
          */
          'type'?: 'submit' | 'reset' | 'button';
        /**
          * Associates the button with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the button uses its parent `<form>`, if any.
         * 
         * This lets the button target any form in the document, not just the one it is nested in.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the URL that processes the button's submitted information. Overrides the `action` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-formaction
          */
          'formaction'?: string;
        /**
          * Specifies how to encode the form data. Possible values:
         * 
         * * `application/x-www-form-urlencoded`: Default when the attribute is omitted.
         * * `multipart/form-data`: Used for `<input>` elements with `type="file"`.
         * * `text/plain`: Useful for debugging, but not for actual form submissions.
         * 
         * Overrides the `enctype` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-formenctype
          */
          'formenctype'?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        /**
          * Specifies the HTTP method for form submission. Possible values:
         * 
         * * `post`: Sends the form data in the request body.
         * * `get`: Appends the form data to the `action` URL.
         * 
         * Overrides the `method` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-formmethod
          */
          'formmethod'?: 'post' | 'get';
        /**
          * Specifies that the form should not be validated on submission. Overrides the `novalidate` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-formnovalidate
          */
          'formnovalidate'?: boolean;
        /**
          * Specifies where to open the response after form submission. Possible values:
         * 
         * * `_self`: Current browsing context (default).
         * * `_blank`: New tab or window.
         * * `_parent`: Parent browsing context, or `_self` if there is no parent.
         * * `_top`: Topmost browsing context, or `_self` if there are no ancestors.
         * 
         * Overrides the `target` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/button#attributes-formtarget
          */
          'formtarget'?: '_self' | '_blank' | '_parent' | '_top';
        } & HTMLElementProps;
      /**
        * Card Component 
       * 
       * ```html
       * <mdui-card>card content</mdui-card>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/card
        */
        'mdui-card': {
          /**
          * Defines the card variant. Possible values:
         * * `elevated`: Shadowed, offering more separation from the background than `filled`, but less than `outlined`.
         * * `filled`: Provides minimal separation from the background.
         * * `outlined`: Bordered, providing the most separation from the background.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-variant
          */
          'variant'?: 'elevated' | 'filled' | 'outlined';
        /**
          * Makes the card clickable. If set, hover and click ripple effects are added.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-clickable
          */
          'clickable'?: boolean;
        /**
          * Disables the card.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates a new browsing context when the hyperlink would otherwise open in a top-level context that is not auxiliary (for example, when `target="_blank"` is specified).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/card#attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Checkbox Component 
       * 
       * ```html
       * <mdui-checkbox>Checkbox</mdui-checkbox>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/checkbox
        */
        'mdui-checkbox': {
          /**
          * Disables the checkbox.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Sets the checkbox to the checked state.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-checked
          */
          'checked'?: boolean;
        /**
          * Sets the checkbox to an indeterminate state.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-indeterminate
          */
          'indeterminate'?: boolean;
        /**
          * The checkbox must be checked to submit the form.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-required
          */
          'required'?: boolean;
        /**
          * Associates the checkbox with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the checkbox uses its parent `<form>`, if any.
         * 
         * This lets the checkbox work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-form
          */
          'form'?: string;
        /**
          * Sets the checkbox's name, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-name
          */
          'name'?: string;
        /**
          * Sets the checkbox's value, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-value
          */
          'value'?: string;
        /**
          * Sets the Material Icons name for the unchecked state. Alternatively, use `slot="unchecked-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-unchecked-icon
          */
          'unchecked-icon'?: string;
        /**
          * Sets the Material Icons name for the checked state. Alternatively, use `slot="checked-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-checked-icon
          */
          'checked-icon'?: string;
        /**
          * Sets the Material Icons name for the indeterminate state. Alternatively, use `slot="indeterminate-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-indeterminate-icon
          */
          'indeterminate-icon'?: string;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/checkbox#attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Chip Component 
       * 
       * ```html
       * <mdui-chip>Chip</mdui-chip>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/chip
        */
        'mdui-chip': {
          /**
          * Defines the chip variant. Possible values:
         * 
         * * `assist`: Shows contextual actions, such as sharing or favoriting on a meal-ordering page.
         * * `filter`: Filters content, such as search results.
         * * `input`: Represents user input, such as contacts in Gmail's 'To' field.
         * * `suggestion`: Shows dynamic suggestions that help users act more quickly, such as message suggestions in a chat app.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-variant
          */
          'variant'?: 'assist' | 'filter' | 'input' | 'suggestion';
        /**
          * Adds a shadow to the chip.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-elevated
          */
          'elevated'?: boolean;
        /**
          * Makes the chip selectable.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-selectable
          */
          'selectable'?: boolean;
        /**
          * Marks the chip as selected.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-selected
          */
          'selected'?: boolean;
        /**
          * Makes the chip deletable. If set, a delete icon appears on the right.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-deletable
          */
          'deletable'?: boolean;
        /**
          * Sets the Material Icons name for the left icon. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-icon
          */
          'icon'?: string;
        /**
          * Sets the Material Icons name for the left icon when selected. Alternatively, use `slot="selected-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-selected-icon
          */
          'selected-icon'?: string;
        /**
          * Sets the Material Icons name for the right icon. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Sets the Material Icons name for the delete icon when deletable. Alternatively, use `slot="delete-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-delete-icon
          */
          'delete-icon'?: string;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates an auxiliary browsing context if the hyperlink would otherwise create a top-level browsing context that is not an auxiliary one (i.e., when `target="_blank"`).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Disables the element.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Indicates that the element is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-loading
          */
          'loading'?: boolean;
        /**
          * The button name submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-name
          */
          'name'?: string;
        /**
          * The button value submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-value
          */
          'value'?: string;
        /**
          * Specifies the button's default action. Default: `button`. Possible values:
         * 
         * * `submit`: Submits the form data to the server.
         * * `reset`: Restores all controls to their initial values.
         * * `button`: Does nothing by default.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-type
          */
          'type'?: 'submit' | 'reset' | 'button';
        /**
          * Associates the button with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the button uses its parent `<form>`, if any.
         * 
         * This lets the button target any form in the document, not just the one it is nested in.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the URL that processes the button's submitted information. Overrides the `action` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-formaction
          */
          'formaction'?: string;
        /**
          * Specifies how to encode the form data. Possible values:
         * 
         * * `application/x-www-form-urlencoded`: Default when the attribute is omitted.
         * * `multipart/form-data`: Used for `<input>` elements with `type="file"`.
         * * `text/plain`: Useful for debugging, but not for actual form submissions.
         * 
         * Overrides the `enctype` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-formenctype
          */
          'formenctype'?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        /**
          * Specifies the HTTP method for form submission. Possible values:
         * 
         * * `post`: Sends the form data in the request body.
         * * `get`: Appends the form data to the `action` URL.
         * 
         * Overrides the `method` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-formmethod
          */
          'formmethod'?: 'post' | 'get';
        /**
          * Specifies that the form should not be validated on submission. Overrides the `novalidate` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-formnovalidate
          */
          'formnovalidate'?: boolean;
        /**
          * Specifies where to open the response after form submission. Possible values:
         * 
         * * `_self`: Current browsing context (default).
         * * `_blank`: New tab or window.
         * * `_parent`: Parent browsing context, or `_self` if there is no parent.
         * * `_top`: Topmost browsing context, or `_self` if there are no ancestors.
         * 
         * Overrides the `target` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/chip#attributes-formtarget
          */
          'formtarget'?: '_self' | '_blank' | '_parent' | '_top';
        } & HTMLElementProps;
      /**
        * Circular Progress Component 
       * 
       * ```html
       * <mdui-circular-progress></mdui-circular-progress>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/circular-progress
        */
        'mdui-circular-progress': {
          /**
          * Sets the maximum value for the progress indicator. The default value is `1`.
          * @see https://www.mdui.org/en/docs/2/components/circular-progress#attributes-max
          */
          'max'?: number;
        /**
          * Sets the current value of the progress indicator. If not specified, the progress indicator is in an indeterminate state.
          * @see https://www.mdui.org/en/docs/2/components/circular-progress#attributes-value
          */
          'value'?: number;
        } & HTMLElementProps;
      /**
        * Collapse Item Component  Use with the `<mdui-collapse>` component 
       * 
       * ```html
       * <mdui-collapse>
       *   <mdui-collapse-item header="header-1">content-1</mdui-collapse-item>
       *   <mdui-collapse-item header="header-2">content-2</mdui-collapse-item>
       * </mdui-collapse>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/collapse
        */
        'mdui-collapse-item': {
          /**
          * Specifies the value of the collapsible panel item.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-item-attributes-value
          */
          'value'?: string;
        /**
          * Sets the header text for the collapsible panel item.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-item-attributes-header
          */
          'header'?: string;
        /**
          * Disables the collapsible panel item.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-item-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * The element that toggles collapse on click. This can be a CSS selector, a DOM element, or a [JQ object](/en/docs/2/functions/jq). By default, the entire header area is the trigger.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-item-attributes-trigger
          */
          'trigger'?: string | HTMLElement | JQ<HTMLElement>;
        } & HTMLElementProps;
      /**
        * Collapse Panel Component  Use with the `<mdui-collapse-item>` component 
       * 
       * ```html
       * <mdui-collapse>
       *   <mdui-collapse-item header="header-1">content-1</mdui-collapse-item>
       *   <mdui-collapse-item header="header-2">content-2</mdui-collapse-item>
       * </mdui-collapse>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/collapse
        */
        'mdui-collapse': {
          /**
          * Activates accordion mode.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-attributes-accordion
          */
          'accordion'?: boolean;
        /**
          * Specifies the open `<mdui-collapse-item>` value.
         * 
         * **Note**: The HTML attribute is always a string and can only be set initially when `accordion` is `true`. The JavaScript property is a string when `accordion` is `true` and a string array when `accordion` is `false`. To change this value when `accordion` is `false`, update the JavaScript property.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-attributes-value
          */
          'value'?: string | string[];
        /**
          * Disables the collapsible panel.
          * @see https://www.mdui.org/en/docs/2/components/collapse#collapse-attributes-disabled
          */
          'disabled'?: boolean;
        } & HTMLElementProps;
      /**
        * Dialog Component 
       * 
       * ```html
       * <mdui-dialog>content</mdui-dialog>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/dialog
        */
        'mdui-dialog': {
          /**
          * Sets the Material Icons name for the top icon. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-icon
          */
          'icon'?: string;
        /**
          * Sets the dialog title. Alternatively, use `slot="headline"`.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-headline
          */
          'headline'?: string;
        /**
          * The text displayed below the title. Alternatively, use `slot="description"`.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-description
          */
          'description'?: string;
        /**
          * Opens the dialog.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-open
          */
          'open'?: boolean;
        /**
          * Displays the dialog in full-screen mode.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-fullscreen
          */
          'fullscreen'?: boolean;
        /**
          * Closes the dialog when the ESC key is pressed.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-close-on-esc
          */
          'close-on-esc'?: boolean;
        /**
          * Closes the dialog when the overlay is clicked.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-close-on-overlay-click
          */
          'close-on-overlay-click'?: boolean;
        /**
          * Stacks the bottom action buttons vertically.
          * @see https://www.mdui.org/en/docs/2/components/dialog#attributes-stacked-actions
          */
          'stacked-actions'?: boolean;
        } & HTMLElementProps;
      /**
        * Divider Component 
       * 
       * ```html
       * <mdui-divider></mdui-divider>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/divider
        */
        'mdui-divider': {
          /**
          * Displays the divider vertically.
          * @see https://www.mdui.org/en/docs/2/components/divider#attributes-vertical
          */
          'vertical'?: boolean;
        /**
          * Adds an inset from the left side.
          * @see https://www.mdui.org/en/docs/2/components/divider#attributes-inset
          */
          'inset'?: boolean;
        /**
          * Adds insets from both the left and right sides.
          * @see https://www.mdui.org/en/docs/2/components/divider#attributes-middle
          */
          'middle'?: boolean;
        } & HTMLElementProps;
      /**
        * Dropdown Component 
       * 
       * ```html
       * <mdui-dropdown>
       *   <mdui-button slot="trigger">open dropdown</mdui-button>
       *   <mdui-menu>
       *     <mdui-menu-item>Item 1</mdui-menu-item>
       *     <mdui-menu-item>Item 2</mdui-menu-item>
       *   </mdui-menu>
       * </mdui-dropdown>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/dropdown
        */
        'mdui-dropdown': {
          /**
          * Opens the dropdown.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-open
          */
          'open'?: boolean;
        /**
          * Disables the dropdown.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Defines how the dropdown opens. Multiple space-separated values are supported. Possible values:
         * 
         * * `click`: Triggers on click.
         * * `hover`: Triggers on mouse hover.
         * * `focus`: Triggers on focus.
         * * `contextmenu`: Triggers on right-click or long press.
         * * `manual`: If used, the dropdown can only be opened and closed programmatically, and no other trigger methods can be specified.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-trigger
          */
          'trigger'?: 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual' | string;
        /**
          * Sets the dropdown position. Possible values:
         * 
         * * `auto`: Automatically determined.
         * * `top-start`: Above and left-aligned.
         * * `top`: Above and centered.
         * * `top-end`: Above and right-aligned.
         * * `bottom-start`: Below and left-aligned.
         * * `bottom`: Below and centered.
         * * `bottom-end`: Below and right-aligned.
         * * `left-start`: Left and top-aligned.
         * * `left`: Left and centered.
         * * `left-end`: Left and bottom-aligned.
         * * `right-start`: Right and top-aligned.
         * * `right`: Right and centered.
         * * `right-end`: Right and bottom-aligned.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-placement
          */
          'placement'?: 'auto' | 'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end' | 'left-start' | 'left' | 'left-end' | 'right-start' | 'right' | 'right-end';
        /**
          * Prevents the dropdown from closing when a [`<mdui-menu-item>`](/en/docs/2/components/menu#menu-item-api) is clicked.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-stay-open-on-click
          */
          'stay-open-on-click'?: boolean;
        /**
          * Sets the delay (in ms) for opening the dropdown on hover.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-open-delay
          */
          'open-delay'?: number;
        /**
          * Sets the delay (in ms) for closing the dropdown on hover.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-close-delay
          */
          'close-delay'?: number;
        /**
          * Opens the dropdown at the pointer position. This is typically used for context menus.
          * @see https://www.mdui.org/en/docs/2/components/dropdown#attributes-open-on-pointer
          */
          'open-on-pointer'?: boolean;
        } & HTMLElementProps;
      /**
        * Floating Action Button Component 
       * 
       * ```html
       * <mdui-fab icon="edit"></mdui-fab>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/fab
        */
        'mdui-fab': {
          /**
          * Sets the FAB color. Possible values:
         * 
         * * `primary`: Uses the primary container background color.
         * * `surface`: Uses the surface container high background color.
         * * `secondary`: Uses the secondary container background color.
         * * `tertiary`: Uses the tertiary container background color.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-variant
          */
          'variant'?: 'primary' | 'surface' | 'secondary' | 'tertiary';
        /**
          * Sets the FAB size. Possible values:
         * * `normal`: Normal size.
         * * `small`: Small size.
         * * `large`: Large size.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-size
          */
          'size'?: 'normal' | 'small' | 'large';
        /**
          * Sets the Material Icons name. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-icon
          */
          'icon'?: string;
        /**
          * Extends the FAB to show text alongside the icon.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-extended
          */
          'extended'?: boolean;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates an auxiliary browsing context if the hyperlink would otherwise create a top-level browsing context that is not an auxiliary one (i.e., when `target="_blank"`).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Disables the element.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Indicates that the element is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-loading
          */
          'loading'?: boolean;
        /**
          * The button name submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-name
          */
          'name'?: string;
        /**
          * The button value submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-value
          */
          'value'?: string;
        /**
          * Specifies the button's default action. Default: `button`. Possible values:
         * 
         * * `submit`: Submits the form data to the server.
         * * `reset`: Restores all controls to their initial values.
         * * `button`: Does nothing by default.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-type
          */
          'type'?: 'submit' | 'reset' | 'button';
        /**
          * Associates the button with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the button uses its parent `<form>`, if any.
         * 
         * This lets the button target any form in the document, not just the one it is nested in.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the URL that processes the button's submitted information. Overrides the `action` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-formaction
          */
          'formaction'?: string;
        /**
          * Specifies how to encode the form data. Possible values:
         * 
         * * `application/x-www-form-urlencoded`: Default when the attribute is omitted.
         * * `multipart/form-data`: Used for `<input>` elements with `type="file"`.
         * * `text/plain`: Useful for debugging, but not for actual form submissions.
         * 
         * Overrides the `enctype` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-formenctype
          */
          'formenctype'?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        /**
          * Specifies the HTTP method for form submission. Possible values:
         * 
         * * `post`: Sends the form data in the request body.
         * * `get`: Appends the form data to the `action` URL.
         * 
         * Overrides the `method` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-formmethod
          */
          'formmethod'?: 'post' | 'get';
        /**
          * Specifies that the form should not be validated on submission. Overrides the `novalidate` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-formnovalidate
          */
          'formnovalidate'?: boolean;
        /**
          * Specifies where to open the response after form submission. Possible values:
         * 
         * * `_self`: Current browsing context (default).
         * * `_blank`: New tab or window.
         * * `_parent`: Parent browsing context, or `_self` if there is no parent.
         * * `_top`: Topmost browsing context, or `_self` if there are no ancestors.
         * 
         * Overrides the `target` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/fab#attributes-formtarget
          */
          'formtarget'?: '_self' | '_blank' | '_parent' | '_top';
        } & HTMLElementProps;
      /**
        * Icon Component 
       * 
       * ```html
       * <mdui-icon name="search"></mdui-icon>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/icon
        */
        'mdui-icon': {
          /**
          * Specifies the name of the Material Icons.
          * @see https://www.mdui.org/en/docs/2/components/icon#attributes-name
          */
          'name'?: string;
        /**
          * Specifies the path of the SVG icon.
          * @see https://www.mdui.org/en/docs/2/components/icon#attributes-src
          */
          'src'?: string;
        } & HTMLElementProps;
      /**
        * Layout Item Component 
       * 
       * ```html
       * <mdui-layout>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-main></mdui-layout-main>
       * </mdui-layout>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/layout
        */
        'mdui-layout-item': {
          /**
          * Determines where the component is placed. Possible values:
         * 
         * * `top`: Places the component at the top.
         * * `bottom`: Places the component at the bottom.
         * * `left`: Places the component on the left.
         * * `right`: Places the component on the right.
          * @see https://www.mdui.org/en/docs/2/components/layout#layout-item-attributes-placement
          */
          'placement'?: 'top' | 'bottom' | 'left' | 'right';
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/layout#layout-item-attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      /**
        * Layout Main Component 
       * 
       * ```html
       * <mdui-layout>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-main></mdui-layout-main>
       * </mdui-layout>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/layout
        */
        'mdui-layout-main': {
          
        } & HTMLElementProps;
      /**
        * Layout Component 
       * 
       * ```html
       * <mdui-layout>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-item></mdui-layout-item>
       *   <mdui-layout-main></mdui-layout-main>
       * </mdui-layout>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/layout
        */
        'mdui-layout': {
          /**
          * Sets the layout height to 100%.
          * @see https://www.mdui.org/en/docs/2/components/layout#layout-attributes-full-height
          */
          'full-height'?: boolean;
        } & HTMLElementProps;
      /**
        * Linear Progress Component 
       * 
       * ```html
       * <mdui-linear-progress></mdui-linear-progress>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/linear-progress
        */
        'mdui-linear-progress': {
          /**
          * Sets the maximum value for the progress indicator. The default value is `1`.
          * @see https://www.mdui.org/en/docs/2/components/linear-progress#attributes-max
          */
          'max'?: number;
        /**
          * Sets the current value of the progress indicator. If not specified, the progress indicator is in an indeterminate state.
          * @see https://www.mdui.org/en/docs/2/components/linear-progress#attributes-value
          */
          'value'?: number;
        } & HTMLElementProps;
      /**
        * List Item Component  Use with the `<mdui-list>` component 
       * 
       * ```html
       * <mdui-list>
       *   <mdui-list-subheader>Subheader</mdui-list-subheader>
       *   <mdui-list-item>Item 1</mdui-list-item>
       *   <mdui-list-item>Item 2</mdui-list-item>
       * </mdui-list>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/list
        */
        'mdui-list-item': {
          /**
          * Main text. Alternatively, use the default slot.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-headline
          */
          'headline'?: string;
        /**
          * Maximum number of lines for the main text. Overflow text is truncated. Default is no limit. Possible values:
         * 
         * * `1`: Single-line text that truncates when it overflows.
         * * `2`: Two-line text that truncates when it overflows.
         * * `3`: Three-line text that truncates when it overflows.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-headline-line
          */
          'headline-line'?: 1 | 2 | 3;
        /**
          * Subtext. Alternatively, use `slot="description"`.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-description
          */
          'description'?: string;
        /**
          * Maximum number of lines for the subtext. Overflow text is truncated. Default is no limit. Possible values:
         * 
         * * `1`: Single-line text that truncates when it overflows.
         * * `2`: Two-line text that truncates when it overflows.
         * * `3`: Three-line text that truncates when it overflows.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-description-line
          */
          'description-line'?: 1 | 2 | 3;
        /**
          * Material Icons name on the left. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-icon
          */
          'icon'?: string;
        /**
          * Material Icons name on the right. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Disables the list item. It dims the item and disables interactive elements like [`<mdui-checkbox>`](/en/docs/2/components/checkbox), [`<mdui-radio>`](/en/docs/2/components/radio), and [`<mdui-switch>`](/en/docs/2/components/switch).
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Marks the list item as active.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-active
          */
          'active'?: boolean;
        /**
          * Disables the list item's default click action, but interactive elements like [`<mdui-checkbox>`](/en/docs/2/components/checkbox), [`<mdui-radio>`](/en/docs/2/components/radio), and [`<mdui-switch>`](/en/docs/2/components/switch) inside it remain functional.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-nonclickable
          */
          'nonclickable'?: boolean;
        /**
          * Applies a rounded appearance to the list item.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-rounded
          */
          'rounded'?: boolean;
        /**
          * Vertical alignment of the list item. Possible values:
         * 
         * * `start`: Aligns to the top.
         * * `center`: Aligns to the center.
         * * `end`: Aligns to the bottom.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-alignment
          */
          'alignment'?: 'start' | 'center' | 'end';
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates a new browsing context when the hyperlink would otherwise open in a top-level context that is not auxiliary (for example, when `target="_blank"` is specified).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/list#list-item-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * List Subheader Component  Use with the `<mdui-list>` component 
       * 
       * ```html
       * <mdui-list>
       *   <mdui-list-subheader>Subheader</mdui-list-subheader>
       *   <mdui-list-item>Item 1</mdui-list-item>
       *   <mdui-list-item>Item 2</mdui-list-item>
       * </mdui-list>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/list
        */
        'mdui-list-subheader': {
          
        } & HTMLElementProps;
      /**
        * List Component  Use with the `<mdui-list-item>` component 
       * 
       * ```html
       * <mdui-list>
       *   <mdui-list-subheader>Subheader</mdui-list-subheader>
       *   <mdui-list-item>Item 1</mdui-list-item>
       *   <mdui-list-item>Item 2</mdui-list-item>
       * </mdui-list>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/list
        */
        'mdui-list': {
          
        } & HTMLElementProps;
      /**
        * Menu Item Component 
       * 
       * ```html
       * <mdui-menu>
       *   <mdui-menu-item>Item 1</mdui-menu-item>
       *   <mdui-menu-item>Item 2</mdui-menu-item>
       * </mdui-menu>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/menu
        */
        'mdui-menu-item': {
          /**
          * The value of the menu item.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-value
          */
          'value'?: string;
        /**
          * Disables the menu item.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Specifies the Material Icons name for the left icon. Alternatively, use `slot="icon"`. An empty string reserves space for an icon.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name for the right icon. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Specifies the right text. Alternatively, use `slot="end-text"`.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-end-text
          */
          'end-text'?: string;
        /**
          * Specifies the Material Icons name for the selected state. Alternatively, use `slot="selected-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-selected-icon
          */
          'selected-icon'?: string;
        /**
          * Opens the submenu.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-submenu-open
          */
          'submenu-open'?: boolean;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates a new browsing context when the hyperlink would otherwise open in a top-level context that is not auxiliary (for example, when `target="_blank"` is specified).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-item-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Menu Component  Use with the `<mdui-menu-item>` component 
       * 
       * ```html
       * <mdui-menu>
       *   <mdui-menu-item>Item 1</mdui-menu-item>
       *   <mdui-menu-item>Item 2</mdui-menu-item>
       * </mdui-menu>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/menu
        */
        'mdui-menu': {
          /**
          * Controls whether menu items can be selected. They are not selectable by default. Possible values:
         * 
         * * `single`: Only one item can be selected at a time.
         * * `multiple`: Multiple items can be selected.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-selects
          */
          'selects'?: 'single' | 'multiple';
        /**
          * The value of the selected `<mdui-menu-item>`.
         * 
         * **Note**: The HTML attribute always accepts a string and can only be used as an initial value when `selects="single"`. The JavaScript property is a string when `selects="single"` and an array of strings when `selects="multiple"`. When `selects="multiple"`, update the JavaScript property to change this value.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-value
          */
          'value'?: string | string[];
        /**
          * Indicates whether the menu items use a compact layout.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-dense
          */
          'dense'?: boolean;
        /**
          * Defines how submenus open. Multiple space-separated values are supported. Possible values:
         * 
         * * `click`: Opens the submenu when the menu item is clicked.
         * * `hover`: Opens the submenu when hovering over a menu item.
         * * `focus`: Opens the submenu when the menu item receives focus.
         * * `manual`: Submenus can only be opened and closed programmatically; no other trigger methods can be specified.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-submenu-trigger
          */
          'submenu-trigger'?: 'click' | 'hover' | 'focus' | 'manual' | string;
        /**
          * The delay (in milliseconds) before a submenu opens on hover.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-submenu-open-delay
          */
          'submenu-open-delay'?: number;
        /**
          * The delay (in milliseconds) before a submenu closes on hover.
          * @see https://www.mdui.org/en/docs/2/components/menu#menu-attributes-submenu-close-delay
          */
          'submenu-close-delay'?: number;
        } & HTMLElementProps;
      /**
        * Navigation Bar Item Component  Use with the `<mdui-navigation-bar>` component 
       * 
       * ```html
       * <mdui-navigation-bar>
       *   <mdui-navigation-bar-item icon="place">Item 1</mdui-navigation-bar-item>
       *   <mdui-navigation-bar-item icon="commute">Item 2</mdui-navigation-bar-item>
       *   <mdui-navigation-bar-item icon="people">Item 3</mdui-navigation-bar-item>
       * </mdui-navigation-bar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/navigation-bar
        */
        'mdui-navigation-bar-item': {
          /**
          * Specifies the Material Icons name for the inactive state. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name for the active state. Alternatively, use `slot="active-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-active-icon
          */
          'active-icon'?: string;
        /**
          * The value of the navigation item.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-value
          */
          'value'?: string;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates a new browsing context when the hyperlink would otherwise open in a top-level context that is not auxiliary (for example, when `target="_blank"` is specified).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-item-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Navigation Bar Component  Use with the `<mdui-navigation-bar-item>` component 
       * 
       * ```html
       * <mdui-navigation-bar>
       *   <mdui-navigation-bar-item icon="place">Item 1</mdui-navigation-bar-item>
       *   <mdui-navigation-bar-item icon="commute">Item 2</mdui-navigation-bar-item>
       *   <mdui-navigation-bar-item icon="people">Item 3</mdui-navigation-bar-item>
       * </mdui-navigation-bar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/navigation-bar
        */
        'mdui-navigation-bar': {
          /**
          * Whether the navigation bar is hidden.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-hide
          */
          'hide'?: boolean;
        /**
          * Specifies when the text is shown. Possible values:
         * 
         * * `auto`: Visible if there are 3 or fewer items; otherwise, only visible in the selected state.
         * * `selected`: Only visible in the selected state.
         * * `labeled`: Always visible.
         * * `unlabeled`: Never visible.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-label-visibility
          */
          'label-visibility'?: 'auto' | 'selected' | 'labeled' | 'unlabeled';
        /**
          * The value of the selected `<mdui-navigation-bar-item>`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-value
          */
          'value'?: string;
        /**
          * Defines the scroll behavior. Possible values:
         * 
         * * `hide`: Hides when scrolling.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-scroll-behavior
          */
          'scroll-behavior'?: 'hide' | 'shrink' | 'elevate';
        /**
          * The element to watch for scroll events. Accepts a CSS selector, a DOM element, or a [JQ object](/en/docs/2/functions/jq). Defaults to `window`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-scroll-target
          */
          'scroll-target'?: string | HTMLElement | JQ<HTMLElement>;
        /**
          * The scroll distance (in pixels) required to trigger the scroll behavior.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-scroll-threshold
          */
          'scroll-threshold'?: number;
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-bar#navigation-bar-attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      /**
        * Navigation Drawer Component 
       * 
       * ```html
       * <mdui-navigation-drawer>content</mdui-navigation-drawer>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/navigation-drawer
        */
        'mdui-navigation-drawer': {
          /**
          * Opens the navigation drawer.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-open
          */
          'open'?: boolean;
        /**
          * Displays an overlay when open.
         * 
         * On narrow devices (screen width < [`--mdui-breakpoint-md`](/en/docs/2/styles/design-tokens#breakpoint)), the overlay is always displayed.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-modal
          */
          'modal'?: boolean;
        /**
          * Closes the drawer when the ESC key is pressed and an overlay is present.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-close-on-esc
          */
          'close-on-esc'?: boolean;
        /**
          * Closes the drawer when the overlay is clicked.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-close-on-overlay-click
          */
          'close-on-overlay-click'?: boolean;
        /**
          * Sets the drawer's position. Possible values:
         * 
         * * `left`: Displays on the left side.
         * * `right`: Displays on the right side.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-placement
          */
          'placement'?: 'left' | 'right';
        /**
          * By default, the navigation drawer is positioned relative to the `body` element. If set, it is positioned relative to its parent element.
         * 
         * **Note**: You must manually set `position: relative; overflow: hidden;` on the parent element when this attribute is set.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-contained
          */
          'contained'?: boolean;
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-drawer#attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      /**
        * Navigation Rail Item Component  Use with the `<mdui-navigation-rail>` component 
       * 
       * ```html
       * <mdui-navigation-rail>
       *   <mdui-navigation-rail-item icon="watch_later">Recent</mdui-navigation-rail-item>
       *   <mdui-navigation-rail-item icon="image">Images</mdui-navigation-rail-item>
       *   <mdui-navigation-rail-item icon="library_music">Library</mdui-navigation-rail-item>
       * </mdui-navigation-rail>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/navigation-rail
        */
        'mdui-navigation-rail-item': {
          /**
          * Specifies the Material Icons name for the inactive state. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name for the active state. Alternatively, use `slot="active-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-active-icon
          */
          'active-icon'?: string;
        /**
          * The value of the navigation item.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-value
          */
          'value'?: string;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates a new browsing context when the hyperlink would otherwise open in a top-level context that is not auxiliary (for example, when `target="_blank"` is specified).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-item-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Navigation Rail Component  Use with the `<mdui-navigation-rail-item>` component 
       * 
       * ```html
       * <mdui-navigation-rail>
       *   <mdui-navigation-rail-item icon="watch_later">Recent</mdui-navigation-rail-item>
       *   <mdui-navigation-rail-item icon="image">Images</mdui-navigation-rail-item>
       *   <mdui-navigation-rail-item icon="library_music">Library</mdui-navigation-rail-item>
       * </mdui-navigation-rail>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/navigation-rail
        */
        'mdui-navigation-rail': {
          /**
          * The value of the selected `<mdui-navigation-rail-item>`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-value
          */
          'value'?: string;
        /**
          * Sets the navigation rail's position. Possible values:
         * 
         * * `left`: Displays on the left.
         * * `right`: Displays on the right.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-placement
          */
          'placement'?: 'left' | 'right';
        /**
          * Sets the alignment of `<mdui-navigation-rail-item>` elements. Possible values:
         * 
         * * `start`: Aligns to the top.
         * * `center`: Aligns to the center.
         * * `end`: Aligns to the bottom.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-alignment
          */
          'alignment'?: 'start' | 'center' | 'end';
        /**
          * By default, the navigation rail is positioned relative to the `body` element. If set, it is positioned relative to its parent element.
         * 
         * **Note**: You must manually set `position: relative;` on the parent element when this attribute is set.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-contained
          */
          'contained'?: boolean;
        /**
          * Adds a divider between the navigation rail and the page content.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-divider
          */
          'divider'?: boolean;
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/navigation-rail#navigation-rail-attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      /**
        * Radio Group Component  Use with the `<mdui-radio>` component 
       * 
       * ```html
       * <mdui-radio-group value="chinese">
       *   <mdui-radio value="chinese">Chinese</mdui-radio>
       *   <mdui-radio value="english">English</mdui-radio>
       * </mdui-radio-group>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/radio
        */
        'mdui-radio-group': {
          /**
          * Disables the radio group.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-group-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Associates the radio group with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the radio group uses its parent `<form>`, if any.
         * 
         * This lets the radio group work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-group-attributes-form
          */
          'form'?: string;
        /**
          * The name of the radio group, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-group-attributes-name
          */
          'name'?: string;
        /**
          * The value of the selected radio button, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-group-attributes-value
          */
          'value'?: string;
        /**
          * Requires a radio selection when the form is submitted.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-group-attributes-required
          */
          'required'?: boolean;
        } & HTMLElementProps;
      /**
        * Radio Component  Use with the `<mdui-radio-group>` component 
       * 
       * ```html
       * <mdui-radio-group value="chinese">
       *   <mdui-radio value="chinese">Chinese</mdui-radio>
       *   <mdui-radio value="english">English</mdui-radio>
       * </mdui-radio-group>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/radio
        */
        'mdui-radio': {
          /**
          * Specifies the value of the radio.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-value
          */
          'value'?: string;
        /**
          * Disables the radio.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Sets the radio to the checked state.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-checked
          */
          'checked'?: boolean;
        /**
          * Specifies the Material Icons name for the unchecked state. Alternatively, use `slot="unchecked-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-unchecked-icon
          */
          'unchecked-icon'?: string;
        /**
          * Specifies the Material Icons name for the checked state. Alternatively, use `slot="checked-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-checked-icon
          */
          'checked-icon'?: string;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/radio#radio-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Range Slider Component 
       * 
       * ```html
       * <mdui-range-slider></mdui-range-slider>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/range-slider
        */
        'mdui-range-slider': {
          /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Specifies the minimum value. Default is `0`.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-min
          */
          'min'?: number;
        /**
          * Specifies the maximum value. Default is `100`.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-max
          */
          'max'?: number;
        /**
          * Specifies the step interval. Default is `1`.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-step
          */
          'step'?: number;
        /**
          * Adds tickmarks to the slider.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-tickmarks
          */
          'tickmarks'?: boolean;
        /**
          * Hides the value label.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-nolabel
          */
          'nolabel'?: boolean;
        /**
          * Disables the slider.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Associates the slider with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the slider uses its parent `<form>`, if any.
         * 
         * This lets the slider work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the slider's name, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/range-slider#attributes-name
          */
          'name'?: string;
        } & HTMLElementProps;
      /**
        * Segmented Button Group Component  Use with the `<mdui-segmented-button>` component 
       * 
       * ```html
       * <mdui-segmented-button-group>
       *   <mdui-segmented-button>Day</mdui-segmented-button>
       *   <mdui-segmented-button>Week</mdui-segmented-button>
       *   <mdui-segmented-button>Month</mdui-segmented-button>
       * </mdui-segmented-button-group>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/segmented-button
        */
        'mdui-segmented-button-group': {
          /**
          * If set, the segmented button group expands to fill the width of its container.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-full-width
          */
          'full-width'?: boolean;
        /**
          * Controls whether the segmented button group can be selected. By default, it is not selectable. Possible values:
         * 
         * * `single`: Only one can be selected.
         * * `multiple`: Multiple selections are allowed.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-selects
          */
          'selects'?: 'single' | 'multiple';
        /**
          * Disables the segmented button group.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Requires a selection when the form is submitted.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-required
          */
          'required'?: boolean;
        /**
          * Associates the segmented button group with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the segmented button group uses its parent `<form>`, if any.
         * 
         * This lets the segmented button group work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-form
          */
          'form'?: string;
        /**
          * The name of the segmented button group, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-name
          */
          'name'?: string;
        /**
          * The value of the selected `<mdui-segmented-button>`. This value is submitted with form data.
         * 
         * **Note**: The HTML attribute always accepts a string and can only be used as an initial value when `selects="single"`. The JavaScript property is a string when `selects="single"` and an array of strings when `selects="multiple"`. When `selects="multiple"`, update the JavaScript property to change this value.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-group-attributes-value
          */
          'value'?: string | string[];
        } & HTMLElementProps;
      /**
        * Segmented Button Component  Use with the `<mdui-segmented-button-group>` component 
       * 
       * ```html
       * <mdui-segmented-button-group>
       *   <mdui-segmented-button>Day</mdui-segmented-button>
       *   <mdui-segmented-button>Week</mdui-segmented-button>
       *   <mdui-segmented-button>Month</mdui-segmented-button>
       * </mdui-segmented-button-group>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/segmented-button
        */
        'mdui-segmented-button': {
          /**
          * Specifies the Material Icons name for the left icon. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-icon
          */
          'icon'?: string;
        /**
          * Specifies the Material Icons name for the right icon. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Specifies the Material Icons name for the selected state. Alternatively, use `slot="selected-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-selected-icon
          */
          'selected-icon'?: string;
        /**
          * The URL for the link. When set, the component renders as an `<a>` element and supports link-related attributes.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-href
          */
          'href'?: string;
        /**
          * Downloads the linked URL.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-download
          */
          'download'?: string;
        /**
          * Controls where the linked URL opens. Possible values:
         * 
         * * `_blank`: Opens in a new tab or window.
         * * `_parent`: Opens in the parent browsing context, or `_self` if there is no parent.
         * * `_self`: Opens in the current browsing context (default).
         * * `_top`: Opens in the topmost browsing context, or `_self` if there are no ancestors.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-target
          */
          'target'?: '_blank' | '_parent' | '_self' | '_top';
        /**
          * Specifies the relationship of the linked URL as space-separated link types. Possible values:
         * 
         * * `alternate`: An alternate version of the current document.
         * * `author`: The author of the current document or article.
         * * `bookmark`: The permalink for the nearest ancestor section.
         * * `external`: The referenced document is not part of the same site as the current document.
         * * `help`: A link to context-sensitive help.
         * * `license`: Content covered by the copyright license described by the referenced document.
         * * `me`: Links to content owned by the current document's author.
         * * `next`: The next document in the series.
         * * `nofollow`: Not endorsed by the original author or publisher.
         * * `noreferrer`: Prevents the `Referer` header from being sent. Same effect as `noopener`.
         * * `opener`: Creates an auxiliary browsing context if the hyperlink would otherwise create a top-level browsing context that is not an auxiliary one (i.e., when `target="_blank"`).
         * * `prev`: The previous document in the series.
         * * `search`: Links to a resource that can be used to search through the current document and its related pages.
         * * `tag`: Marks the current document with the given tag.
         * 
         * **Note**: Only available when `href` is specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-rel
          */
          'rel'?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Disables the element.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Indicates that the element is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-loading
          */
          'loading'?: boolean;
        /**
          * The button name submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-name
          */
          'name'?: string;
        /**
          * The button value submitted with form data.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-value
          */
          'value'?: string;
        /**
          * Specifies the button's default action. Default: `button`. Possible values:
         * 
         * * `submit`: Submits the form data to the server.
         * * `reset`: Restores all controls to their initial values.
         * * `button`: Does nothing by default.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-type
          */
          'type'?: 'submit' | 'reset' | 'button';
        /**
          * Associates the button with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the button uses its parent `<form>`, if any.
         * 
         * This lets the button target any form in the document, not just the one it is nested in.
         * 
         * **Note**: Only available when `href` is not specified.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-form
          */
          'form'?: string;
        /**
          * Specifies the URL that processes the button's submitted information. Overrides the `action` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-formaction
          */
          'formaction'?: string;
        /**
          * Specifies how to encode the form data. Possible values:
         * 
         * * `application/x-www-form-urlencoded`: Default when the attribute is omitted.
         * * `multipart/form-data`: Used for `<input>` elements with `type="file"`.
         * * `text/plain`: Useful for debugging, but not for actual form submissions.
         * 
         * Overrides the `enctype` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-formenctype
          */
          'formenctype'?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
        /**
          * Specifies the HTTP method for form submission. Possible values:
         * 
         * * `post`: Sends the form data in the request body.
         * * `get`: Appends the form data to the `action` URL.
         * 
         * Overrides the `method` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-formmethod
          */
          'formmethod'?: 'post' | 'get';
        /**
          * Specifies that the form should not be validated on submission. Overrides the `novalidate` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-formnovalidate
          */
          'formnovalidate'?: boolean;
        /**
          * Specifies where to open the response after form submission. Possible values:
         * 
         * * `_self`: Current browsing context (default).
         * * `_blank`: New tab or window.
         * * `_parent`: Parent browsing context, or `_self` if there is no parent.
         * * `_top`: Topmost browsing context, or `_self` if there are no ancestors.
         * 
         * Overrides the `target` attribute of the button's form owner.
         * 
         * **Note**: Only available when `href` is not specified and `type="submit"`.
          * @see https://www.mdui.org/en/docs/2/components/segmented-button#segmented-button-attributes-formtarget
          */
          'formtarget'?: '_self' | '_blank' | '_parent' | '_top';
        } & HTMLElementProps;
      /**
        * Select Component  Use with the `<mdui-menu-item>` component 
       * 
       * ```html
       * <mdui-select>
       *   <mdui-menu-item value="item-1">Item 1</mdui-menu-item>
       *   <mdui-menu-item value="item-2">Item 2</mdui-menu-item>
       * </mdui-select>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/select
        */
        'mdui-select': {
          /**
          * Defines the select variant. Possible values:
         * 
         * * `filled`: Solid background with strong visual emphasis.
         * * `outlined`: Bordered with lighter visual emphasis.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-variant
          */
          'variant'?: 'filled' | 'outlined';
        /**
          * Enables multiple selections.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-multiple
          */
          'multiple'?: boolean;
        /**
          * Name of the select, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-name
          */
          'name'?: string;
        /**
          * Value of the select, which is submitted with form data.
         * 
         * If `multiple` is not set, the value is a string; otherwise, it is an array of strings. HTML attributes can only set string values; array values must be set via the JavaScript property.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-value
          */
          'value'?: string | string[];
        /**
          * Label text.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-label
          */
          'label'?: string;
        /**
          * Placeholder text.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-placeholder
          */
          'placeholder'?: string;
        /**
          * Helper text displayed below the select. Alternatively, use `slot="helper"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-helper
          */
          'helper'?: string;
        /**
          * Makes the select clearable.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-clearable
          */
          'clearable'?: boolean;
        /**
          * Material Icons name for the clear button displayed on the right when clearable. Alternatively, use `slot="clear-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-clear-icon
          */
          'clear-icon'?: string;
        /**
          * Select placement. Possible values:
         * 
         * * `auto`: Automatically determined.
         * * `bottom`: Below the input.
         * * `top`: Above the input.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-placement
          */
          'placement'?: 'auto' | 'bottom' | 'top';
        /**
          * Aligns text to the right.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-end-aligned
          */
          'end-aligned'?: boolean;
        /**
          * Prefix text of the select. Displayed only when the select is focused or has a value. Alternatively, use `slot="prefix"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-prefix
          */
          'prefix'?: string;
        /**
          * Suffix text of the select. Displayed only when the select is focused or has a value. Alternatively, use `slot="suffix"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-suffix
          */
          'suffix'?: string;
        /**
          * Material Icons name for the prefix icon. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-icon
          */
          'icon'?: string;
        /**
          * Material Icons name for the suffix icon. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Material Icons name displayed on the right when form field validation fails. Alternatively, use `slot="error-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-error-icon
          */
          'error-icon'?: string;
        /**
          * Associates the select with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the select uses its parent `<form>`, if any.
         * 
         * This lets the select work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-form
          */
          'form'?: string;
        /**
          * Makes the select read-only.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-readonly
          */
          'readonly'?: boolean;
        /**
          * Disables the select.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Requires a selection when the form is submitted.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-required
          */
          'required'?: boolean;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/select#attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Slider Component 
       * 
       * ```html
       * <mdui-slider></mdui-slider>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/slider
        */
        'mdui-slider': {
          /**
          * The value of the slider, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-value
          */
          'value'?: number;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-tabindex
          */
          'tabindex'?: number;
        /**
          * Specifies the minimum value. Default is `0`.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-min
          */
          'min'?: number;
        /**
          * Specifies the maximum value. Default is `100`.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-max
          */
          'max'?: number;
        /**
          * Specifies the step interval. Default is `1`.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-step
          */
          'step'?: number;
        /**
          * Adds tickmarks to the slider.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-tickmarks
          */
          'tickmarks'?: boolean;
        /**
          * Hides the value label.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-nolabel
          */
          'nolabel'?: boolean;
        /**
          * Disables the slider.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Associates the slider with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the slider uses its parent `<form>`, if any.
         * 
         * This lets the slider work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-form
          */
          'form'?: string;
        /**
          * Specifies the slider's name, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/slider#attributes-name
          */
          'name'?: string;
        } & HTMLElementProps;
      /**
        * Snackbar Component 
       * 
       * ```html
       * <mdui-snackbar>message</mdui-snackbar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/snackbar
        */
        'mdui-snackbar': {
          /**
          * Opens the Snackbar.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-open
          */
          'open'?: boolean;
        /**
          * Snackbar placement. Default is `bottom`. Possible values:
         * 
         * * `top`: Top center.
         * * `top-start`: Top left.
         * * `top-end`: Top right.
         * * `bottom`: Bottom center.
         * * `bottom-start`: Bottom left.
         * * `bottom-end`: Bottom right.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-placement
          */
          'placement'?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
        /**
          * Text for the action button. Alternatively, use `slot="action"`.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-action
          */
          'action'?: string;
        /**
          * Whether the action button is in a loading state.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-action-loading
          */
          'action-loading'?: boolean;
        /**
          * Shows a close button on the right.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-closeable
          */
          'closeable'?: boolean;
        /**
          * Material Icons name for the close button. Alternatively, use `slot="close-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-close-icon
          */
          'close-icon'?: string;
        /**
          * Maximum lines for message text. Default is unlimited. Possible values:
         * 
         * * `1`: Single line.
         * * `2`: Two lines.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-message-line
          */
          'message-line'?: 1 | 2;
        /**
          * Automatically closes the Snackbar after the given delay (in milliseconds). Set to `0` to disable auto-close. Default is `5000`.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-auto-close-delay
          */
          'auto-close-delay'?: number;
        /**
          * Closes the Snackbar when the user clicks or touches outside it.
          * @see https://www.mdui.org/en/docs/2/components/snackbar#attributes-close-on-outside-click
          */
          'close-on-outside-click'?: boolean;
        } & HTMLElementProps;
      /**
        * Switch Component 
       * 
       * ```html
       * <mdui-switch></mdui-switch>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/switch
        */
        'mdui-switch': {
          /**
          * Disables the switch.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Sets the switch to the checked state.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-checked
          */
          'checked'?: boolean;
        /**
          * The Material Icons name for the unchecked state. Alternatively, use `slot="unchecked-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-unchecked-icon
          */
          'unchecked-icon'?: string;
        /**
          * The Material Icons name for the checked state. Alternatively, use `slot="checked-icon"`. Defaults to the `check` icon; setting an empty string removes the default icon.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-checked-icon
          */
          'checked-icon'?: string;
        /**
          * The switch must be checked before the form is submitted.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-required
          */
          'required'?: boolean;
        /**
          * Associates the switch with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the switch uses its parent `<form>`, if any.
         * 
         * This lets the switch work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-form
          */
          'form'?: string;
        /**
          * The name of the switch, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-name
          */
          'name'?: string;
        /**
          * The value of the switch, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-value
          */
          'value'?: string;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/switch#attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Tab Panel Component  Use with the `<mdui-tabs>` and `<mdui-tab>` components 
       * 
       * ```html
       * <mdui-tabs value="tab-1">
       *   <mdui-tab value="tab-1">Tab 1</mdui-tab>
       *   <mdui-tab value="tab-2">Tab 2</mdui-tab>
       *   <mdui-tab value="tab-3">Tab 3</mdui-tab>
       * 
       *   <mdui-tab-panel slot="panel" value="tab-1">Panel 1</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-3">Panel 3</mdui-tab-panel>
       * </mdui-tabs>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/tabs
        */
        'mdui-tab-panel': {
          /**
          * Specifies the value of the tab panel.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-panel-attributes-value
          */
          'value'?: string;
        } & HTMLElementProps;
      /**
        * Tab Component  Use with the `<mdui-tabs>` and `<mdui-tab-panel>` components 
       * 
       * ```html
       * <mdui-tabs value="tab-1">
       *   <mdui-tab value="tab-1">Tab 1</mdui-tab>
       *   <mdui-tab value="tab-2">Tab 2</mdui-tab>
       *   <mdui-tab value="tab-3">Tab 3</mdui-tab>
       * 
       *   <mdui-tab-panel slot="panel" value="tab-1">Panel 1</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-3">Panel 3</mdui-tab-panel>
       * </mdui-tabs>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/tabs
        */
        'mdui-tab': {
          /**
          * Specifies the tab value.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-attributes-value
          */
          'value'?: string;
        /**
          * Specifies the Material Icons name. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-attributes-icon
          */
          'icon'?: string;
        /**
          * Arranges the icon and text horizontally.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-attributes-inline
          */
          'inline'?: boolean;
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tab-attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Tabs Component  Use with the `<mdui-tab>` and `<mdui-tab-panel>` components 
       * 
       * ```html
       * <mdui-tabs value="tab-1">
       *   <mdui-tab value="tab-1">Tab 1</mdui-tab>
       *   <mdui-tab value="tab-2">Tab 2</mdui-tab>
       *   <mdui-tab value="tab-3">Tab 3</mdui-tab>
       * 
       *   <mdui-tab-panel slot="panel" value="tab-1">Panel 1</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
       *   <mdui-tab-panel slot="panel" value="tab-3">Panel 3</mdui-tab-panel>
       * </mdui-tabs>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/tabs
        */
        'mdui-tabs': {
          /**
          * Defines the tab variant. Possible values:
         * 
         * * `primary`: Sits below `<mdui-top-app-bar>` and is used to switch between main application pages.
         * * `secondary`: Sits within the page and is used to switch between related content groups.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tabs-attributes-variant
          */
          'variant'?: 'primary' | 'secondary';
        /**
          * Specifies the active `<mdui-tab>` value.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tabs-attributes-value
          */
          'value'?: string;
        /**
          * Defines the tab position. Default is `top-start`. Possible values:
         * 
         * * `top-start`: Top left.
         * * `top`: Top centered.
         * * `top-end`: Top right.
         * * `bottom-start`: Bottom left.
         * * `bottom`: Bottom, centered.
         * * `bottom-end`: Bottom right.
         * * `left-start`: Left top.
         * * `left`: Left, centered.
         * * `left-end`: Left bottom.
         * * `right-start`: Right top.
         * * `right`: Right, centered.
         * * `right-end`: Right bottom.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tabs-attributes-placement
          */
          'placement'?: 'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end' | 'left-start' | 'left' | 'left-end' | 'right-start' | 'right' | 'right-end';
        /**
          * If set, the tabs will fill the width of their parent element.
          * @see https://www.mdui.org/en/docs/2/components/tabs#tabs-attributes-full-width
          */
          'full-width'?: boolean;
        } & HTMLElementProps;
      /**
        * Text Field Component 
       * 
       * ```html
       * <mdui-text-field label="Text Field"></mdui-text-field>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/text-field
        */
        'mdui-text-field': {
          /**
          * Defines the text field variant. Default is `filled`. Possible values:
         * 
         * * `filled`: Text field with a background color for stronger visual emphasis.
         * * `outlined`: Text field with a border for subtler visual emphasis.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-variant
          */
          'variant'?: 'filled' | 'outlined';
        /**
          * Specifies the text field type. Default is `text`. Possible values:
         * 
         * * `text`: Standard text field.
         * * `number`: Allows numeric input only. Virtual keyboards on mobile devices show a numeric layout.
         * * `password`: Hides the password as you type.
         * * `url`: Validates URL format. Virtual keyboards on mobile devices show a URL-specific layout.
         * * `email`: Validates email format. Virtual keyboards on mobile devices show an email-specific layout.
         * * `search`: Shows a search icon on the Enter key in virtual keyboards.
         * * `tel`: Displays a phone keypad on virtual keyboards.
         * * `hidden`: Hides the control, but its value is still submitted to the server.
         * * `date`: Opens a date picker or a numeric scroll wheel for year, month, and day in supported browsers.
         * * `datetime-local`: Activates a date and time picker in supported browsers, without a time zone.
         * * `month`: Allows entering a year and month without a time zone.
         * * `time`: Allows time input without a time zone.
         * * `week`: Allows entering a year and week without a time zone.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-type
          */
          'type'?: 'text' | 'number' | 'password' | 'url' | 'email' | 'search' | 'tel' | 'hidden' | 'date' | 'datetime-local' | 'month' | 'time' | 'week';
        /**
          * The name of the text field, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-name
          */
          'name'?: string;
        /**
          * The value of the text field, which is submitted with form data.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-value
          */
          'value'?: string;
        /**
          * Label text.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-label
          */
          'label'?: string;
        /**
          * Placeholder text.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-placeholder
          */
          'placeholder'?: string;
        /**
          * The helper text displayed at the bottom of the text field. Alternatively, use `slot="helper"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-helper
          */
          'helper'?: string;
        /**
          * Shows the helper text only when the text field is focused.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-helper-on-focus
          */
          'helper-on-focus'?: boolean;
        /**
          * Makes the text field clearable.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-clearable
          */
          'clearable'?: boolean;
        /**
          * Material Icons name shown on the right when the text field is clearable. Alternatively, use `slot="clear-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-clear-icon
          */
          'clear-icon'?: string;
        /**
          * Aligns the text to the right.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-end-aligned
          */
          'end-aligned'?: boolean;
        /**
          * The prefix text for the text field. It is only displayed when the text field is focused or has a value. Alternatively, use `slot="prefix"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-prefix
          */
          'prefix'?: string;
        /**
          * The suffix text for the text field. It is only displayed when the text field is focused or has a value. Alternatively, use `slot="suffix"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-suffix
          */
          'suffix'?: string;
        /**
          * Material Icons name for the prefix icon of the text field. Alternatively, use `slot="icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-icon
          */
          'icon'?: string;
        /**
          * Material Icons name for the suffix icon of the text field. Alternatively, use `slot="end-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-end-icon
          */
          'end-icon'?: string;
        /**
          * Material Icons name displayed on the right side of the text field when form field validation fails. Alternatively, use `slot="error-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-error-icon
          */
          'error-icon'?: string;
        /**
          * Associates the text field with a `<form>` element. Set this to the `id` of a `<form>` in the same document. If omitted, the text field uses its parent `<form>`, if any.
         * 
         * This lets the text field work with any form in the document, not just the one it is nested in.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-form
          */
          'form'?: string;
        /**
          * Makes the text field read-only.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-readonly
          */
          'readonly'?: boolean;
        /**
          * Disables the text field.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * The field must be filled out before the form is submitted.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-required
          */
          'required'?: boolean;
        /**
          * The number of rows in the text field.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-rows
          */
          'rows'?: number;
        /**
          * Automatically adjusts the height of the text field based on its content.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-autosize
          */
          'autosize'?: boolean;
        /**
          * The minimum number of rows when `autosize` is enabled.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-min-rows
          */
          'min-rows'?: number;
        /**
          * The maximum number of rows when `autosize` is enabled.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-max-rows
          */
          'max-rows'?: number;
        /**
          * The minimum number of characters for input.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-minlength
          */
          'minlength'?: number;
        /**
          * The maximum number of characters for input.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-maxlength
          */
          'maxlength'?: number;
        /**
          * Displays the character count when `maxlength` is specified.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-counter
          */
          'counter'?: boolean;
        /**
          * The minimum value when `type` is `number`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-min
          */
          'min'?: number;
        /**
          * The maximum value when `type` is `number`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-max
          */
          'max'?: number;
        /**
          * The step interval for increment/decrement when `type` is `number`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-step
          */
          'step'?: number;
        /**
          * The regular expression for form validation.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-pattern
          */
          'pattern'?: string;
        /**
          * Adds a toggle button to show or hide the password when `type` is `password`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-toggle-password
          */
          'toggle-password'?: boolean;
        /**
          * Material Icons name for the visible password toggle button. Alternatively, use `slot="show-password-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-show-password-icon
          */
          'show-password-icon'?: string;
        /**
          * Material Icons name for the hidden password toggle button. Alternatively, use `slot="hide-password-icon"`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-hide-password-icon
          */
          'hide-password-icon'?: string;
        /**
          * A non-standard iOS attribute for automatic capitalization. Possible values:
         * 
         * * `none`: Disables automatic capitalization.
         * * `sentences`: Capitalizes the first letter of each sentence.
         * * `words`: Capitalizes the first letter of each word.
         * * `characters`: Capitalizes all letters.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-autocapitalize
          */
          'autocapitalize'?: 'none' | 'sentences' | 'words' | 'characters';
        /**
          * The `autocorrect` attribute of the `input` element.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-autocorrect
          */
          'autocorrect'?: string;
        /**
          * The `autocomplete` attribute of the `input` element.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-autocomplete
          */
          'autocomplete'?: string;
        /**
          * Customizes the Enter key text or icon on the virtual keyboard. The effect varies by device and language. Possible values:
         * 
         * * `enter`: Inserts a new line, typically used in a multi-line text field.
         * * `done`: Indicates completion and closes the virtual keyboard.
         * * `go`: Navigates to the target of the entered text.
         * * `next`: Moves to the next text field.
         * * `previous`: Moves to the previous text field.
         * * `search`: Navigates to search results.
         * * `send`: Sends a text message.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-enterkeyhint
          */
          'enterkeyhint'?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
        /**
          * Enables spell checking.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-spellcheck
          */
          'spellcheck'?: boolean;
        /**
          * Customizes the virtual keyboard. Possible values:
         * 
         * * `none`: No virtual keyboard. Useful for custom input controls.
         * * `text`: Standard text input keyboard.
         * * `decimal`: Decimal input keyboard. This includes a period `.` or comma `,` and numbers.
         * * `numeric`: Numeric keyboard. This displays numbers 0–9.
         * * `tel`: Phone number keyboard. This includes numbers 0–9, asterisk `*`, and hash `#` keys.
         * * `search`: Search-optimized virtual keyboard. 'Search' appears on the submit button.
         * * `email`: Email-optimized virtual keyboard. This typically includes `@` and `.`.
         * * `url`: URL-optimized virtual keyboard. This typically includes `.`, `/`, and `#`.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-inputmode
          */
          'inputmode'?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
        /**
          * Whether the element is focused when the page loads.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-autofocus
          */
          'autofocus'?: boolean;
        /**
          * The element's tab order when navigating with the Tab key.
          * @see https://www.mdui.org/en/docs/2/components/text-field#attributes-tabindex
          */
          'tabindex'?: number;
        } & HTMLElementProps;
      /**
        * Tooltip Component 
       * 
       * ```html
       * <mdui-tooltip content="tooltip content">
       *   <mdui-button>button</mdui-button>
       * </mdui-tooltip>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/tooltip
        */
        'mdui-tooltip': {
          /**
          * Defines the tooltip variant. Default is `plain`. Possible values:
         * 
         * * `plain`: For simple, single-line text.
         * * `rich`: For tooltips with a title, body text, and action buttons.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-variant
          */
          'variant'?: 'plain' | 'rich';
        /**
          * Sets the tooltip position. Default is `auto`. Possible values:
         * 
         * * `auto`: Automatically determined. For `variant="plain"`, prefers `top`; for `variant="rich"`, prefers `bottom-right`.
         * * `top-left`: Top left.
         * * `top-start`: Top start.
         * * `top`: Top center.
         * * `top-end`: Top end.
         * * `top-right`: Top right.
         * * `bottom-left`: Bottom left.
         * * `bottom-start`: Bottom start.
         * * `bottom`: Bottom center.
         * * `bottom-end`: Bottom end.
         * * `bottom-right`: Bottom right.
         * * `left-start`: Left start.
         * * `left`: Left center.
         * * `left-end`: Left end.
         * * `right-start`: Right start.
         * * `right`: Right center.
         * * `right-end`: Right end.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-placement
          */
          'placement'?: 'auto' | 'top-left' | 'top-start' | 'top' | 'top-end' | 'top-right' | 'bottom-left' | 'bottom-start' | 'bottom' | 'bottom-end' | 'bottom-right' | 'left-start' | 'left' | 'left-end' | 'right-start' | 'right' | 'right-end';
        /**
          * The delay (in milliseconds) before the tooltip appears on hover.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-open-delay
          */
          'open-delay'?: number;
        /**
          * The delay (in milliseconds) before the tooltip disappears on hover.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-close-delay
          */
          'close-delay'?: number;
        /**
          * Sets the tooltip title. Only applies when `variant="rich"`. Alternatively, use `slot="headline"`.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-headline
          */
          'headline'?: string;
        /**
          * Sets the tooltip content. Alternatively, use `slot="content"`.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-content
          */
          'content'?: string;
        /**
          * Defines how the tooltip opens. Multiple space-separated values are supported. Possible values:
         * 
         * * `click`: Triggers on click.
         * * `hover`: Triggers on mouse hover.
         * * `focus`: Triggers on focus.
         * * `manual`: Can only be opened and closed programmatically; no other trigger methods can be specified.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-trigger
          */
          'trigger'?: 'click' | 'hover' | 'focus' | 'manual' | string;
        /**
          * Disables the tooltip.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-disabled
          */
          'disabled'?: boolean;
        /**
          * Opens the tooltip.
          * @see https://www.mdui.org/en/docs/2/components/tooltip#attributes-open
          */
          'open'?: boolean;
        } & HTMLElementProps;
      /**
        * Top App Bar Title Component  Use with the `<mdui-top-app-bar>` component 
       * 
       * ```html
       * <mdui-top-app-bar>
       *   <mdui-button-icon icon="menu"></mdui-button-icon>
       *   <mdui-top-app-bar-title>Title</mdui-top-app-bar-title>
       *   <div style="flex-grow: 1"></div>
       *   <mdui-button-icon icon="more_vert"></mdui-button-icon>
       * </mdui-top-app-bar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/top-app-bar
        */
        'mdui-top-app-bar-title': {
          
        } & HTMLElementProps;
      /**
        * Top App Bar Component 
       * 
       * ```html
       * <mdui-top-app-bar>
       *   <mdui-button-icon icon="menu"></mdui-button-icon>
       *   <mdui-top-app-bar-title>Title</mdui-top-app-bar-title>
       *   <div style="flex-grow: 1"></div>
       *   <mdui-button-icon icon="more_vert"></mdui-button-icon>
       * </mdui-top-app-bar>
       * ```
        * @see https://www.mdui.org/en/docs/2/components/top-app-bar
        */
        'mdui-top-app-bar': {
          /**
          * Defines the top app bar variant. Default is `small`. Possible values:
         * 
         * * `center-aligned`: A small app bar with a centered title.
         * * `small`: Small app bar.
         * * `medium`: Medium-sized app bar.
         * * `large`: Large-sized app bar.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-variant
          */
          'variant'?: 'center-aligned' | 'small' | 'medium' | 'large';
        /**
          * Whether the top app bar is hidden.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-hide
          */
          'hide'?: boolean;
        /**
          * Shrinks the app bar to the `small` variant. Only applies to `medium` or `large` variants.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-shrink
          */
          'shrink'?: boolean;
        /**
          * Defines the scroll behavior. Multiple space-separated values are accepted. Possible values:
         * 
         * * `hide`: Hides when scrolling.
         * * `shrink`: Shrinks when scrolling (for medium to large app bars).
         * * `elevate`: Increases elevation when scrolling.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-scroll-behavior
          */
          'scroll-behavior'?: 'hide' | 'shrink' | 'elevate';
        /**
          * The element to watch for scroll events. Accepts a CSS selector, a DOM element, or a [JQ object](/en/docs/2/functions/jq). Defaults to `window`.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-scroll-target
          */
          'scroll-target'?: string | HTMLElement | JQ<HTMLElement>;
        /**
          * The scroll distance (in pixels) required to trigger the scroll behavior.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-scroll-threshold
          */
          'scroll-threshold'?: number;
        /**
          * Specifies the layout order within the [`<mdui-layout>`](/en/docs/2/components/layout) component. Items are sorted in ascending order. The default value is `0`.
          * @see https://www.mdui.org/en/docs/2/components/top-app-bar#top-app-bar-attributes-order
          */
          'order'?: number;
        } & HTMLElementProps;
      }
    }
  }
}
