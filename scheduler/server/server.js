const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const SYS = require('./functions.js');
const cors = require('cors');
//const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger');
SYS.DB.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) =>
  res.send({
    error: true,
    message: 'Scheduler api interface',
  }),
);

app.get('/msg', SYS.verifyToken, function(req, res) {
  SYS.DB.query('SELECT * FROM notification WHERE user_id=?', [req.user_id], function(error, results, fields) {
    if (error) throw error;
    SYS.DB.query('DELETE FROM `notification` WHERE user_id=?', [req.user_id]);
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.post('/register', function(req, res) {
  const username = (req.body.username) ? req.body.username : false;
  let password = (req.body.password) ? req.body.password : false;
  const password2 = (req.body.password2) ? req.body.password2 : false;
  const role = (req.body.role || ![0, 1].includes(req.body.role)) ? req.body.role : false;
  let parent = (req.body.parent) ? req.body.parent : 0;
  const phone = (req.body.phone) ? req.body.phone : false;
  const first_name = (req.body.first_name) ? req.body.first_name : '';
  const last_name = (req.body.last_name) ? req.body.last_name : '';
  const note = (req.body.note) ? req.body.note : '';
  if (!username) {
    return res.send({
      response: 'error',
      msg: 'Введите имя пользователя',
    });
  }
  if (password !== password2) {
    return res.send({
      response: 'error',
      msg: 'Пароли не совпадают',
    });
  }
  if (!password) {
    return res.send({
      response: 'error',
      msg: 'Введите пароль',
    });
  }
  if (!role) {
    return res.send({
      response: 'error',
      msg: 'Выберите роль',
    });
  }
  if (!phone || !SYS.isEmailValid(phone)) {
    return res.send({
      response: 'error',
      msg: 'Введите почту',
    });
  }
  if (role == 0) {
    parent = 0;
  } else {
    if (parent == 0) {
      return res.send({
        response: 'error',
        msg: 'Выберите менеджера',
      });
    }
  }

  SYS.DB.query('SELECT * FROM users WHERE phone=?', [phone], function(error, results, fields) {
    if (error) throw error;
    if (results.length > 0) {
      return res.send({
        response: 'error',
        msg: 'Пользователь с такой почтой уже зарегистрирован!',
      });
    } else {
      SYS.DB.query('SELECT * FROM users WHERE username=?', [username], function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          return res.send({
            response: 'error',
            msg: 'Пользователь с таким логином уже зарегистрирован!',
          });
        } else {
          password = SYS.GeneratePasswordHash(password);
          SYS.DB.query('INSERT INTO users SET ?', {
            id: null,
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            role: role,
            parent: parent,
            note: note,
          }, function(error, results, fields) {
            if (error) throw error;
            return res.send({
              response: 'success',
              data: results.insertId,
              msg: 'Вы можете войти сайт',
            });
          });
        }
      });
    }
  });
});

app.get('/managers', function(req, res) {
  SYS.DB.query('SELECT * FROM users WHERE role=?', [0], function(error, results, fields) {
    if (error) throw error;
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.post('/auth', function(req, res) {
  const username = (req.body.username) ? req.body.username : '';
  const password = (req.body.password) ? req.body.password : '';

  SYS.DB.query('SELECT * FROM users WHERE ?', {
    username: username,
  }, function(error, results, fields) {
    if (error) throw error;
    if (results[0]) {
      if (SYS.VerifyPasswordHash(password, results[0].password)) {
        results[0].token = SYS.GetApiToken(results[0].id);
        return res.send({
          response: 'success',
          data: results[0],
          msg: 'Вход успешно выполнен!',
        });
      } else {
        return res.send({
          response: 'error',
          msg: 'Неверный логин или пароль',
        });
      }
    } else {
      return res.send({
        response: 'error',
        msg: 'Неверный логин или пароль',
      });
    }
  });
});

app.post('/dialog/:id', SYS.verifyToken, function(req, res) {
  const user_id = req.params.id;
  const msg = (req.body.msg) ? req.body.msg : false;
  SYS.DB.query('INSERT INTO msg SET ?', {id: null, date: Math.round(Date.now()/1000), from_id: req.user_id, to_id: user_id, text: msg, visit: 0}, function(error, results, fields) {
    if (error) throw error;
    SYS.DB.query('SELECT * FROM msg WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)', [req.user_id, user_id, user_id, req.user_id], function(error, results, fields) {
      SYS.DB.query('UPDATE msg SET visit=? WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)', [1, req.user_id, user_id, user_id, req.user_id]);
      if (error) throw error;
      return res.send({
        response: 'success',
        data: results,
      });
    });
  });
});

app.get('/dialog/:id', SYS.verifyToken, function(req, res) {
  const user_id = req.params.id;
  SYS.DB.query('SELECT * FROM msg WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)', [req.user_id, user_id, user_id, req.user_id], function(error, results, fields) {
    SYS.DB.query('UPDATE msg SET visit=? WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)', [1, req.user_id, user_id, user_id, req.user_id]);
    if (error) throw error;
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.get('/msg/users', SYS.verifyToken, function(req, res) {
  if (req.userinfo.parent == 0) {
    SYS.DB.query('SELECT users.* FROM users WHERE users.id!=? AND users.parent=?', [req.user_id, req.user_id], function(error, results, fields) {
      if (error) throw error;
      return res.send({
        response: 'success',
        data: results,
      });
    });
  } else {
    SYS.DB.query('SELECT users.* FROM users WHERE users.id!=? AND (users.parent=? OR users.id=?)', [req.user_id, req.userinfo.parent, req.userinfo.parent], function(error, results, fields) {
      if (error) throw error;
      return res.send({
        response: 'success',
        data: results,
      });
    });
  }
});

app.get('/users', SYS.verifyToken, function(req, res) {
  SYS.DB.query('SELECT * FROM users WHERE role=? AND parent=?', [1, req.user_id], function(error, results, fields) {
    if (error) throw error;
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.get('/user/:id', SYS.verifyToken, function(req, res) {
  const user_id = req.params.id;
  SYS.DB.query('SELECT * FROM users WHERE (role=? AND parent=? AND id=?) OR id=?', [1, req.user_id, user_id, req.user_id], function(error, results, fields) {
    if (error) throw error;
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.delete('/schedules/:id', SYS.verifyToken, function(req, res) {
  const id = (req.params.id) ? Number(req.params.id) : false;
  if (!id) {
    return res.send({
      response: 'error',
      msg: 'Запись не существует',
    });
  }
  SYS.DB.query('SELECT `schedule`.*,schedule.parent as pparent, users.username, users.first_name, users.last_name, users.phone, users.role, users.parent FROM `schedule` INNER JOIN users ON `schedule`.user_id = users.id WHERE `schedule`.id = ?', [id], function(error, results, fields) {
    if (error) throw error;
    if (Math.floor(Date.now() / 1000) > results[0].time_start) {
      return res.send({
        response: 'error',
        msg: 'Событие уже прошло',
      });
    } else {
      if (results[0].user_id != req.user_id && results[0].status == 0) {
        return res.send({
          response: 'error',
          msg: 'Запись вам не пренадлежит',
        });
      } else if (results[0].pparent != req.user_id && results[0].status == 1) {
        return res.send({
          response: 'error',
          msg: 'Запись вам не пренадлежит',
        });
      } else {
        SYS.DB.query('DELETE FROM `schedule` WHERE id=?', [id]);
        return res.send({
          response: 'success',
          msg: 'Запись удалена',
        });
      }
    }
  });
});

app.get('/schedules/:id', SYS.verifyToken, function(req, res) {
  const id = (req.params.id) ? req.params.id : false;
  if (!id) {
    return res.send({
      response: 'error',
      msg: 'Запись не существует',
    });
  }
  SYS.DB.query('SELECT `schedule`.*, users.username, users.first_name, users.last_name, users.phone, users.role, users.parent, users.note FROM `schedule` INNER JOIN users ON `schedule`.user_id = users.id WHERE `schedule`.id = ?', [id], function(error, results, fields) {
    if (error) throw error;

    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.get('/schedule/:day_start/:day_end', SYS.verifyToken, function(req, res) {
  const day_start = (req.params.day_start) ? Number(Date.parse(req.params.day_start) / 1000) : false;
  const day_end = (req.params.day_end) ? Number(Date.parse(req.params.day_end) / 1000) : false;
  if (!day_start || !day_end) {
    return res.send({
      response: 'error',
      msg: 'Неверный день',
    });
  }

  SYS.DB.query('SELECT sh.id, sh.time_start, sh.time_end, sh.user_id, sh.`status`, `user`.username, `user`.first_name, `user`.last_name, `user`.phone, `user`.note FROM `schedule` AS sh INNER JOIN users AS `user` ON sh.user_id = `user`.id WHERE (sh.parent=? OR sh.user_id=?) AND sh.date>=? AND sh.date<=?', [req.user_id, req.user_id, day_start, day_end], function(error, results, fields) {
    if (error) throw error;
    const return_array = [];
    for (const row of results) {
      const title = (row.first_name || row.last_name) ? row.first_name + ' ' + row.last_name + ' (' + row.username + ')' : row.username;
      if (!req.userinfo.role && !row.status) {

      } else {
        return_array.push({
          title: (row.note) ? title + ' [' + row.note + ']' : title,
          start: new Date(row.time_start * 1000).toISOString().slice(0, 19),
          end: new Date(row.time_end * 1000).toISOString().slice(0, 19),
          id: row.id,
          status: row.status,
          color: (row.status) ? '#4b0aca' : '#ca0a0a',
        });
      }
    };
    return res.send({
      response: 'success',
      data: return_array,
    });
  });
});
app.get('/check/:start/:stop', SYS.verifyToken, function(req, res) {
  const start = req.params.start;
  const stop = req.params.stop;
  SYS.DB.query('SELECT distinct(user_id) FROM `schedule` WHERE ((time_start<? AND time_end>?) OR (time_start<? AND time_end>?) OR (time_start=? OR time_end=?) OR (time_start>? AND time_end<?))', [start, start, stop, stop, start, stop, start, stop], function(error, results, fields) {
    return res.send({
      response: 'success',
      data: results,
    });
  });
});

app.post('/schedule', SYS.verifyToken, function(req, res) {
  const user_id = (req.body.user_id) ? Number(req.body.user_id) : false;
  const time_start = (req.body.time_start) ? req.body.time_start : false;
  const time_end = (req.body.time_end) ? req.body.time_end : false;
  const status = (req.body.status) ? req.body.status : 0;
  if (!time_start) {
    return res.send({
      response: 'error',
      msg: 'Не указано начало',
    });
  }
  if (!user_id) {
    return res.send({
      response: 'error',
      msg: 'Не указан пользователь',
    });
  }
  if (!time_end) {
    return res.send({
      response: 'error',
      msg: 'Не указан конец',
    });
  }
  if (Math.floor(Date.now() / 1000) > time_start) {
    return res.send({
      response: 'error',
      msg: 'Время уже прошло',
    });
  }
  if (time_end < time_start || time_start + 3600 > time_end) {
    return res.send({
      response: 'error',
      msg: 'Неверное время',
    });
  }
  SYS.DB.query('SELECT * FROM schedule WHERE user_id=? AND ((time_start<? AND time_end>?) OR (time_start<? AND time_end>?) OR (time_start=? OR time_end=?) OR (time_start>? AND time_end<?))', [user_id, time_start, time_start, time_end, time_end, time_start, time_end, time_start, time_end], function(error, results, fields) {
    if (error) throw error;
    if (results.length > 0) {
      return res.send({
        response: 'error',
        msg: 'Эти часы уже заняты',
      });
    } else {
      SYS.DB.query('SELECT * FROM users WHERE id=? ', [user_id], function(error, results, fields) {
        if (error) throw error;
        const userinfo = results[0];
        if (userinfo.id != req.user_id && status == 0) {
          return res.send({
            response: 'error',
            msg: 'Вы не можете установить выходной день, вы не работник',
          });
        } else if (userinfo.id == req.user_id && status == 1) {
          return res.send({
            response: 'error',
            msg: 'Вы не можете установить рабочий день, нет прав менеджера',
          });
        } else if (userinfo.id == req.user_id && req.user_id == user_id && userinfo.role == 0) {
          return res.send({
            response: 'error',
            msg: 'У менеджера нет расписания',
          });
        } else {
          SYS.DB.query('INSERT INTO schedule SET ?', {
            id: null,
            date: Number(new Date(time_start * 1000).setHours(0, 0, 0, 0)) / 1000,
            time_start: time_start,
            time_end: time_end,
            user_id: user_id,
            status: status,
            parent: userinfo.parent,
            note: '',
          }, function(error, results, fields) {
            if (error) throw error;
            if (status == 1) {
              SYS.DB.query('INSERT INTO notification SET ?', {
                id: null,
                user_id: user_id,
                text: 'У вас новая запись на время: ' + new Date(time_start * 1000).toISOString().slice(0, 19) + ' - ' + new Date(time_end * 1000).toISOString().slice(0, 19),
                send: 0,
              });
            }
            return res.send({
              response: 'success',
              data: results.insertId,
              msg: 'Запись создана!',
            });
          });
        }
      });
    }
  });
});
app.listen(3000, () => console.log('Server has been started on port 3000...'));
