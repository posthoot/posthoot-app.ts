import { createSwaggerSpec } from "next-swagger-doc";
import type { OpenAPIV3 } from "openapi-types";

const apiConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "kori 🦆 API Documentation",
    version: "1.0.0",
    description:
      "API documentation for kori 🦆 - Enterprise Email Orchestration Platform",
    contact: {
      name: "API Support",
      email: "me@iamharsh.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
  tags: [
    {
      name: "Team",
      description: "Team management endpoints",
    },
    {
      name: "Email",
      description: "Email orchestration endpoints",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {},
};

export const getApiDocs = () => {
  return createSwaggerSpec({
    // @ts-expect-error - TODO: Fix this
    definition: apiConfig as OpenAPIV3.Document & {
      paths: OpenAPIV3.PathsObject;
    },
    apiFolder: "app",
  });
};
