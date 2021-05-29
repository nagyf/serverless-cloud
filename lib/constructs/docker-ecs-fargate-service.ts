import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { ContainerImage } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import * as cdk from '@aws-cdk/core';

export interface DockerEcsFargateServiceProps {
    readonly name: string;
    readonly directory: string;
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
            taskImageOptions: {
                containerPort: 8080,
                image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
            },
        });
    }
}
