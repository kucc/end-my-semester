"use client";

import { Button } from "@/app/_components/Input/Button";
import { Checkbox } from "@/app/_components/Input/Checkbox";
import { TextInput } from "@/app/_components/Input/TextInput";
import { useMutation } from "@/app/_libs/useMutation";
import { MeResponse } from "@/app/api/auth/me/route";
import { ChatResponse } from "@/app/api/chat/route";
import { ProfileResponse } from "@/app/api/profile/route";
import { Github, Loader2, LogIn, Send, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

interface ProfilePageParams {
	params: {
		publicId?: string;
	};
}

export interface MessageForm {
	body: string;
	isPublic: boolean;
	fakeName: string;
}

export default function ProfilePage({ params }: ProfilePageParams) {
	const { data, isLoading } = useSWR<ProfileResponse>(
		!params.publicId ? "" : `/api/profile?publicId=${params.publicId}`
	);

	const router = useRouter();

	const [send, { data: sendResponse }] = useMutation<ChatResponse, MessageForm>(
		"/api/chat?publicId=" + params.publicId
	);

	const { data: logInData, isLoading: isLogInLoading } =
		useSWR<MeResponse>("/api/auth/me");

	const { register, handleSubmit, setValue } = useForm<MessageForm>();

	const [found, setFound] = useState(false);

	useEffect(() => {
		if (!data || !data.ok || !data.fakeNameUsed) {
			return;
		}

		setValue("fakeName", data.fakeNameUsed);
		setFound(true);
	}, [data, setValue]);

	useEffect(() => {
		if (!sendResponse) {
			return;
		}

		if (!sendResponse.ok) {
			alert("메시지를 보내는 데 실패했습니다.");

			return;
		}

		alert("메시지를 보냈습니다!");

		setValue("body", "");
		setValue("isPublic", false);
	}, [sendResponse, setValue]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full h-screen text-sky-600">
				<Loader2 className="animate-spin" size={36} />
			</div>
		);
	}

	if (!data || !data.ok) {
		return <div>존재하지 않는 사용자입니다.</div>;
	}

	const onValid = (inputs: MessageForm) => {
		if (!logInData || !logInData.ok) {
			alert("로그인이 필요합니다.");

			router.push("/?redirect=/profile/" + params.publicId);

			return;
		}

		send({
			isPublic: inputs.isPublic,
			body: inputs.body,
			fakeName: inputs.fakeName,
		});
	};

	console.log(data);

	return (
		<div className="p-4 pt-8 gap-8 flex flex-col">
			<div className="gap-2 flex flex-col items-center">
				<img
					src={data.avatar}
					className="rounded-full w-16"
					alt={`${data.name}님의 GitHub 프로필 사진`}
				/>
				<div className="text-lg font-bold text-gray-800">{data.name}</div>
				{data.github.length > 0 && (
					<a
						target="_blank"
						rel="noreferrer"
						aria-label={`${data.name}님의 GitHub 프로필을 새 탭에서 열기`}
						href={`https://github.com/${data.github}`}
						className="flex px-3 py-2 bg-sky-100 text-sky-700 gap-1 rounded-md text-sm font-semibold items-center hover:bg-sky-200 active:bg-sky-300 transition-colors"
					>
						<Github size={20} />
						<span>@{data.github}</span>
					</a>
				)}
			</div>
			<div className="flex flex-col gap-3">
				<div className="text-center text-xl break-keep text-gray-800">
					{data.publicMessagesWithFakeNames.length === 0 ? (
						<span>
							{data.name}님은 아직 받은 공개 메시지가 없어요.
							<br />
							공개 메시지를 남겨보세요!
						</span>
					) : (
						`${data.name}님이 받은 공개 메시지 ${data.publicMessagesWithFakeNames.length}개`
					)}
				</div>
				<ul className="flex flex-col gap-2">
					{data.publicMessagesWithFakeNames.map((message, index) => (
						<li
							className="p-4 rounded-xl bg-gray-200 text-gray-800"
							key={index}
						>
							<div>{message.body}</div>
							<div className="text-xs text-gray-500">
								{message.fakeName} 이름으로
								{logInData && logInData.ok && logInData.id === message.senderId
									? " 내가 보낸 "
									: " 다른 사람이 보낸 "}
								공개 메시지에요.
							</div>
						</li>
					))}
				</ul>
			</div>
			<div className="text-center text-sm font-medium text-gray-600">
				12월 21일 종강을 맞이하면 모두의 실명이 공개돼요.
			</div>
			<form
				onSubmit={handleSubmit(onValid)}
				className="flex flex-col gap-4 p-4 border-2 shadow-md border-gray-400 rounded-xl"
			>
				<div className="text-center text-gray-800">
					{data.name}님에게 메시지 작성하기
				</div>
				<TextInput
					type="text"
					register={register("fakeName", {
						required: true,
					})}
					id={"body"}
					label={"이 사람에게 사용할 닉네임"}
					placeholder={""}
					disabled={found || (logInData && !logInData.ok)}
				/>
				<TextInput
					type="text"
					register={register("body", {
						required: true,
					})}
					id={"body"}
					label={"보낼 메시지"}
					placeholder={""}
					disabled={logInData && !logInData.ok}
				/>
				<Checkbox
					register={register("isPublic")}
					id={""}
					disabled={logInData && !logInData.ok}
					title={"공개 메시지로 보내기"}
					label="이 프로필을 방문하는 모두가 내 메시지를 볼 수 있습니다."
				/>
				{logInData && !logInData.ok ? (
					<Button
						isPrimary
						Icon={LogIn}
						isLoading={isLogInLoading}
						event={""}
						text={"로그인 먼저 하기"}
						onClick={() => {
							router.push("/?redirect=/profile/" + params.publicId);
						}}
					/>
				) : (
					<Button
						isPrimary
						Icon={Send}
						isLoading={isLoading}
						event={""}
						text={"보내기"}
					/>
				)}
			</form>
			<Button
				text={
					logInData && !logInData.ok
						? "로그인하고 내 프로필 보기"
						: "내 프로필 보기"
				}
				isLoading={isLogInLoading}
				Icon={UserCircle2}
				event=""
				onClick={() => {
					if (logInData && !logInData.ok) {
						router.push("/");

						return;
					}

					router.push(`/me`);
				}}
			/>
		</div>
	);
}
