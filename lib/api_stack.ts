import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
    AuthorizationType,
    CognitoUserPoolsAuthorizer,
    Cors,
    LambdaIntegration,
    MethodOptions,
    ResourceOptions,
    RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { globals } from "./globals";

interface ApiStackProps extends StackProps {
    lambdaIntegration: LambdaIntegration;
    userPool: IUserPool;
    scopeResourceName: string;
}


export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, "OptionsTrackerRestApi", {
            restApiName: "Options-Tracker-API",
            description: "API for Options Tracker application",
            deployOptions: {
                stageName: globals.environment,
                throttlingBurstLimit: 20,
                throttlingRateLimit: 10,
            },

        })

        // Cognito Authorizer for protected routes -------------------------------
        const authorizer = new CognitoUserPoolsAuthorizer(this, "CognitoRestApiAuthorizer", {
            cognitoUserPools: [props.userPool],
            identitySource: "method.request.header.Authorization",
        });
        authorizer._attachToApi(api); // Attach the authorizer to the API

        // Cognito Options --------------------------------
        // Method options for PROTECTED routes
        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId,
            },
            // authorizationScopes: [
            //     //IMPORTANT! Must match server scopes in AuthStack!
            //     `${globals.environment}/${props.scopeResourceName}`
            // ]
        }

        // Method options for UNPROTECTED routes
        const optionsWithNoAuth: MethodOptions = {
            authorizationType: AuthorizationType.NONE,
        }

        // CORS Options for all resources
        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: Cors.DEFAULT_HEADERS.concat(["Authorization", "Content-Type"]),
            },
        }

        // API ENDPOINTS --------------------------------

        // Create a root resource (/api)
        const apiResource = api.root.addResource("api", optionsWithCors);

    
        // Public Endpoints --------------------------------
        const authResource = apiResource.addResource("auth")

        const registerResource = authResource.addResource("register")
        registerResource.addMethod("POST", props.lambdaIntegration, optionsWithNoAuth); // POST /api/auth/register

        const loginResource = authResource.addResource("login");
        loginResource.addMethod("POST", props.lambdaIntegration, optionsWithNoAuth); // POST /api/auth/login

        // Protected Endpoints --------------------------------
        const optionsResource = apiResource.addResource("options");
        optionsResource.addProxy({
            defaultIntegration: props.lambdaIntegration,
            defaultMethodOptions: optionsWithAuth, // Use the authorizer for all methods
        })

        optionsResource.addMethod("POST", props.lambdaIntegration, optionsWithAuth); // POST /api/options


        // const root = api.root.addResource(props.scopeResourceName, optionsWithCors); 

        // root.addMethod("GET", props.lambdaIntegration, optionsWithAuth); // GET
        // // Add OPTIONS method for CORS preflight
        // root.addMethod("OPTIONS", props.lambdaIntegration, {
        //     authorizationType: AuthorizationType.NONE, // OPTIONS should not require auth
        // });


        // Outputs --------------------------------
        new CfnOutput(this, "ApiEndpoint", {
            value: api.url,
            description: "The endpoint of the API Gateway",
        });

        new CfnOutput(this, "ApiFullUrl", {
            value: `${api.url}api`,
            description: "Full API endpoint URL",
        });
    }
}