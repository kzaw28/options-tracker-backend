
import { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock(
    "@aws-sdk/client-cognito-identity-provider",
    () => ({
        CognitoIdentityProviderClient: jest.fn(() => ({ send: mockSend })),
        SignUpCommand: jest.fn(),
    })
);

import { handler } from "../register";
process.env.USER_POOL_CLIENT_ID = "test-client-id";

describe("Register Handler", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("returns 201 when SignUpCommand succeeds", async () => {
    // Arrange
    mockSend.mockResolvedValueOnce({});

    const event = {
      body: JSON.stringify({
        username: "testuser",
        password: "P@ssword!",
        email: "testuser@example.com",
      }),
    } as APIGatewayProxyEvent;

    // Act
    const response = await handler(event);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: "User created" });

    // Verify the command was built with correct params
    const { SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
    expect(SignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: "testuser",
        Password: "P@ssword!",
        UserAttributes: [{ Name: "email", Value: "testuser@example.com" }],
    });

    // And client.send() was called once
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when user already exists", async () => {
    // Arrange
    const err = Object.assign(new Error("User already exists"), {
      name: "UsernameExistsException",
    });
    mockSend.mockRejectedValueOnce(err);

    const event = {
      body: JSON.stringify({
        username: "existing",
        password: "pass123!",
        email: "exists@example.com",
      }),
    } as APIGatewayProxyEvent;

    // Act
    const response = await handler(event);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "User already exists" });
  });

  it("returns 500 when event.body is invalid JSON", async () => {
    const event = { body: "not-json" } as APIGatewayProxyEvent;

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.message).toBe("Registration failed");
    expect(body.error).toMatch(/Unexpected token/);
  });

  it("returns 500 if USER_POOL_CLIENT_ID not set", async () => {
    delete process.env.USER_POOL_CLIENT_ID;

    const event = {
      body: JSON.stringify({
        username: "foo",
        password: "bar",
        email: "foo@bar.com",
      }),
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Server configuration error: USER_POOL_CLIENT_ID is not set" });
  });

  it("returns 500 on other unexpected errors", async () => {
    // Simulate some other error
    mockSend.mockRejectedValueOnce(new Error("Something broke"));

    process.env.USER_POOL_CLIENT_ID = "test-client-id";

    const event = {
      body: JSON.stringify({
        username: "foo",
        password: "bar",
        email: "foo@bar.com",
      }),
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Registration failed", error: "Something broke"});
  });
});
