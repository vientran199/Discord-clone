import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    };
}

const ChannelIdPage = async ({
    params
}: ChannelIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        const { redirectToSignIn } = auth()

        return redirectToSignIn();
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId,
        }
    })

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id,
        }
    })

    if (!channel || !member) {
        return redirect(`/`)
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-[100vh]">
            <ChatHeader
                name={channel.name}
                serverId={channel.serverId}
                type="channel"
            />
            <div className="flex-1">
                {/* Messages will be rendered here */}
                Future Messages
            </div>
            <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                    serverId: channel.serverId,
                    channelId: channel.id,
                }}
            />
        </div>
    );
}

export default ChannelIdPage;  