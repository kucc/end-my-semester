import { prisma } from "@/app/_clients/prisma";
import { DefaultResponse } from "@/app/_libs/response";
import { NextRequest, NextResponse } from "next/server";

export type ChatResponse = DefaultResponse;

export async function POST(request: NextRequest) {
	// XXX
	const cookie = request.cookies.get("supabase-user-id");
	const { searchParams } = new URL(request.url);
	const publicId = searchParams.get("publicId");

	if (!publicId) {
		return new Response("No publicId", { status: 401 });
	}

	const json = await request.json();

	const { body, isPublic, fakeName } = json;

	if (!body) {
		return new Response("No body", { status: 401 });
	}

	if (!cookie) {
		return new Response("No cookie", { status: 401 });
	}

	let fakeNameFound = await prisma.fakeName.findFirst({
		where: { userId: cookie.value, receiverId: publicId },
	});

	if (!fakeNameFound) {
		fakeNameFound = await prisma.fakeName.create({
			data: {
				fakeName,
				userId: cookie.value,
				receiverId: publicId,
			},
		});
	}

	await prisma.message.create({
		data: {
			body,
			public: isPublic,
			senderId: cookie.value,
			receiverId: publicId,
		},
	});

	return NextResponse.json<ChatResponse>({ ok: true });
}
