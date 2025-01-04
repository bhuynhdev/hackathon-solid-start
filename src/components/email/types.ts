import { ComponentProps, ValidComponent } from 'solid-js'

export type BaseProps<TElement extends ValidComponent> = ComponentProps<TElement>

declare global {
  namespace globalThis {
    // eslint-disable-next-line vars-on-top, no-var
    var isJsxEmailPreview: boolean
  }

  interface ImportMeta {
    isJsxEmailPreview: boolean
  }
}

declare module 'solid-js' {
  // Add back deprecated attributes to Table element
  // Credit: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0543e1e0987c6f5147358054d4f1f108a0b2d74c/types/react/v18/index.d.ts#L3572
  interface TableHTMLAttributes<T> extends JSX.HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | undefined
    bgcolor?: string | undefined
    border?: number | undefined
    cellPadding?: number | string | undefined
    cellSpacing?: number | string | undefined
    frame?: boolean | undefined
    rules?: 'none' | 'groups' | 'rows' | 'columns' | 'all' | undefined
    summary?: string | undefined
    width?: number | string | undefined
  }
  namespace JSX {
    interface IntrinsicElements extends HTMLElementTags, HTMLElementDeprecatedTags, SVGElementTags {
      table: TableHTMLAttributes<HTMLTableElement>
    }
  }
}
