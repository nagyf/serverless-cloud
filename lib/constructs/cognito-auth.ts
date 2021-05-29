import { IUserPool, IUserPoolClient, Mfa, UserPool } from '@aws-cdk/aws-cognito';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';

export interface CognitoAuthProps {
    readonly region: string;
    readonly name: string;
    readonly websiteDomain: string;
}

export class CognitoAuth extends cdk.Construct {
    public readonly userPool: IUserPool;
    public readonly authClient: IUserPoolClient;
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

        const redirectLoginURL = `https://${props.websiteDomain}/login`;
        const redirectLogoutURL = `https://${props.websiteDomain}/logout`;

        this.authClient = this.userPool.addClient(`AuthClient${props.name}`, {
            generateSecret: false,
            oAuth: {
                callbackUrls: [redirectLoginURL],
                logoutUrls: [redirectLogoutURL],
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true,
                },
            },
        });

        this.loginUrl = `https://${props.name}.auth.${props.region}.amazoncognito.com/login?response_type=token&client_id=${this.authClient.userPoolClientId}&redirect_uri=${redirectLoginURL}`;

        new CfnOutput(this, 'CognitoLoginURL', {
            exportName: `${props.name}-login-url`,
            description: `Login URL for application: ${props.name}`,
            value: this.loginUrl,
        });
    }
}
