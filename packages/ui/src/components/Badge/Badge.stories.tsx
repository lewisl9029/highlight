import { Badge } from './Badge'
import type { Meta } from '@storybook/react'

export default {
	title: 'Components/Badge',
	component: Badge,
} as Meta<typeof Badge>

export const Sizes = () => {
	return (
		<>
			<Badge size="small" label="Small" />
			<br />
			<Badge size="medium" label="Medium" />
			<br />
			<Badge size="large" label="Large" />
			<br />
			<Badge shape="rounded" size="small" label="Small" />
			<br />
			<Badge shape="rounded" size="medium" label="Medium" />
			<br />
			<Badge shape="rounded" size="large" label="Large" />
		</>
	)
}

export const Themes = () => {
	return (
		<>
			<Badge variant="green" label="Green" />
			<Badge variant="white" label="White" />
			<Badge variant="outlineGray" label="Outline Gray" />
			<Badge variant="gray" label="Gray" />
		</>
	)
}
