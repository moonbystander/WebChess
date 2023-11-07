const app=new Vue({
    el:"#app",
    data:{
        index:1,
        user:{
            id:"",
            name:"",
            password:"",
        }
    },
    mounted: function () {
    }
    ,
    methods:{
        resetform1(){
            app.$data.user={
                id:"",
                name:"",
                password:"",
            }
            app.$data.index=2;
        },
        resetform2(){
            app.$data.user={
                id:"",
                name:"",
                password:"",

            }
            app.$data.index=1;
        },
        registeruser(){
            var name = app.$data.user.name.trim()
            var password = app.$data.user.password.trim()
            var id=app.$data.user.id.trim()
            if (id === '') {
                alert("id不能为空");
                return;
            }
            if (name === '') {
                alert("name不能为空");
                return;
            }
            if (password === '') {
                alert("密码不能为空")
                return;
            }
            if (password.length < 6) {
                alert("请输入6位以上密码")
                return;
            }

            var url="/register"
            $.ajax({
                type:"get",
                url:url,
                data:{
                    name:name,
                    password:password,
                    id:id
                },
                success:function (data) {
                    switch (data){
                        case 'error':
                            app.$message({
                                type: 'error',
                                message: '注册失败!'
                            });
                            break;
                        case 'true':
                            window.location.href="/room.html"
                    }
                },
                error:function () {
                    app.$message({
                        type: 'error',
                        message: '连接异常,无法注册!'
                    });
                }
            })

        },
        login(){
            var url="/login";
            var id = app.$data.user.id.trim()
            var password = app.$data.user.password.trim()
            if (id === '') {
                alert("id不能为空");
                return;
            }
            if (password === '') {
                alert("密码不能为空")
                return;
            }
            if (password.length < 6) {
                alert("请输入6位以上密码")
                return;
            }
            $.ajax({
                type:"get",
                url:url,
                data:{
                    id:app.$data.user.id,
                    password: app.$data.user.password,
                },
                success:function (data) {
                    switch (data){
                        case 'error':
                            app.$message({
                                type: 'error',
                                message: '账户密码错误,登陆失败!'
                            });
                            break;
                        case 'true':
                            window.location.href = "/room.html"
                            break;
                    }
                },
                error:function () {
                    app.$message({
                        type: 'error',
                        message: '连接异常,无法登陆!'
                    });
                }
            })
        }
    }
})