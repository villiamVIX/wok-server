# wok-server
报工系统后台

status_code:{
	200:正常
	---------------
	421:邮箱发送失败
	422:注册验证码校验失败
	423:验证邮件是否注册失败
	424:邮箱未注册
	425:重置密码邮件验证失败
	450:邮箱被占用
	---------------
	451:注册抛出错误
	452:重置密码失败，检查数据
	---------------
	600:查找用户失败，检查数据
	601:密码错误
	602：验证码校验抛出错误
	603：创建用户失败
	604：校验密码错误
	605: 自动登录失败
	606：token失效无法自动登录
	---------------
	700: 查询工作列表失败
	701：新建工项出错
	702：新建子工项出错
	703：查询团队成员失败
	704：查询子工项失败
	705：更新子工项失败
	706：获取今日工项失败
}