import { splitProps, JSX } from 'solid-js'
import { BaseProps } from './types'

export interface RowProps extends JSX.HTMLAttributes<HTMLTableElement> {}

export default function Row(props: RowProps) {
  const [self, rest] = splitProps(props, ['children', 'style'])

  return (
    <table align="center" width="100%" style={self.style} role="presentation" cellSpacing="0" cellPadding="0" border={0} {...rest}>
      <tbody style={{ width: '100%' }}>
        <tr style={{ width: '100%' }}>{self.children}</tr>
      </tbody>
    </table>
  )
}
