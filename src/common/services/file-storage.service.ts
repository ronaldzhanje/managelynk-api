import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileStorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET');
    
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('DO_SPACES_ENDPOINT'),
      region: this.configService.get<string>('DO_SPACES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY'),
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET'),
        ...(this.configService.get<string>('DO_SPACES_PASSWORD') && {
          password: this.configService.get<string>('DO_SPACES_PASSWORD')
        })
      },
    });
  }

  async uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: contentType,
      ACL: 'private',
    });

    await this.s3Client.send(command);
    return `${this.configService.get<string>('DO_SPACES_ENDPOINT')}/${filename}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    await this.s3Client.send(command);
  }
} 