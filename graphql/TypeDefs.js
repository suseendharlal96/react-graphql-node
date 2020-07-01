const { gql } = require("apollo-server");

const typeDef = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    likes: [Like]!
    comments: [Comment]!
  }

  type Like {
    id: ID!
    username: String!
    createdAt: String!
  }

  type Comment {
    id: ID!
    username: String!
    body: String!
    createdAt: String!
  }

  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }

  input SignupInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
  }

  type Mutation {
    signup(signupInput: SignupInput): User!
    signin(email: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    postComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }
`;

module.exports = typeDef;
