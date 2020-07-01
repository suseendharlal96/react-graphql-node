const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const typeDef = require("./graphql/TypeDefs");
const resolvers = require("./graphql/resolvers");
const { MONGODB } = require("./config");

const PORT = process.env.port || 5000;

const server = new ApolloServer({
  typeDefs: typeDef,
  resolvers,
  context: ({ req }) => ({ req }),
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("connected");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`running ${res}-${res.url}`);
  })
  .catch((err) => console.log(err));
