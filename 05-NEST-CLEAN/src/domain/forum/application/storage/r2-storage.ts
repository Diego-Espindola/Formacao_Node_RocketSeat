import { EnvService } from "@/infra/env/env.service";
import { Uploader, UploadParams } from "./uploader";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export class R2Storage implements Uploader {
    private client: S3Client

    constructor(
        private envService: EnvService,
    ) {
        const accountId = this.envService.get("CLOUDFARE_ACCOUNT_ID");
        this.client = new S3Client({
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            region: "auto",
            credentials: {
                accessKeyId: this.envService.get("AWS_ACCESS_KEY_ID"),
                secretAccessKey: this.envService.get("AWS_SECRET_ACCESS_KEY"),
            }
        });
    }
    
    async upload({
        fileName,
        fileType,
        body
    }: UploadParams): Promise<{ url: string; }> {
        const uploadId = randomUUID()
        const uniqueFileName = `${uploadId}-${fileName}`

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.envService.get('AWS_BUCKET_NAME'),
                Key: uniqueFileName,
                ContentType: fileType,
                Body: body,
            }),
        )

        return {
            url: uniqueFileName,
        }
    }

}