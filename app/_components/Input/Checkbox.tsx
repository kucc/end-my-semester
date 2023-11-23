import { j } from "@/app/_libs/j";
import { UseFormRegisterReturn } from "react-hook-form";

interface CheckboxProps {
	register: UseFormRegisterReturn;
	id: string;
	title: string;
	label: string;
	disabled?: boolean;
}

export function Checkbox({
	register,
	id,
	title,
	label,
	disabled,
}: CheckboxProps) {
	return (
		<div
			className={j(
				"flex flex-col transition-opacity",
				disabled ? "opacity-50" : ""
			)}
		>
			<div className="flex items-center justify-between gap-1.5">
				<input
					{...register}
					type="checkbox"
					id={id}
					className={j(
						"h-5 w-5 rounded-md transition-colors border-gray-300 dark:border-gray-700 text-sky-500 shadow-sm dark:text-sky-600 bg-white dark:bg-gray-900",
						disabled ? "bg-gray-100 dark:bg-gray-950" : ""
					)}
					disabled={disabled}
				/>
				<label
					htmlFor={id}
					className="flex-1 font-medium text-gray-900 dark:text-gray-100"
				>
					{title}
				</label>
			</div>
			{label && (
				<span className="ml-[1.625rem] text-sm text-gray-500 dark:text-gray-500">
					{label}
				</span>
			)}
		</div>
	);
}
