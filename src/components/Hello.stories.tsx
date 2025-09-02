import type { Meta, StoryObj } from '@storybook/react'
import { Hello } from './Hello'

const meta: Meta<typeof Hello> = {
  title: 'Example/Hello',
  component: Hello,
}
export default meta

export const Default: StoryObj<typeof Hello> = { args: { name: 'Chromatic Test' } }

