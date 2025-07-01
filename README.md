# Options Tracker Backend

The **Options Tracker Backend** is a serverless TypeScript API built on AWS Lambda, API Gateway, and Cognito. It currently supports **user authentication** (signup and login), and will grow to support **options tracking**, and **analytics**.

This guide helps developers set up and run the backend locally.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [POST /api/register](#register-user)
  - [POST /api/login](#login-user)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Getting Started

### 1. Clone the Repo

\`\`\`bash
git clone https://github.com/kzaw28/options-tracker-backend.git
cd options-tracker-backend
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Create a `.env` file in the root folder and add:

\`\`\`
AWS_ACCOUNT_ID=your--id
AWS_REGION=us-east-2
\`\`\`

(Refer to `.env.example` for the full list.)

---

## Environment Variables

| Variable             | Description                              |
|----------------------|------------------------------------------|
| \`AWS_ACCOUNT_ID\`| Your AWS Account ID          |
| \`AWS_REGION\`         | AWS region (e.g. \`us-east-1\`)            |

Optional (for future use):

| \`SNS_TOPIC_NAME\`, \`NODE_ENV\` |

---

## API Endpoints

### Register User

\`POST /api/auth/register\`

Registers a new user in Cognito.

#### Request

\`\`\`json
{
  "username": "user@example.com",
  "password": "securepassword",
  "email": "user@example.com"
}
\`\`\`

#### Success Response

\`\`\`json
{
  "message": "User created"
}
\`\`\`

#### Error Responses

- 400 – Missing fields or user exists
- 500 – Internal error

---

### Login User

\`POST /api/auth/login\`

Authenticates a user via Cognito and returns tokens.

#### Request

\`\`\`json
{
  "username": "user@example.com",
  "password": "securepassword"
}
\`\`\`

#### Success Response

\`\`\`json
{
  "tokens": {
    "AccessToken": "...",
    "IdToken": "...",
    "RefreshToken": "..."
  }
}
\`\`\`

#### Error Responses

- 400 – Missing credentials  
- 401 – Invalid credentials  
- 500 – Internal error  

---

## Testing

We use [Jest](https://jestjs.io/) for unit testing.

To run tests:

\`\`\`bash
npm test
\`\`\`

Example test files:  
- \`routes/__tests__/login.test.ts\`  
- \`routes/__tests__/register.test.ts\`

---

## Deployment

We use AWS CDK to deploy the backend.

### Deploy with CDK

\`\`\`bash
npm run build
cdk deploy --all
\`\`\`

Ensure you have your AWS CLI configured through [bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).

---

## Troubleshooting

- Make sure \`.env\` has correct values.
- Double-check your AWS credentials.
- Use \`sam logs\` or CloudWatch for debugging Lambda errors.
- If using SAM CLI, Docker must be running.

---

For questions, open an issue or reach out!