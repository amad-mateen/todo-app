/* Amplify Params - DO NOT EDIT
	AUTH_TODOAPPAA33985A_USERPOOLID
	ENV
	REGION
	STORAGE_TODOTABLE_ARN
	STORAGE_TODOTABLE_NAME
	STORAGE_TODOTABLE_STREAMARN
Amplify Params - DO NOT EDIT */const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

// USE THE DYNAMIC NAME FROM ENV VARIABLES
const TABLE_NAME = process.env.STORAGE_TODOTABLE_NAME;

const typeDefs = `#graphql
  type Todo { id: ID! name: String! description: String completed: Boolean! }
  type Query { getTodos: [Todo] }
  type Mutation {
    addTodo(name: String!, description: String): Todo
    toggleTodo(id: ID!): Todo
  }
`;

const resolvers = {
  Query: {
    getTodos: async () => {
      const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      return result.Items || [];
    },
  },
  Mutation: {
    addTodo: async (_, { name, description }) => {
      const newTodo = { id: uuidv4(), name, description: description || "", completed: false };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newTodo }));
      return newTodo;
    },
    toggleTodo: async (_, { id }) => {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET completed = :c',
        ExpressionAttributeValues: { ':c': true },
        ReturnValues: 'ALL_NEW'
      }));
      return result.Attributes;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// This is the CRITICAL fix for Lambda + Apollo 4
let serverStarted = false;
app.use('/graphql', async (req, res, next) => {
  if (!serverStarted) {
    await server.start();
    serverStarted = true;
  }
  return expressMiddleware(server)(req, res, next);
});

module.exports = app;