import { IconProps } from './types'

export const IconOutlineBeaker = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M7.076 3.617A1 1 0 0 1 8 3h8a1 1 0 0 1 .707 1.707L16 5.414v4.758a1 1 0 0 0 .293.707l3.84 3.84.002.002.001.001 1.157 1.157c1.89 1.89.551 5.121-2.122 5.121H4.828c-2.673 0-4.011-3.231-2.121-5.121l.828-.829h.001l4.17-4.171A1 1 0 0 0 8 10.172V5.414l-.707-.707a1 1 0 0 1-.217-1.09ZM10 5v5.172a3 3 0 0 1-.879 2.12l-2.093 2.094 1.15.23a5 5 0 0 0 3.216-.431l.317-.159a7 7 0 0 1 4.252-.648l-1.084-1.085a3 3 0 0 1-.88-2.121V5h-4Zm8.72 11.134a1 1 0 0 0-.51-.272l-2.388-.478a5 5 0 0 0-3.216.431l-.318.159a7 7 0 0 1-4.503.603l-1.932-.387a1 1 0 0 0-.903.274l-.829.829c-.63.63-.184 1.707.707 1.707h14.343c.891 0 1.337-1.077.707-1.707l-1.157-1.158h-.001Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
