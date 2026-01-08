import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const getSwaggerOptions = (port: number): swaggerJsdoc.Options => {
    // If PUBLIC_URL is explicitly set (e.g. for production https), use it.
    // Otherwise fallback to local development style.
    const publicUrl = process.env.PUBLIC_URL;
    const serverUrl = publicUrl ? publicUrl : '/';

    return {
    definition: {
        openapi: '3.0.0',
        info: {
        title: 'Task Flow API',
        version: '1.0.0',
        description: `
    # Task Flow API Documentation

    Welcome to the **Task Flow API**! This API powers the Task Flow application, enabling you to manage tasks, teams, and collaborations efficiently.

    ## 🚀 Getting Started

    Follow these steps to start using the API:

    ### 1. **Register a New User**
    - Use the **\`POST /api/auth/register\`** endpoint to create an account.
    - Required fields: \`username\`, \`email\`, \`password\`.
    - You will receive a JWT \`token\` in the response.

    ### 2. **Login**
    - If you already have an account, use **\`POST /api/auth/login\`**.
    - Provide your \`username\` and \`password\`.
    - Copy the \`token\` from the response.

    ### 3. **Authenticate Requests**
    - Click the green **Authorize** button at the top right of this page.
    - Enter your token in the box.
    - Click **Authorize** to save it.
    - Now you can test protected endpoints like \`GET /api/tasks\`!

    ### 4. **Explore Modules**
    - **Tasks**: Create, update, and track tasks with subtasks and tags.
    - **Teams**: Collaborate by creating teams and adding members.
    - **Notifications**: Stay updated with real-time alerts.
        `,
        },
        servers: [
        {
            url: serverUrl,
            description: publicUrl ? 'Public API Server' : 'Local API Server',
        },
        ],
        components: {
        securitySchemes: {
            bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            },
        },
        },
        security: [
        {
            bearerAuth: [],
        },
        ],
    },
    apis: ['./src/routes/*.ts', './src/schemas/*.ts'],
    };
};

export const setupSwagger = (app: Express, port: number) => {
  const options = getSwaggerOptions(port);
  const swaggerSpec = swaggerJsdoc(options);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
};
