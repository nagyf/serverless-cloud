import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { ContainerImage } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import { HostedZone, IHostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';

export interface DockerEcsFargateServiceProps {
    readonly name: string;
    readonly directory: string;
    readonly userPoolId: string;
    readonly appClientId: string;
    readonly appClientSecret: string;
    readonly appClientName: string;
    readonly loginRedirectUrl: string;
    readonly cognitoUrl: string;
    readonly certificate: Certificate;
    readonly domain: string;
    readonly domainZone: IHostedZone;
}

export class DockerEcsFargateService extends cdk.Construct {
    readonly service: ApplicationLoadBalancedFargateService;

    constructor(parentScope: cdk.Construct, id: string, props: DockerEcsFargateServiceProps) {
        super(parentScope, id);

        const dockerImageAsset = new DockerImageAsset(this, `${props.name}ImageAsset`, {
            directory: props.directory,
        });

        this.service = new ApplicationLoadBalancedFargateService(this, `${props.name}Service`, {
            serviceName: props.name,
            assignPublicIp: true,
            desiredCount: 1,
            cpu: 256,
            memoryLimitMiB: 512,
            minHealthyPercent: 0,
            certificate: props.certificate,
            domainName: props.domain,
            domainZone: props.domainZone,
            taskImageOptions: {
                containerPort: 8080,
                image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
                environment: {
                    CLIENT_ID: props.appClientId,
                    CLIENT_NAME: props.appClientName,
                    CLIENT_SECRET: props.appClientSecret,
                    REGION: Stack.of(this).region,
                    USER_POOL_ID: props.userPoolId,
                    REDIRECT_URI: props.loginRedirectUrl,
                    COGNITO_URL: props.cognitoUrl
                }
            },
        });

        this.service.targetGroup.configureHealthCheck({
            enabled: true,
            healthyHttpCodes: '200',
            path: '/health',
        });
    }
}
