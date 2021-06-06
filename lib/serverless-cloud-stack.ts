import { Certificate, CertificateValidation } from '@aws-cdk/aws-certificatemanager';
import { ARecord, CnameRecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget, LoadBalancerTarget } from '@aws-cdk/aws-route53-targets';
import { StringParameter } from '@aws-cdk/aws-ssm';
import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import { CognitoAuth } from './constructs/cognito-auth';
import { DockerEcsFargateService } from './constructs/docker-ecs-fargate-service';
import { SecureBucket } from './constructs/secure-bucket';
import { Website } from './constructs/website';

export class ServerlessCloudStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This bucket will store the users' uploaded files
        new SecureBucket(this, 'CloudDataBucket', {
            name: 'serverless-cloud-data',
        });

        const region = Stack.of(this).region;
        const domain = 'serverless-cloud.xyz';

        // These 2 parameters need to be setup before the stack can be deployed
        const hostedZoneId = StringParameter.valueForStringParameter(this, '/serverless-cloud/hosted-zone-id');
        const zoneName = StringParameter.valueForStringParameter(this, '/serverless-cloud/hosted-zone-name');

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, `${domain}HostedZone`, {
            hostedZoneId,
            zoneName
        });

        const certificate = new Certificate(this, `${domain}Certificate`, {
            domainName: `*.${domain}`,
            subjectAlternativeNames: [
                domain
            ],
            validation: CertificateValidation.fromDns(hostedZone),
        });

        // Website to serve the serverless cloud website and other static files
        const website = new Website(this, 'CloudWebsite', {
            name: 'serverless-cloud-website',
            domain,
            certificate
        });

        // Create a DNS record for the website
        new ARecord(this, 'WebsiteAliasRecord', {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(website.cloudfrontDistribution))
        });

        // Cognito for Authenticating and authorizing users to the application
        const authStack = new CognitoAuth(this, 'CognitoAuth', {
            region,
            name: 'serverless-cloud-auth',
            websiteDomain: domain
        });

        const ecsService = new DockerEcsFargateService(this, 'CloudBackend', {
            name: 'cloud-backend',
            directory: './backend/serverless-cloud',
            appClientId: authStack.authClient.userPoolClientId,
            appClientSecret: authStack.authClientSecret,
            appClientName: authStack.authClient.userPoolClientName,
            userPoolId: authStack.userPool.userPoolId,
            loginRedirectUrl: authStack.redirectLoginURL,
            cognitoUrl: authStack.cognitoUrl,
            certificate,
            domain: `api.${domain}`,
            domainZone: hostedZone
        });

        // Create a DNS record for the backend
        new ARecord(this, 'BackendAliasRecord', {
            zone: hostedZone,
            recordName: 'api',
            target: RecordTarget.fromAlias(new LoadBalancerTarget(ecsService.service.loadBalancer))
        });
    }
}
