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

        // Website to serve the serverless cloud website and other static files
        const website = new Website(this, 'CloudWebsite', {
            name: 'serverless-cloud-website',
        });

        // Cognito for Authenticating and authorizing users to the application
        const authStack = new CognitoAuth(this, 'CognitoAuth', {
            region,
            name: 'serverless-cloud-auth',
            websiteDomain: website.cloudfrontDistribution.distributionDomainName,
        });

        new DockerEcsFargateService(this, 'CloudBackend', {
            name: 'cloud-backend',
            directory: './backend/serverless-cloud',
            appClientId: authStack.authClient.userPoolClientId,
            appClientSecret: authStack.authClientSecret,
            appClientName: authStack.authClient.userPoolClientName,
            userPoolId: authStack.userPool.userPoolId,
            loginRedirectUrl: authStack.redirectLoginURL,
            cognitoUrl: authStack.cognitoUrl
        });
    }
}
