const PRIVATE_KEY = "TEST";
const SALT = "e67a332173e9b2c7c6b3d364ab93ece2";
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const microtime = require("microtime");
const emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

const mysql = require("mysql");
const dbConn = mysql.createConnection({
  host: "127.0.0.1",
  user: "mysqladmin",
  password: "kaes4thiNeCh",
  database: "database",
});

module.exports = {
  GetApiToken: function (user_id) {
    const token = jwt.sign(
      {
        user_id: user_id,
        time: microtime.now(),
      },
      PRIVATE_KEY
    );
    dbConn.query(
      "SELECT * FROM users WHERE ?",
      {
        id: user_id,
      },
      function (error, results, fields) {
        if (error) throw error;
        if (results[0]) {
          dbConn.query("DELETE FROM `api` WHERE ?", {
            user_id: user_id,
          });
        }
        dbConn.query("INSERT INTO api SET ?", {
          id: null,
          token: token,
          user_id: user_id,
        });
      }
    );

    return token;
  },
  VerifyPasswordHash: function (password, hash) {
    const trys = crypto
      .pbkdf2Sync(password, SALT, 1000, 64, `sha512`)
      .toString(`hex`);
    return trys === hash;
  },
  GeneratePasswordHash: function (password) {
    return crypto
      .pbkdf2Sync(password, SALT, 1000, 64, `sha512`)
      .toString(`hex`);
  },
  DB: dbConn,
  verifyToken: function (req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      dbConn.query(
        "SELECT * FROM api WHERE ?",
        {
          token: bearerToken,
        },
        function (error, results, fields) {
          if (error) throw error;
          if (results.length > 0) {
            dbConn.query(
              "SELECT * FROM users WHERE id=?",
              [results[0].user_id],
              function (error, results, fields) {
                if (error) throw error;
                if (results[0]) {
                  const user_id = results[0].id;
                  req.user_id = user_id;
                  req.userinfo = results[0];
                  next();
                } else {
                  res.sendStatus(401);
                }
              }
            );
          } else {
            res.sendStatus(401);
          }
        }
      );
    } else {
      res.sendStatus(403);
    }
  },
  isEmailValid: function (email) {
    if (!email) return false;

    if (email.length > 254) return false;

    const valid = emailRegex.test(email);
    if (!valid) return false;

    const parts = email.split("@");
    if (parts[0].length > 64) return false;

    const domainParts = parts[1].split(".");
    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    ) {
      return false;
    }

    return true;
  },
};
