import { prisma } from "@/app/_clients/prisma";
import { DefaultResponse } from "@/app/_libs/response";
import { NextRequest, NextResponse } from "next/server";

export type MeResponse = DefaultResponse<{
	id: string;
	name: string;
	avatar: string;
	github: string;
	receivedMessagesWithFakeNames: {
		fakeName: string;
		id: string;
		body: string;
		public: boolean;
		createdAt: Date;
	}[];
	sentMessagesWithFakeNames: {
		fakeName: string;
		receiverName: string;
		receiverId: string;
		id: string;
		body: string;
		public: boolean;
		createdAt: Date;
	}[];
}>;

export async function GET(request: NextRequest) {
	// XXX
	const cookie = request.cookies.get("supabase-user-id");

	if (!cookie) {
		return NextResponse.json<MeResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const data = await prisma.user.findUnique({
		where: { id: cookie.value },
		select: { id: true, avatar: true, name: true, github: true },
	});

	if (!data) {
		return NextResponse.json<MeResponse>(
			{ ok: false, error: "Not logged in" },
			{ status: 401 }
		);
	}

	const receivedMessages = await prisma.message.findMany({
		where: { receiverId: cookie.value },
	});

	const sentMessages = await prisma.message.findMany({
		where: { senderId: cookie.value },
	});

	const receivedMessagesWithFakeNames = await Promise.all(
		receivedMessages.map(async (message) => {
			const name = await prisma.fakeName.findFirst({
				where: { userId: message.senderId, receiverId: cookie.value },
			});

			const messageFiltered = {
				id: message.id,
				body: message.body,
				public: message.public,
				createdAt: message.createdAt,
			};

			return {
				...messageFiltered,
				fakeName: name ? name.fakeName : "???",
			};
		})
	);

	const sentMessagesWithFakeNames = await Promise.all(
		sentMessages.map(async (message) => {
			const name = await prisma.fakeName.findFirst({
				where: { userId: cookie.value, receiverId: message.receiverId },
			});

			const receiverName = await prisma.user.findUnique({
				where: { id: message.receiverId },
				select: { name: true },
			});

			return {
				...message,
				fakeName: name ? name.fakeName : "???",
				receiverName: receiverName ? receiverName.name : "???",
			};
		})
	);

	return NextResponse.json<MeResponse>({
		ok: true,
		id: data.id,
		avatar: data.avatar,
		name: data.name,
		github: data.github,
		receivedMessagesWithFakeNames,
		sentMessagesWithFakeNames,
	});
}
