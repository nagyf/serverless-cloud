import { IKey, Key } from '@aws-cdk/aws-kms';
import { BlockPublicAccess, Bucket, BucketEncryption, IBucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';

export interface SecureBucketProps {
    readonly name: string;
}

export class SecureBucket extends cdk.Construct {
    public readonly bucket: IBucket;
    public readonly encryptionKey: IKey;

    constructor(parent: cdk.Construct, id: string, props: SecureBucketProps) {
        super(parent, id);

        this.encryptionKey = new Key(this, `EncryptionKey-${props.name}`, {
            description: `Encryption key for S3 bucket: ${props.name}`,
            enableKeyRotation: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });

        this.bucket = new Bucket(this, `SecureBucket-${props.name}`, {
            bucketName: props.name,
            removalPolicy: RemovalPolicy.RETAIN,
            versioned: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.KMS,
            encryptionKey: this.encryptionKey,
        });
    }
}
