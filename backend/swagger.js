import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Messenger API',
    description: 'API документація',
  },
  host: 'localhost:5000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Bearer token'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);