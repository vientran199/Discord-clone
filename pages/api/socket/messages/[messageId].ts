import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    if (req.method !== 'PATCH' && req.method !== 'DELETE') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const profile = await currentProfile(req);
        const { messageId, serverId, channelId } = req.query;
        const { content } = req.body;

        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!serverId) {
            return res.status(400).json({ error: "Server ID missing" });
        }

        if (!channelId) {
            return res.status(400).json({ error: "Channel ID missing" });
        }

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        })

        if (!server) {
            return res.status(400).json({ error: "Server not found" });
        }


        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: server.id
            }
        })

        if (!channel) {
            return res.status(400).json({ error: "Channel not found" });
        }

        const member = server.members.find(m => m.profileId === profile.id);

        if (!member) {
            return res.status(403).json({ error: "Forbidden" });
        }

        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channel.id
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                },
            }
        })

        if (!message || message.deleted) {
            return res.status(404).json({ error: "Not Found" });
        }

        const isMessageOwner = member.id === message.memberId;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) {
            return res.status(403).json({ error: "Forbidden" });
        }

        if (req.method === 'DELETE') {
            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    fileUrl: null,
                    content: "this message has been deleted",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }

                    }
                }
            })
        }

        if (req.method === 'PATCH') {
            if (!isMessageOwner) {
                return res.status(403).json({ error: "Forbidden" });
            }

            message = await db.message.update({
                where: {
                    id: messageId as string
                },
                data: {
                    content: content,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }

                    }
                }
            })
        }

        const updateKey = `chat:${channelId}:message:update`;
        res?.socket?.server?.io?.emit(updateKey, message);

        return res.status(200).json(message);
    } catch (error) {
        console.log("[MESSAGES_ERROR]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
