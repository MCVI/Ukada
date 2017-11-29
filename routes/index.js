/**
 * Author: xuelanghu
 */

var express = require('express');
var router = express.Router();
var user = require('../modules/user');
var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    user: req.session.user,
    message: req.flash('message').toString()
  });
});

router.post('/login', checkLogout, function(req, res) {
	user.getByEmail(req.body.email, function(err, ans) {
		if (ans.toString() == '') {
			req.flash('message', 'no such user');
		}
		else if (md5(req.body.password) != ans[0].password) {
			req.flash('message', 'The password is incorrect');
		} else {
			getFromRowDataPacket(ans, function(_user) {
        console.log(ans[0].school);
				req.session.user = _user;
				console.log('req.session.user');
				console.log(req.session.user);
			});
		}
		res.redirect('/');
	});
});


// router.get('/logout', checkLogin);
router.get('/logout', checkLogin, function(req, res) {
	console.log('logout');
	req.session.user = null;
	res.redirect('/');
});

router.get('/apply', checkLogin, function(req, res) {
  user.getById(req.session.user.id, function(err, ans) {
    if (err) {
      console.log(err);
    } else {
      getFromRowDataPacket(ans, function(_user) {
        console.log('_user');
        console.log(_user);
        req.session.user = _user;
        res.render('apply', {
          user: req.session.user,
          message: req.flash('message').toString()
        });
      });
    }
  });
});

router.get('/reapply', checkLogin, function(req, res) {
  user.reapply(req.session.user.id, function(err, ans) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      user.getById(req.session.user.id, function(err, ans) {
        if (err) {
          console.log(err);
        } else {
          getFromRowDataPacket(ans, function(_user) {
            console.log('_user');
            console.log(_user);
            req.session.user = _user;
          });
        }
        res.redirect('/apply');
      });
    }
  });
})

router.post('/apply', checkLogin, function(req, res) {
	console.log('apply');

	var _user = req.session.user;

	var _apply = {
    nick: req.body.nick,
    teamer1: req.body.teamer1,
    teamer2: req.body.teamer2,
		teamer3: req.body.teamer3,
		school: req.body.school,
		phone: req.body.tel,
		qq: req.body.qq
	}
	console.log(_apply);
	if (_apply.nick == '' || _apply.nick.length > 15 ||
    _apply.teamer1 == '' || _apply.teamer1.length > 10 ||
    _apply.teamer2 == '' || _apply.teamer2.length > 10 ||
		_apply.teamer3 == '' || _apply.teamer3.length > 10 ||
		_apply.school == '' || _apply.school.length > 20 ||
		// _apply.studentID == '' || _apply.studentID.length > 10 || _apply.studentID.indexOf('2016') ||
		_apply.phone == '' || _apply.phone.length > 11 ||
		_apply.qq == '' || _apply.qq.length > 12) {

		req.flash('message', 'Please enter the correct information');
		// res.render('message', {
		// 	msg: 'error, please input all infomation.',
  //   		message: req.flash('message').toString()
		// })
		res.redirect('/apply');
	} else {

		// console.log(req.body.name);
		// console.log(req.body.nick);
		// console.log(req.body.studentID);
		// console.log(req.body.college);
		// console.log(req.body.tel);
		// console.log(req.body.qq);

		user.apply(_user.id, _apply, function(err, ans) {
			if (err) {
				console.log(err);
			} else {
				// console.log(ans);
				user.getById(req.session.user.id, function(err, ans) {
					if (err) {
						console.log(err);
					} else {
						getFromRowDataPacket(ans, function(_user) {
              console.log('_user');
              console.log(_user);
							req.session.user = _user;
						});
					}
					res.redirect('/apply');
				});
			}
		});
	}
});


router.get('/regist', checkLogout, function(req, res) {
  res.render('regist', {
    user: req.session.user,
    message: req.flash('message').toString()
  })
});

router.post('/regist', checkLogout, function(req, res) {

	console.log('regist');
	// console.log(req.body.email);
	// console.log(req.body.password);
	// console.log(req.body.password_re);

	user.getByEmail(req.body.email, function(err, ans) {
		if (ans.toString() == '') {
			if (req.body.password != req.body.password_re) {
				req.flash('message',
					'Passwords do not match');

				res.redirect('/regist');
			} else {
				var new_user= {
					email: req.body.email,
					password: md5(req.body.password),
					statu: 0,
					nick: null,
          teamer1: null,
          teamer2: null,
					teamer3: null,
					school: null,
					phone: null,
					qq: null,
				}
				var user_reg = new user(new_user);
				user_reg.save(function(err, ans) {
					if (err) {
            console.log(err);
						// res.render('message', {
						// 	msg: 'regist error',
		    		// 	message: req.flash('message').toString()
						// })

            res.redirect('/regist');
					} else {
            console.log('user_reg session');
            res.redirect('/');
          }
				});
			}
		} else {
			req.flash('message',
				'User ' + req.body.email + ' already exists');

			res.redirect('/regist');
		}
	});
});

getFromRowDataPacket = function (res, callback) {
	var _user = new user({
		id:res[0].id,
		email: res[0].email,
		password: res[0].password,
		statu: res[0].statu,
    nick: res[0].nick,
    teamer1: res[0].teamer1,
    teamer2: res[0].teamer2,
		teamer3: res[0].teamer3,
		school: res[0].school,
		phone: res[0].phone,
		qq: res[0].qq
	});

	callback(_user);
};

function checkLogin(req, res, next) {
	if (req.session.user == null) {
		req.flash('message', 'Please login first');
		return res.redirect('/');
	}
	next();
};

function checkLogout(req, res, next) {
	if (req.session.user != null) {
		req.flash('message', 'Please logout first');
		return res.redirect('/');
	}
	next();
};

module.exports = router;
