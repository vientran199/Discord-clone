import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {

    try {
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (!params.serverId) {
            return new NextResponse('Server ID Missing', { status: 400 })
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: {
                    not: profile.id, //If user is admin, they can not leave server
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id,
                    }
                }
            }
        });

        return NextResponse.json(server)
    } catch (error) {
        console.log("[LEAVE_ID]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}