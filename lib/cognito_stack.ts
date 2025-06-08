import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, "UserPool", {
            // --- Core User Pool Configuration ---
            userPoolName: "options-tracker-user-pool",
            selfSignUpEnabled: true,
            signInAliases: {
                username: false, // Disable username sign-in
                email: true,
                phone: false 
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            mfa: cognito.Mfa.OPTIONAL,
            mfaMessage: "Your verification code is {####}",
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            // --- Standard Attributes ---
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
                givenName: {
                    required: false,
                    mutable: true,
                },
                
            }
        
        })

    };

}