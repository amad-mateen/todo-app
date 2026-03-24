import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import awsExports from './aws-exports';

// Note: Ensure your API was created as a REST/Custom logic 
// If this line errors, check the key name in your aws-exports.js
const apiEndpoint = awsExports.aws_cloud_logic_custom[0].endpoint;

const client = new ApolloClient({
  // Adding /graphql to match your Express routing
  link: createHttpLink({ uri: `${apiEndpoint}/graphql` }), 
  cache: new InMemoryCache(),
});

export default client;