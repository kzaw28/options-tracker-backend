// ./lin/auth_stack.ts
// This class defines the Cognito stack.

import { CfnOutput, Stack, StackProps, Duration } from 'aws-cdk-lib';
import { ResourceServerScope, UserPool, UserPoolResourceServer, CfnUserPoolGroup, OAuthScope } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { globals } from './globals';

export class AuthStack extends Stack {
    // Public properties 
    public userPool: UserPool;
    public scopeResourceName: string;
    // Constructor
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create a Cognito User Pool ------------------------------
        this.userPool = new UserPool(this, "UserPool", {
            selfSignUpEnabled: true,
            signInAliases: {
                email: true, // Allow users to sign in with their email
                phone: false,
                username: true
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
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
        // CfnOutput makes the User Pool ID available in the CloudFormation outputs
        // e.g. AuthStack.UserPoolId = us-east-1_abcdefgh

        new CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            description: 'The ID of the Cognito User Pool',
        });

        // Domain for the User Pool ------------------------------
        this.userPool.addDomain('UserPoolDomain', {
            cognitoDomain: {
                domainPrefix: 'options-user-pool',
            },
        })
        new CfnOutput(this, "UserPoolDomain", {
            value: this.userPool.userPoolProviderUrl,
        });

        //  User Pool Groups ------------------------------
        new CfnUserPoolGroup(this, "AdminPoolGroup", {
            userPoolId: this.userPool.userPoolId,
            groupName: "admin",
        });
        new CfnUserPoolGroup(this, "UserPoolGroup", {
            userPoolId: this.userPool.userPoolId,
            groupName: "user",
        });

        // Scope Resource for API Gateway ------------------------------
        // This is the custom scope of the resource server (Basically the API client's permissions)
        const apiServerScope = new ResourceServerScope({
            scopeName: "api",
            scopeDescription: "Access to the Options Tracker API"
        })

        this.scopeResourceName = apiServerScope.scopeName;

        // Resource Server for the User Pool ------------------------------
        const resourceServer = new UserPoolResourceServer(this, "ClientCredentialsResourceServer", {
            identifier: globals.environment,
            userPool: this.userPool,
            scopes: [apiServerScope],
        })
        /**
         * Important: Matches up with MethodOptions.authorizationScopes in API Gateway stack
         */

        // // App Client for the User Pool ------------------------------
        // this.userPool.addClient("UserPoolClient", {
        //     generateSecret: true, // Used for confidential clients (backend services) 
        //     enableTokenRevocation: true,  
        //     accessTokenValidity: Duration.hours(1),
        //     idTokenValidity: Duration.hours(1),
        //     // oAuth: {
        //     //     flows: {
        //     //         clientCredentials: true, // Enable client credentials flow
        //     //     },
        //     //     scopes: [
        //     //         OAuthScope.resourceServer(resourceServer, apiServerScope), // Add the custom scope
        //     //     ],
        //     // },
        //     // Enable the following auth flows
        //     // This allows the user to authenticate using username and password, SRP, or custom auth
        //     authFlows: {
        //         adminUserPassword: true,
        //         userPassword: true,
        //         userSrp: true,
        //         custom: true,
        //     }
        // })
        // App Client for User Authentication ------------------------------
        
        const userPoolClient = this.userPool.addClient("UserPoolClient", {
            generateSecret: false, // No secret needed for user auth flows
            enableTokenRevocation: true,  
            accessTokenValidity: Duration.hours(1),
            idTokenValidity: Duration.hours(1),
            authFlows: {
                adminUserPassword: true, // Allows admin to authenticate users
                userPassword: true,      // Direct username/password login
                userSrp: true,          // Secure Remote Password protocol
                custom: true,
            }
        });

        new CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'User Pool Client ID for authentication',
        });
    }
}