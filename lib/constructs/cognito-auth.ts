import { IUserPool, IUserPoolClient, Mfa, UserPool } from '@aws-cdk/aws-cognito';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';

export interface CognitoAuthProps {
    readonly name: string;
    readonly websiteDomain: string;
}

export class CognitoAuth extends cdk.Construct {
    public readonly userPool: IUserPool;
    public readonly authClient: IUserPoolClient;

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
                domainPrefix: props.name
            }
        });

        this.authClient = this.userPool.addClient(`AuthClient${props.name}`, {
            generateSecret: false,
            oAuth: {
                callbackUrls: [`https://${props.websiteDomain}/`],
                logoutUrls: [`https://${props.websiteDomain}/logout`],
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true,
                },
            },
        });

        new CfnOutput(this, 'CognitoLoginURL', {
            exportName: `${props.name}-login-url`,
            description: `Login URL for application: ${props.name}`,
            value: `https://${props.name}.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=${this.authClient.userPoolClientId}&redirect_uri=https://${props.websiteDomain}/`
        });
    }
}
