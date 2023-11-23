"use client";

import { supabase } from "@/app/_clients/supabase";
import { Button } from "@/app/_components/Input/Button";
import { MeResponse } from "@/app/api/auth/me/route";
import { Github, Globe, Loader2, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import QRCode from "react-qr-code";
import useSWR from "swr";

export default function MePage() {
	const { data, isLoading } = useSWR<MeResponse>("/api/auth/me");
	const router = useRouter();

	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	useEffect(() => {
		if (!data) {
			return;
		}

		if (!data.ok) {
			router.push("/");
			return;
		}

		if (redirect === null) {
			return;
		}

		router.push(redirect);
	}, [data, router, redirect]);

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === "SIGNED_OUT") {
					const cookie = document.cookie;
					const cookies = cookie.split("; ");
					for (const cookie of cookies) {
						const [name] = cookie.split("=");
						if (name === "supabase-user-id") {
							document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
						}
					}
					alert("로그아웃 되었습니다.");
					router.push("/");
				}
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full h-screen text-sky-600">
				<Loader2 className="animate-spin" size={36} />
			</div>
		);
	}

	if (!data || !data.ok) {
		return <div>로그인을 먼저 하세요.</div>;
	}

	return (
		<div className="p-4 pt-8 gap-8 flex flex-col">
			<div className="gap-2 flex flex-col items-center">
				<img
					src={data.avatar}
					className="rounded-full w-16"
					alt="내 GitHub 프로필 사진"
				/>
				<div className="text-lg font-bold text-gray-800">{data.name}</div>
				{data.github.length > 0 && (
					<a
						target="_blank"
						rel="noreferrer"
						aria-label="내 GitHub 프로필을 새 탭에서 열기"
						href={`https://github.com/${data.github}`}
						className="flex px-3 py-2 bg-sky-100 text-sky-700 gap-1 rounded-md text-sm font-semibold items-center hover:bg-sky-200 active:bg-sky-300 transition-colors"
					>
						<Github size={20} />
						<span>@{data.github}</span>
					</a>
				)}
			</div>
			<div className="flex flex-col gap-3">
				<div className="text-xl text-center text-gray-800">
					나에게 온 메시지
					{data.receivedMessagesWithFakeNames.length === 0
						? ""
						: ` ${data.receivedMessagesWithFakeNames.length}개`}
				</div>
				<ul className="flex flex-col gap-3">
					{data.receivedMessagesWithFakeNames.map((message, index) => (
						<div
							className="bg-gray-200 p-4 rounded-xl flex justify-between text-gray-800 items-center"
							key={index}
						>
							<div>
								<div>{message.body}</div>
								<div className="text-xs text-gray-500">
									{message.fakeName} 이름으로 받았어요.
								</div>
							</div>
							{message.public && <Globe size={20} />}
						</div>
					))}
					{data.receivedMessagesWithFakeNames.length === 0 && (
						<div className="text-center text-gray-500 break-keep">
							아직 받은 메시지가 없어요.
							<br />
							다른 사람들에게 메시지를 받아보세요!
						</div>
					)}
				</ul>
			</div>
			<div className="flex flex-col gap-3">
				<div className="text-xl text-center text-gray-800">
					내가 보낸 메시지
					{data.sentMessagesWithFakeNames.length === 0
						? ""
						: ` ${data.sentMessagesWithFakeNames.length}개`}
				</div>
				<ul className="flex flex-col gap-3">
					{data.sentMessagesWithFakeNames.map((message, index) => (
						<a
							href={`/profile/${message.receiverId}`}
							className="bg-gray-200 p-4 rounded-xl flex justify-between text-gray-800 items-center"
							key={index}
						>
							<div>
								<div>{message.body}</div>
								<div className="text-xs text-gray-500">
									{message.fakeName} 이름으로 {message.receiverName}님에게
									보냈어요.
									<br />
									<span className="underline font-semibold">
										{message.receiverName}님의 프로필 방문하기 →
									</span>
								</div>
							</div>
							{message.public && <Globe size={20} />}
						</a>
					))}
					{data.sentMessagesWithFakeNames.length === 0 && (
						<div className="text-center text-gray-500 break-keep">
							아직 보낸 메시지가 없어요.
							<br />
							다른 사람들에게 메시지를 보내보세요!
						</div>
					)}
				</ul>
			</div>
			<div className="text-center text-sm font-medium text-gray-600">
				12월 21일 종강을 맞이하면 모두의 실명이 공개돼요.
			</div>
			<div className="p-6 border-2 border-gray-400 shadow-md rounded-xl flex gap-4 flex-col items-center">
				<div className="text-center break-keep text-gray-800">
					이 링크를 공유하고
					<br />
					다른 사람들에게 메시지를 받아보세요.
				</div>
				<a
					className="underline text-sm text-center"
					href={`profile/${data.id}`}
				>
					https://kucc-2023-hackathon.vercel.app/profile/{data.id}
				</a>
				<QRCode
					bgColor="transparent"
					className="w-full mt-4"
					value={`https://kucc-2023-hackathon.vercel.app/profile/${data.id}`}
				/>
			</div>
			<Button
				text="로그아웃"
				Icon={LogOut}
				onClick={async () => {
					await supabase.auth.signOut();
				}}
				isLoading={false}
				event={""}
			/>
		</div>
	);
}
