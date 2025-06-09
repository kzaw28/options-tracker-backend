#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import { OptionsTrackerBackendStack } from '../lib/options-tracker-backend-stack';

import { IamRoleStack } from '../lib/iam_stack';
import { LambdaStack } from '../lib/function_stack';
import { AuthStack } from '../lib/auth_stack';
import { ApiStack } from '../lib/api_stack';

// new OptionsTrackerBackendStack(app, 'OptionsTrackerBackendStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });


const createStacks = async () => {
  try {
    const app = new cdk.App();

    const iamRoleStack = new IamRoleStack(app, 'IamRoleStack');
    const lambdaStack = new LambdaStack(app, 'LambdaStack', {
      lambdaRole: iamRoleStack.lambdaRole
    });
    const authStack = new AuthStack(app, 'AuthStack');
    new ApiStack(app, 'ApiStack', {
      lambdaIntegration: lambdaStack.lambdaIntegration,
      userPool: authStack.userPool,
      scopeResourceName: authStack.scopeResourceName
    });
  
    app.synth();
    return "Stacks created successfully!";
  } catch (error) {
    return error;
  }
}


// init 
createStacks()
  .then(message => console.log(message))
  .catch(error => console.error(error))