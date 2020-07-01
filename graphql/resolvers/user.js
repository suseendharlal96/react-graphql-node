const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");
const {
  validateSignupInput,
  validateSigninInput,
} = require("../../util/validation");
const User = require("../../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = {
  Mutation: {
    async signin(_, { email, password }) {
      const { errors, isValid } = validateSigninInput(email, password);
      if (!isValid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ email });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    async signup(
      _,
      { signupInput: { email, username, password, confirmPassword } },
      context,
      info
    ) {
      // validate inputs
      const { errors, isValid } = validateSignupInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!isValid) {
        throw new UserInputError("Errors", { errors });
      }
      // make sure username doesnt exist already
      const user = await User.findOne({ username });
      const useremail = await User.findOne({ email });
      if (user || useremail) {
        if (user) {
          throw new UserInputError("Username already taken", {
            errors: {
              username: "Username already taken",
            },
          });
        }
        if (useremail) {
          throw new UserInputError("Email already taken", {
            errors: {
              email: "Email already taken",
            },
          });
        }
      }
      // attach a token after successful signup
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      const result = await newUser.save();
      const token = generateToken(result);
      return {
        ...result._doc,
        id: result._id,
        token,
      };
    },
  },
};
