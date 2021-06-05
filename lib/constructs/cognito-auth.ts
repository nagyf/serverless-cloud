import { IUserPool, IUserPoolClient, Mfa, UserPool, UserPoolClient } from '@aws-cdk/aws-cognito';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';

export interface CognitoAuthProps {
    readonly region: string;
    readonly name: string;
    readonly websiteDomain: string;
}

export class CognitoAuth extends cdk.Construct {
    public readonly redirectLoginURL: string;
    public readonly redirectLogoutURL: string;
    public readonly userPool: IUserPool;
    public readonly authClient: UserPoolClient;
    public readonly authClientSecret: string;
    public readonly loginUrl: string;

    constructor(parentScope: cdk.Construct, id: string, props: CognitoAuthProps) {
        super(parentScope, id);

        this.userPool = new UserPool(this, `UserPool-${props.name}`, {
            removalPolicy: RemovalPolicy.RETAIN,
            userPoolName: `${props.name}-userpool`,
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireSymbols: false,
                requireLowercase: false,
                requireUppercase: false,
            },
            mfa: Mfa.OPTIONAL,
            mfaSecondFactor: {
                otp: true,
                sms: true,
            },
            selfSignUpEnabled: true,
            userInvitation: {
                emailSubject: 'Invite to join our awesome app!',
                emailBody:
                    'Hello {username}, you have been invited to join our awesome app! Your temporary password is {####}',
            },
            userVerification: {
                emailSubject: 'Welcome Please verify your e-mail address',
                emailBody: 'Hello {username}, please verify your e-mail address: {####}',
            },
            signInAliases: {
                email: true,
                username: false,
                phone: false,
            },
        });

        this.userPool.addDomain(`DefaultCognitoDomain${props.name}`, {
            cognitoDomain: {
                domainPrefix: props.name,
            },
        });

        this.redirectLoginURL = `https://${props.websiteDomain}/login`;
        this.redirectLogoutURL = `https://${props.websiteDomain}/logout`;

        this.authClient = this.userPool.addClient(`AuthClient${props.name}`, {
            userPoolClientName: `userpoolclient-${props.name}`,
            generateSecret: true,
            oAuth: {
                callbackUrls: [this.redirectLoginURL],
                logoutUrls: [this.redirectLogoutURL],
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true,
                },
            },
        });

        const describeCognitoUserPoolClient = new AwsCustomResource(this, 'DescribeCognitoUserPoolClient', {
            resourceType: 'Custom::DescribeCognitoUserPoolClient',
            onCreate: {
                region: 'us-east-1',
                service: 'CognitoIdentityServiceProvider',
                action: 'describeUserPoolClient',
                parameters: {
                    UserPoolId: this.userPool.userPoolId,
                    ClientId: this.authClient.userPoolClientId,
                },
                physicalResourceId: PhysicalResourceId.of(this.authClient.userPoolClientId),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });

        this.authClientSecret = describeCognitoUserPoolClient.getResponseField('UserPoolClient.ClientSecret');
        
        this.loginUrl = `https://${props.name}.auth.${props.region}.amazoncognito.com/login?response_type=token&client_id=${this.authClient.userPoolClientId}&redirect_uri=${this.redirectLoginURL}`;

        new CfnOutput(this, 'CognitoLoginURL', {
            exportName: `${props.name}-login-url`,
            description: `Login URL for application: ${props.name}`,
            value: this.loginUrl,
        });
    }
}
