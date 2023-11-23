import { SWRProvider } from "@/app/_components/swrProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "내 종강을 지켜줘",
	description: "나만의 학기 중 수호천사가 되어줄래..?",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ko">
			<body>
				<SWRProvider>
					<main className="max-w-lg mx-auto">{children}</main>
				</SWRProvider>
			</body>
		</html>
	);
}
