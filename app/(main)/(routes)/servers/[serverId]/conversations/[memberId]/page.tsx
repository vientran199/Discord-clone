import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";

interface MemberIdPageProps {
    params: {
        serverId: string;
        memberId: string;
    };
}

const MemberIdPage = async ({
    params
}: MemberIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        const { redirectToSignIn } = auth()

        return redirectToSignIn();
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    });

    if (!currentMember) {
        return redirect('/')
    }

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId);

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;


    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={params.serverId}
                type="conversation"
            />
        </div>
    );
}

export default MemberIdPage;