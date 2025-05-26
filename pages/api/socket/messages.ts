import { currentProfile } from "@/lib/current-profile-pages";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { db } from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const profile = await currentProfile(req);
        const { content, fileUrl } = req.body;
        const { serverId, channelId } = req.query as Record<string, string>;

        if (!profile) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!content || !serverId || !channelId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Here you would typically handle the message sending logic,
        // such as saving it to a database or broadcasting it to a WebSocket.

        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: { // Ensure the server exists and the user is a member
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true, // Include members to check if the user is part of the server
            }
        })

        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const channel = await db.channel.findFirst({
            where: {
                id: channelId,
                serverId: serverId, // Ensure the channel belongs to the server
            }
        })

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        const member = server.members.find(m => m.profileId === profile.id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const message = await db.message.create({
            data: {
                content,
                fileUrl: fileUrl || null, // Optional file URL
                channelId: channel.id,
                memberId: member.id, // Associate the message with the member
            },
            include: {
                member: {
                    include: {
                        profile: true, // Include profile information
                    }
                }
            }
        })

        const channelKey = `chat:${channelId}:messages`;
        // Emit the new message to the channel via WebSocket
        res?.socket?.server?.io?.emit(channelKey, message);

        return res.status(200).json(message)
    } catch (error) {
        console.error('[MESSAGES_POST]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}