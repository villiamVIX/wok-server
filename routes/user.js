const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const TOKEN_SECRET = 'villiam_wok_2020_09_15'
const Users = require('../database/models/Users.js')
const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const router = express.Router();

// 邮箱模板
const template = ejs.compile(fs.readFileSync(path.join(__dirname, '../common/Mail_Tools/email.ejs'), 'utf8'));

// 封装的查询工具
const Sql_Tools = require('../common/Sql_Tools/Sql_Account.js')
// 封装的邮件发送工具
const {
	Email_Tool, // 邮件工具类
	Email_Master_User, // 发射邮箱账号
	Send_Email_Tool // 邮件发射工具
} = require('../common/Mail_Tools/Send_Mail.js');

const {
	Check_Verify // 验证码校验方法
} =require('../common/Common_Tools/Check_Tools.js')


// 重置密码-邮箱验证
router.post('/forgot/email', async (req, res) => {

	let {
		email
	} = req.body; //前端发送来的验证邮箱
	
// a返回一个布尔值  判断后决定是否发短信
	let  a = Sql_Tools.Cheak_Email_Existed(res,email).then(data=>{
		
	})
	

		
	// 数据持久化 便于验证
	req.sessionStore.verify = Email_Tool.verify;
	req.sessionStore.email = email;
	console.log(req.sessionStore.verify)

	const send_Email = async (request, response, next) => {

		const html = template({
			title: 'VWOK 密码重置',
			verify: req.sessionStore.verify,
			email,
			motivation: '重置',
			object: '密码'
		});

		const mailOptions = { //发送给用户显示的字段
			from: `VWOK ${Email_Master_User}`,
			to: email,
			subject: 'VWOK重置密码验证', // 邮件标题
			html // ejs邮件模板
		}
		Send_Email_Tool(res,mailOptions)
	};
})

// 重置密码
router.post('/forgot/reset/password', async (req, res) => {
	let {
		email,
		verify
	} = req.body; //前端发送来的验证邮箱

	let is_Verify_Right =Check_Verify(req, res, email, verify)
	if(!is_Verify_Right) return false
	
})


// 注册邮箱
router.post('/register/email', (req, res) => {

	let {
		email
	} = req.body; //前端发送来的验证邮箱

	Sql_Tools.Cheak_Email_Existed(email).then(data => {
		if (data !== null)
			return res.send({
				msg: '邮箱已存在',
				code: 450
			})
		//发邮件
		send_Email()
	}).catch(err => {
		res.send({
			msg: '验证邮件是否注册失败',
			code: 423
		})
	})

	// 数据持久化 便于验证
	req.sessionStore.verify = Email_Tool.verify;
	req.sessionStore.email = email;


	const send_Email = async (request, response, next) => {

		const html = template({
			title: 'VWOK 验证码',
			verify: req.sessionStore.verify,
			email,
			motivation: '注册',
			object: '账号'
		});

		const mailOptions = { //发送给用户显示的字段
			from: `VWOK ${Email_Master_User}`,
			to: email,
			subject: '注册VWOK邮箱验证', // 邮件标题
			html // ejs邮件模板
		}

		Send_Email_Tool(res,mailOptions)
	};
})


// 注册
router.post('/register', async (req, res) => {
	let {
		username,
		password,
		verify,
		email
	} = req.body
	console.log(req.body)

	console.log(`存储的session验证码 ${req.sessionStore.verify} ---------- ${verify}`)
	
	
	let is_Verify_Right =Check_Verify(req, res, email, verify)
	if(!is_Verify_Right) return false
	
	let bcrypt_Password = bcrypt.hashSync(password, 5)

	const model = await Users.findOne({
		where: {
			email
		}
	})
	if (model) {
		return res.send({
			code: 450,
			msg: "邮箱已被占用"
		})
	}
	const user = await Users.create({
		username,
		email,
		password: bcrypt_Password
	}).then(data => {
		return res.send({
			msg: '注册成功',
			code: 200
		})
	}).catch(err => {
		return res.send({
			msg: "注册失败，问开发者",
			code: 451
		})
	})

});

// 登录 
router.post('/login', async (req, res) => {
	let {
		email,
		password
	} = req.body

	const user_Info = await Users.findOne({
		where: {
			email
		}
	})

	if (!user_Info) {
		return res.send({
			msg: '用户不存在，先注册',
			code: 600
		})
	}

	const {
		uid
	} = user_Info.dataValues

	const check_password = bcrypt.compareSync(password, user_Info.dataValues.password)
	if (!check_password) {
		return res.send({
			msg: '密码错误',
			code: 601
		})
	}
	const token = jwt.sign({
		uid //用户id和token密钥
	}, TOKEN_SECRET, {
		expiresIn: 3600 * 24 * 120
	})


	return res.send({
		msg: '登录成功',
		code: 200,
		token
	})
});

// 自动登录模块 (搁置)
router.post('/islogin', (req, res) => {
	let {
		token
	} = req.headers

	const {
		uid
	} = jwt.verify(token, TOKEN_SECRET)
})






module.exports = router;