import { Distribution, IDistribution, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';

export interface WebsiteProps {
    readonly name: string;
}

export class Website extends cdk.Construct {
    public readonly cloudfrontDistribution: IDistribution;

    constructor(parentScope: cdk.Construct, id: string, props: WebsiteProps) {
        super(parentScope, id);

        // Bucket storing the static files for the website
        const websiteBucket = new Bucket(this, `WebsiteBucket-${props.name}`, {
            bucketName: props.name.toLowerCase(),
            removalPolicy: RemovalPolicy.DESTROY,
            publicReadAccess: true,
            versioned: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
        });

        // Deploy static content to the bucket
        new BucketDeployment(this, `WebsiteDeployment${props.name}`, {
            destinationBucket: websiteBucket,
            sources: [
                Source.asset('./website')
            ]
        });

        // CloudFront distribution to host the files
        this.cloudfrontDistribution = new Distribution(this, `Cloudfront-${props.name}`, {
            defaultRootObject: 'index.html',
            enableLogging: true,
            defaultBehavior: {
                origin: new S3Origin(websiteBucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
        });

        // Output the CF URL in the stack
        new CfnOutput(this, 'OutputWebsiteURL', {
            exportName: `${props.name}-WebsiteURL`,
            description: `URL for the website: ${props.name}`,
            value: `https://${this.cloudfrontDistribution.distributionDomainName}`
        });
    }
}
