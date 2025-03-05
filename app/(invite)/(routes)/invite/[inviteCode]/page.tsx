import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";

interface InviteCodePageProps {
    params: {
        inviteCode: string
    }
}

const InviteCodePage = async ({
    params,
}: InviteCodePageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        const { redirectToSignIn } = auth();
        return redirectToSignIn()
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    //Check current user's invite code
    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`)
    }

    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode
        }, data: {
            members: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }
    })

    if (server) {
        return redirect(`/servers/${server.id}`)
    }

    return (
        <div>

        </div>
    )
}

export default InviteCodePage;