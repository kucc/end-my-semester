import { prisma } from "@/app/_clients/prisma";
import { DefaultResponse } from "@/app/_libs/response";
import { NextRequest, NextResponse } from "next/server";

export type ProfileResponse = DefaultResponse<{
	publicMessagesWithFakeNames: {
		id: string;
		body: string;
		public: boolean;
		senderId: string;
		receiverId: string;
		createdAt: Date;
		fakeName: string;
	}[];
	name: string;
	avatar: string;
	github: string;
	fakeNameUsed: string | null;
}>;

export async function GET(request: NextRequest) {
	// XXX
	const cookie = request.cookies.get("supabase-user-id");
	const { searchParams } = new URL(request.url);
	const publicId = searchParams.get("publicId");

	if (!publicId) {
		return NextResponse.json<ProfileResponse>(
			{ ok: false, error: "No publicId" },
			{ status: 401 }
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: publicId },
		select: { name: true, avatar: true, github: true },
	});

	if (!user) {
		return NextResponse.json<ProfileResponse>(
			{ ok: false, error: "No user found" },
			{ status: 401 }
		);
	}

	const { name, avatar, github } = user;

	const publicMessages = await prisma.message.findMany({
		where: { public: true, receiverId: publicId },
	});

	const publicMessagesWithFakeNames = await Promise.all(
		publicMessages.map(async (message) => {
			const sender = await prisma.fakeName.findFirst({
				where: { userId: message.senderId, receiverId: publicId },
			});

			return {
				...message,
				fakeName: sender ? sender.fakeName : "???",
			};
		})
	);

	let fakeNameUsed = null;

	if (cookie) {
		fakeNameUsed = await prisma.fakeName.findFirst({
			where: { userId: cookie.value, receiverId: publicId },
		});
	}

	return NextResponse.json<ProfileResponse>({
		ok: true,
		name,
		avatar,
		github,
		publicMessagesWithFakeNames,
		fakeNameUsed: fakeNameUsed ? fakeNameUsed.fakeName : null,
	});
}
