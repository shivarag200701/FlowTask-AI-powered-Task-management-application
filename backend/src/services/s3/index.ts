import dotenv from "dotenv";
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

dotenv.config();

type BucketType = "public" | "private";

const bucketName = process.env.BUCKET_NAME || "";
const awsRegion = process.env.AWS_REGION || "";
const accessKey = process.env.ACCESS_KEY || "";
const secretAccessKey = process.env.SECRET_ACCESS_KEY || "";

class StorageClient {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
      },
      region: awsRegion,
    });
  }

  async upload({
    bucketType = "public",
    key,
    body,
    contentType,
  }: {
    bucketType?: "public" | "private";
    key: string;
    body: string | Blob | Buffer;
    contentType: string;
  }) {
    const bucket = this._getBucketName(bucketType);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    try {
      //add logging
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      if (error instanceof S3ServiceException) {
        throw new Error(`AWS S3 error ${error.name} - ${error.message}`);
      } else {
        throw new Error(`error while adding object to S3 ${error}`);
      }
    }
  }

  private _getBucketName(bucketType: BucketType) {
    if (bucketType === "public") {
      const bucketName = process.env.STORAGE_PUBLIC_BUCKET;
      if (!bucketName) {
        throw new Error("STORAGE_PUBLIC_BUCKET is not set");
      }

      return bucketName;
    } else if (bucketType === "private") {
      const bucketName = process.env.STORAGE_PRIVATE_BUCKET;
      if (!bucketName) {
        throw new Error("STORAGE_PRIVATE_BUCKET is not set");
      }

      return bucketName;
    } else {
      throw new Error(`Invalid bucket type: ${bucketType}`);
    }
  }
}

export const S3 = new StorageClient();
