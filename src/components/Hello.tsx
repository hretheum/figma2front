type Props = { name?: string }
export function Hello({ name = 'World' }: Props) {
  return <h2>Hello, {name}!</h2>
}

