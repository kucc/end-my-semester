import { prisma } from "@/app/_clients/prisma";
import { DefaultResponse } from "@/app/_libs/response";
import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export type AuthResponse = DefaultResponse;

export async function POST(request: NextRequest) {
	const user = (await request.json()) as User;

	if (user) {
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				id: user.id,
				avatar: user.user_metadata.avatar_url ?? "",
				name: user.user_metadata.full_name ?? user.email,
				github: user.user_metadata.user_name ?? "",
			},
			create: {
				id: user.id,
				avatar: user.user_metadata.avatar_url ?? "",
				name: user.user_metadata.full_name ?? user.email,
				github: user.user_metadata.user_name ?? "",
			},
		});

		const response = NextResponse.json<AuthResponse>(
			{ ok: true },
			{ status: 200 }
		);

		// XXX
		response.cookies.set("supabase-user-id", user.id);

		return response;
	}

	return NextResponse.json(
		{ ok: false, error: "No session provided" },
		{ status: 400 }
	);
}
