/**
 * Cognito client utility functions for user authentication and registration.
 * 
 * This module provides helper functions to interact with AWS Cognito for:
 *  - Registering new users (`registerUser`)
 *  - Authenticating users and retrieving tokens (`loginUser`)
 * 
 * These functions are used by the `login.ts` and `register.ts` Lambda route handlers.
 */


import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

/** 
 * Params for registering a user 
 */
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  clientId: string;
}

/**
 * Registers a new user in Cognito
 */
export async function registerUser({
  username,
  password,
  email,
  clientId,
}: RegisterParams): Promise<void> {
  const cmd = new SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  });
  await cognito.send(cmd);
}

/** 
 * Params for logging in 
 */
export interface LoginParams {
  username: string;
  password: string;
  clientId: string;
}

/**
 * Authenticates a user and returns tokens
 */
export async function loginUser({
  username,
  password,
  clientId,
}: LoginParams): Promise<AuthenticationResultType | undefined> {
  const cmd = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });
  const response = await cognito.send(cmd);
  return response.AuthenticationResult;
}
