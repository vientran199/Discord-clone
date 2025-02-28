/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "k5rddzuw5z.ufs.sh" //config to fix invalid src prop on `next/image`
        ]
    }
}

module.exports = nextConfig
