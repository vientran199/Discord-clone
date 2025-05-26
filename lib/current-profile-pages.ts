import { NextApiRequest } from 'next';
import { getAuth } from '@clerk/nextjs/server'

import { db } from "@/lib/db"

// Function to get the current profile based on the request
// and user authentication
// This function can be used in pages folder
export const currentProfile = async (req: NextApiRequest) => {
    const { userId } = await getAuth(req);

    if (!userId) {
        return null
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: userId
        }
    })

    return profile;
}