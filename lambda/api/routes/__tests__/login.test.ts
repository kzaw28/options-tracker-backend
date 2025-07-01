// login.test.ts
import { APIGatewayProxyEvent } from 'aws-lambda';

const mockSend = jest.fn();
jest.mock(
    '@aws-sdk/client-cognito-identity-provider',
    () => {
        return {
            CognitoIdentityProviderClient: jest.fn(() => ({
                send: mockSend,
            })),
            InitiateAuthCommand: jest.fn(), // we don't need its implementation
        };
    }
);

import { handler } from '../login'; // Move this import after mock to ensure the mock is set up first
process.env.USER_POOL_CLIENT_ID = 'test-client-id';

describe('Login Handler', () => {
    beforeEach(() => {
        mockSend.mockClear();
    });

    it('returns 200 with tokens when send(cmd) resolves', async () => {
        // Arrange
        const fakeAuthResult = {
            AccessToken: 'access123',
            IdToken: 'id456',
            RefreshToken: 'refresh789',
            ExpiresIn: 3600,
            TokenType: 'Bearer',
        };
        // Simulate client.send()
        mockSend.mockResolvedValueOnce({ AuthenticationResult: fakeAuthResult });

        const event = {
            body: JSON.stringify({ username: 'alice', password: 'P@ssword1' }),
        } as APIGatewayProxyEvent;

        // Act
        const response = await handler(event);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ tokens: fakeAuthResult });

        // Check that we constructed the InitiateAuthCommand correctly
        const { InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
        expect(InitiateAuthCommand).toHaveBeenCalledWith({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: 'test-client-id',
            AuthParameters: {
                USERNAME: 'alice',
                PASSWORD: 'P@ssword1',
        },
        });
        // And that client.send() was invoked once
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('returns 401 when AuthenticationResult is undefined', async () => {
        mockSend.mockResolvedValueOnce({}); // no AuthenticationResult

        const event = {
            body: JSON.stringify({ username: 'alice', password: 'P@ssword1' }),
        } as APIGatewayProxyEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toEqual({ message: 'Invalid username or password' });
    });

    it('returns 400 if body JSON is invalid', async () => {
        const event = { body: 'not-json' } as APIGatewayProxyEvent;
        const response = await handler(event);
        const parsed = JSON.parse(response.body);

        expect(response.statusCode).toBe(500);
        expect(parsed.message).toBe('Login failed');
        expect(parsed.error).toMatch(/Unexpected token/);
    });

    it('returns 500 when send() throws unexpectedly', async () => {
        mockSend.mockRejectedValueOnce(new Error('Network down'));
        
        const event = {
            body: JSON.stringify({ username: 'alice', password: 'P@ssword1' }),
        } as APIGatewayProxyEvent;

        const response = await handler(event);
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({ message: 'Login failed', error: 'Network down'});
    });

    it('returns 500 if clientId is not set', async () => {
        delete process.env.USER_POOL_CLIENT_ID;
        const event = {
            body: JSON.stringify({ username: 'alice', password: 'P@ssword1' }),
        } as APIGatewayProxyEvent;

        const response = await handler(event);
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({ message: 'Server configuration error: USER_POOL_CLIENT_ID is not set' });
    });
});
