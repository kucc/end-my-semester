"use client";

import { supabase } from "@/app/_clients/supabase";
import { Button } from "@/app/_components/Input/Button";
import { useMutation } from "@/app/_libs/useMutation";
import { AuthResponse, User } from "@supabase/supabase-js";
import { Github } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

async function signInWithGitHub(redirect: string | null) {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "github",
	});

	return { data, error };
}

export default function Home() {
	const router = useRouter();
	const searchParmas = useSearchParams();
	const redirect = searchParmas.get("redirect");

	const [logIn, { data: logInData, isLoading: isLogInLoading }] = useMutation<
		AuthResponse,
		User
	>("/api/auth");

	const handleLogInClick = async () => {
		await signInWithGitHub(redirect);
	};

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (session === null) {
					return;
				}

				if (event === "SIGNED_IN") {
					logIn(session.user);
				}
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [router, logIn]);

	useEffect(() => {
		if (logInData === undefined) {
			return;
		}

		router.push("/me");
	}, [logInData, router]);

	return (
		<div className="gap-8 p-4 flex flex-col justify-end h-screen">
			<div className="flex flex-col gap-8 mb-10">
				<div className="flex justify-between items-end">
					<div className="flex gap-4 flex-col">
						<h1 className="text-4xl font-bold text-gray-900">
							내<br />
							종강을
							<br />
							지켜줘
						</h1>
						<div className="text-xl font-medium text-gray-500">
							나만의
							<br />
							학기 중 수호천사가
							<br />
							되어줄래..?
						</div>
						<div className="text-sm font-bold text-gray-400">
							2023 KUCC 쿠씨톤 5조
						</div>
					</div>
					<img
						src="/logo.png"
						alt="얼굴에 물음표가 그려져 있는 사람 캐릭터, 등 뒤에 날개가 있고 머리 위에 후광이 있음"
						className="w-1/2"
					/>
				</div>
				<Button
					text="GitHub로 계속"
					Icon={Github}
					onClick={handleLogInClick}
					isLoading={false}
					event={""}
					isPrimary
				/>
			</div>
		</div>
	);
}
