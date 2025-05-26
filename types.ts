import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & { profile: Profile })[]
};


// Compare this snippet from pages/api/socket/io.ts:
export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: ServerIO;
        }
    }
}