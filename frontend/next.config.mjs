/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        allowedDevOrigins: [
            "localhost:3000",
            "192.168.207.1:3000"
        ],
    },
};

export default nextConfig;
