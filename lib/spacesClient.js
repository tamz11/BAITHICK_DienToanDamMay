import { S3Client } from "@aws-sdk/client-s3";

// Khởi tạo S3 Client kết nối tới DigitalOcean Spaces dựa trên thông tin file .env của bạn
export const spacesClient = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT, // https://sgp1.digitaloceanspaces.com
    region: process.env.DO_SPACES_REGION,    // sgp1
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
    },
});