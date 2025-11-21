/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['tap2sos-backend-dd-8bd70d25feb3.herokuapp.com',"storage.googleapis.com","wajba-bucket.s3.us-east-2.amazonaws.com",]
      },
      output: "standalone",
};

export default nextConfig;
