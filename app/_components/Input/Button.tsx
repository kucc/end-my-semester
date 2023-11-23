import { j } from "@/app/_libs/j";
import { Loader2, LucideIcon } from "lucide-react";
import Link from "next/link";
import TextTransition from "react-text-transition";

interface ButtonProps {
	isPrimary?: boolean;
	isLoading: boolean;
	disabled?: boolean;
	Icon?: LucideIcon;
	iconFill?: boolean;
	text?: string;
	onClick?: () => void;
	href?: string;
	newTab?: boolean;
	animateText?: boolean;
	event: string;
	eventData?: {
		[key: string]: string;
	};
	className?: string;
}

export function Button({
	isPrimary,
	isLoading,
	disabled,
	Icon,
	iconFill,
	text,
	onClick,
	href,
	newTab,
	animateText,
	event,
	eventData,
	className,
}: ButtonProps) {
	const Tag = href ? Link : "button";

	const eventDataProps: any = {};

	for (let key in eventData ?? {}) {
		eventDataProps[`data-umami-event-${key}`] = eventData?.[key];
	}

	return (
		<Tag
			href={disabled ? "" : href ?? ""}
			rel={newTab ? "noopener noreferrer" : undefined}
			target={newTab ? "_blank" : undefined}
			data-umami-event={event}
			className={j(
				"flex items-center border justify-center rounded-md px-4 py-2 w-full shadow-sm transition-all",
				isPrimary
					? "border-sky-500 bg-sky-500 font-medium text-white dark:border-sky-600 dark:bg-sky-600"
					: "border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200",
				isLoading || disabled
					? "cursor-default opacity-60"
					: isPrimary
					? "hover:bg-sky-600 active:bg-sky-700 dark:hover:bg-sky-700 dark:active:bg-sky-800"
					: "hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700",
				className ?? ""
			)}
			onClick={onClick}
			disabled={isLoading || disabled}
			{...eventDataProps}
		>
			{isLoading ? (
				<Loader2 className="animate-spin shrink-0" />
			) : (
				Icon && (
					<Icon
						className="shrink-0"
						strokeWidth={iconFill ? 1 : undefined}
						fill={iconFill ? "currentColor" : "transparent"}
					/>
				)
			)}
			{text &&
				(animateText ? (
					<TextTransition
						inline
						className="ml-2 mr-1 break-keep text-center leading-5"
					>
						{text}
					</TextTransition>
				) : (
					<span className="ml-2 mr-1 break-keep text-center leading-5">
						{text}
					</span>
				))}
		</Tag>
	);
}
