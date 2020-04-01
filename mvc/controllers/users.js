const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const registerUser = function({ body }, res) {
  if (
    !body.first_name ||
    !body.last_name ||
    !body.password ||
    !body.email ||
    !body.password_confirm
  ) {
    return res.send({ message: "All fields are required." });
  }

  if (body.passport !== body.passport_confirm) {
    return res.send({ message: "Passwords don't match." });
  }

  const user = new User();

  // user.firstname = body.first_name.trim();
  // user.lastname = body.last_name.trim();

  user.name = body.first_name.trim() + " " + body.last_name.trim();
  user.email = body.email;
  user.setPassword(body.password);

  user.save((err, newUser) => {
    if (err) {
      if (err.errmsg && err.errmsg.includes("duplicate key error")) {
        return res.json({ message: "Provided Email is already registered." });
      }
      return res.json({ message: "Something went wrong" });
    } else {
      const token = newUser.getJwt();
      res.status(201).json({ token });
    }
  });
};

const loginUser = function(req, res) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(400).json(err);
    }
    if (user) {
      const token = user.getJwt();

      res.status(201).json({ token });
    } else {
      res.json(info);
    }
  })(req, res);
};

const generateFeed = function(req, res) {
  res.status(200).json({ message: "Generating post for a user feed" });
};

const getSearchResults = function({ query, payload }, res) {
  if (!query.query) {
    return res.json({ err: "Missing a query" });
  }
  User.find(
    { name: { $regex: query.query, $options: "i" } },
    "name",
    (err, results) => {
      if (err) {
        return res.json({ err: err });
      }
      results = results.slice(0, 20);
      for (let i = 0; i < results.length; i++) {
        if (results[i]._id == payload._id) {
          results.splice(i, 1);
          break;
        }
      }
      return res
        .status(200)
        .json({ message: "Getting search result", results: results });
    }
  );
};

const deleteAllUsers = function(req, res) {
  User.deleteMany({}, (err, info) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ messages: "Deleted All Users", info: info });
  });
};

const makeFriendRequest = function({ params }, res) {
  User.findById(params.to, (err, user) => {
    if (err) {
      return res.json({ err, err });
    }

    console.log(user);
  });

  return res.json({
    message: "Making Friend Request",
    from: params.from,
    to: params.to
  });
};

module.exports = {
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  makeFriendRequest
};
