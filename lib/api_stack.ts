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
            binaryMediaTypes: ["*/*"],
            deployOptions: {
                stageName: globals.environment,
                throttlingBurstLimit: 20,
                throttlingRateLimit: 10,
            },

        })

        // Cognito Authorizer  -------------------------------
        const authorizer = new CognitoUserPoolsAuthorizer(this, "CognitoRestApiAuthorizer", {
            cognitoUserPools: [props.userPool],
            identitySource: "method.request.header.Authorization",
        });
        authorizer._attachToApi(api); // Attach the authorizer to the API

        // Cognito Options --------------------------------
        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId,
            },
            authorizationScopes: [
                //IMPORTANT! Must match server scopes in AuthStack!
                `${globals.environment}/${props.scopeResourceName}`
            ]
        }

        // CORS Options
        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
            },
        }

        // API ENDPOINTS --------------------------------
        // Create a root resource
        const resource = api.root.addResource(props.scopeResourceName, optionsWithCors); // e.g. /options
        resource.addMethod("GET", props.lambdaIntegration, optionsWithAuth); // GET
        // resource.addMethod("POST", props.lambdaIntegration, optionsWithAuth); // POST
        new CfnOutput(this, "ApiEndpoint", {
            value: api.url,
            description: "The endpoint of the API Gateway",
        });
    }
}