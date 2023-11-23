interface LabelProps {
	text: string;
	id: string | undefined;
}

export function Label({ text, id }: LabelProps) {
	return (
		<label
			htmlFor={id}
			className="text-gray-700 dark:text-gray-300 mr-1 break-keep"
		>
			{text}
		</label>
	);
}
