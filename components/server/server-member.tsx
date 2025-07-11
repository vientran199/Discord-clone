"use client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { UserAvatar } from "@/components/user-avatar";

interface ServerMemberProps {
    member: Member & { profile: Profile }
    server: Server;
}

const iconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
}

export const ServerMember = ({
    member,
    server,
}: ServerMemberProps) => {
    const params = useParams();
    const router = useRouter();

    const icon = iconMap[member.role];

    const onClick = () => {
        router.push(`/servers/${server.id}/conversations/${member.id}`);
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/1- dark:hover:bg-zinc-700/50 transition mb-1",
                params?.memberId === member.id && "bg-zinc-700/2 bark:bg-zinc-700"
            )}
        >
            <UserAvatar
                src={member.profile.imageUrl}
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p
                className={cn(
                    "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                    params?.memberId === member.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
                )}
            >
                {member.profile.name}
            </p>
            {icon}
        </button>
    )

}