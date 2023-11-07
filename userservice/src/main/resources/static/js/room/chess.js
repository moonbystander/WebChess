

const app=new Vue({
    el:"#app",
    data(){
        return {
            chattext:"快来聊天吧!",
            input: '',
            squareUrl: "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png",
            isWait:false,
            socket:null,
            board:{
                ending:"0",//棋局结束时的提示文字
                bstate:"-2",//棋局状态,-2未开始,0进行中，-1黑胜，1红胜，2求和中，3和棋
                canDraw:false,
                player:[
                    {
                        id:"1",
                        name:"用户1",
                        userimg:"用户头像",
                        color:"r",
                    },
                    {
                        id:"",
                        name:"未入座",
                        userimg:"用户头像",
                        color: "b"
                    }
                ],
                boardmap:[],
                isPlay:true,//当前行动者
                playerColor:"r",
                key:{
                    isKey:false,
                    x:0,
                    y:0
                },
                stepList:[]
            },
            bchessarray:[],
            rchessarray:[],
            canvas:{},
            ctx:{}
        }
    },
    methods:{
        initall:function (){
            this.$data.board.img=new Image();
            this.$data.board.img.src='img/png/棋盘.png';
            this.getctx();
            this.initchess();
        },
        getctx:function (){
            this.$data.canvas=document.getElementById("chess");
            this.$data.ctx=this.$data.canvas.getContext("2d");
        },
        initchess:function (){
            for (let i = 0; i < 7; i++) {
                this.$data.bchessarray[i]={};
                this.$data.bchessarray[i].img=new Image();
                this.$data.bchessarray[i].img.src='img/png/b_'+(i+1)+'.png';
            }
            for (let i = 0; i < 7; i++) {
                this.$data.rchessarray[i]={};
                this.$data.rchessarray[i].img=new Image();
                this.$data.rchessarray[i].img.src='img/png/r_'+(i+1)+'.png';
            }
            this.$data.board.boardmap=[
                ['b4','b3','b5','b6','b7','b6','b5','b3','b4'],
                ['  ','  ','  ','  ','  ','  ','  ','  ','  '],
                ['  ','b2','  ','  ','  ','  ','  ','b2','  '],
                ['b1','  ','b1','  ','b1','  ','b1','  ','b1'],
                ['  ','  ','  ','  ','  ','  ','  ','  ','  '],
                ['  ','  ','  ','  ','  ','  ','  ','  ','  '],
                ['r1','  ','r1','  ','r1','  ','r1','  ','r1'],
                ['  ','r2','  ','  ','  ','  ','  ','r2','  '],
                ['  ','  ','  ','  ','  ','  ','  ','  ','  '],
                ['r4','r3','r5','r6','r7','r6','r5','r3','r4']
            ]
            this.$data.board.key.isKey=false;
            this.$data.board.stepList=[
                [{x:0,y:1},{x:0,y:-1},{x:-1,y:0},{x:1,y:0}],
                [{x:10,y:0},{x:0,y:10}],
                [{x:1,y:2},{x:-1,y:2},{x:2,y:1},{x:2,y:-1},{x:1,y:-2},{x:-1,y:-2},{x:-2,y:1},{x:-2,y:-1}],
                [{x:10,y:0},{x:0,y:10}],
                [{x:2,y:2},{x:2,y:-2},{x:-2,y:2},{x:-2,y:-2}],
                [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}],
                [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}]
            ]
        },
        //根据自己颜色来绘制棋子位子，自己的棋子在下方
        updateBoard:function (){
            this.$data.ctx.clearRect(0,0,864,961);
            this.$data.ctx.drawImage(this.$data.board.img,0, 0);
            //增加修正参数 c 根据颜色，若玩家为红色，则不修正，c=1，若为黑色，需要修正,c=-1，将棋盘上下翻转
            var c=1;
            switch ( this.$data.board.player[0].color ){
                case "r":
                    c=1;break;
                case "b":
                    c=-1;
                    break;
            }
            for (let i = 0; i < 9 ; i++) {
                for (let j = 0; j < 10; j++) {
                    var img=this.getImg(this.$data.board.boardmap[j][i]);
                    if ( typeof img !== 'undefined' ){
                        //通过这个式子，4.5-c*4.5+c*j，将纵坐标根据c的值改变，做到上下翻转的效果
                        this.$data.ctx.drawImage(img,4+35*i,18+36*(4.5-c*4.5+c*j));
                    }
                }
            }


        },
        getImg:function (key){
            var img;
            switch (key) {
                case 'b1':img=this.$data.bchessarray[0].img;break;
                case 'b2':img=this.$data.bchessarray[1].img;break;
                case 'b3':img=this.$data.bchessarray[2].img;break;
                case 'b4':img=this.$data.bchessarray[3].img;break;
                case 'b5':img=this.$data.bchessarray[4].img;break;
                case 'b6':img=this.$data.bchessarray[5].img;break;
                case 'b7':img=this.$data.bchessarray[6].img;break;
                case 'r1':img=this.$data.rchessarray[0].img;break;
                case 'r2':img=this.$data.rchessarray[1].img;break;
                case 'r3':img=this.$data.rchessarray[2].img;break;
                case 'r4':img=this.$data.rchessarray[3].img;break;
                case 'r5':img=this.$data.rchessarray[4].img;break;
                case 'r6':img=this.$data.rchessarray[5].img;break;
                case 'r7':img=this.$data.rchessarray[6].img;break;
                default:;
            }
            return img;
        },
        //响应鼠标点击事件，
        clickCanvas:function (event) {
            //走棋
            //进行可否走棋判断，可走棋则进行具体的行棋规则判定，通过后再发送到服务器
            if (this.$data.board.bstate==="0" && this.$data.board.isPlay){
                this.playChess(event.x,event.y);
            }


        },
        playChess:function (x,y) {
            //可以走棋，则进行下一步
            //将鼠标坐标转换为棋盘坐标
            let bpos=this.getBoardPos(x,y);
            console.log("棋盘坐标为:",bpos.bx,bpos.by);
            //边界检测
            if (this.isInBoard(bpos.bx,bpos.by) ){
                //边界检测通过，进行下一步，判断是否已选中棋子
                if (this.$data.board.key.isKey){
                    if (this.canMove(this.$data.board.key,bpos.bx,bpos.by)){
                        //发送走棋数据包
                        this.sendPlayChess({oldx:this.$data.board.key.x,oldy:this.$data.board.key.y,newx:bpos.bx,newy:bpos.by})

                        // this.moveKey(bpos.bx,bpos.by);
                    }else {
                        if (this.canChoose(bpos.bx,bpos.by,this.$data.board.playerColor)){
                            this.setKey(bpos.bx,bpos.by);
                        }else {
                            return;
                        }
                    }
                }else {
                    //如果未选择棋子，检测点击位置
                    if (this.canChoose(bpos.bx,bpos.by,this.$data.board.playerColor)){
                        this.setKey(bpos.bx,bpos.by)
                    }else {
                        return;
                    }
                }
            }
        }
        ,
        //传入点击坐标，转换为棋盘坐标(x,y)
        getBoardPos:function (x,y) {
            let canvas = this.$data.canvas;
            let rect = canvas.getBoundingClientRect();
            const rx = x - rect.left;
            const ry = y - rect.top;
            let bx= Math.floor((rx - 4 ) / 35);
            //由于棋盘会根据玩家颜色进行上下翻转，因此若翻转，则需要还原
            //增加修正参数 c 根据颜色，若玩家为红色，则不修正，c=1，若为黑色，需要修正,c=-1
            var c=1;
            switch ( this.$data.board.player[0].color ){
                case "r":
                    c=1;break;
                case "b":
                    c=-1;
                    break;
            }
            //-(c-1)/2，这项是为了修正，当c=-1时（也就是玩家执黑时），由于向下取整会导致纵坐标会向下偏差一个单位，因此通过此项来修正
            let by= Math.floor((((ry - 18 ) / 36)-4.5+4.5*c)/c-(c-1)/2);
            return {bx,by};
        },
        //设置 当前选择棋子
        setKey:function (x,y){
            this.$data.board.key.isKey=true;
            this.$data.board.key.x=x;
            this.$data.board.key.y=y;
        },
        //传入棋盘坐标，获取棋盘坐标对应的对象
        getMapKey:function (x,y) {
            return this.$data.board.boardmap[y][x];
        },
        //判断点击位置是否在棋盘内且非同色子
        canMoveKey:function (color,x,y){
            if (!this.isInBoard(x,y)){
                return false;
            }
            let obj=this.getMapKey(x,y);
            if (obj !== "  "){
                if ( obj.charAt(0) === color ){
                    return false;
                }
            }
            return true;
        },
        //检测是否在棋盘内且无棋子
        canMoveKey_:function (x,y) {
            if (!this.isInBoard(x,y)){
                return false;
            }
            let obj=this.getMapKey(x,y);
            return obj === "  ";

        },
        //判定点击位置是否为可走棋位置
        canMove:function (key,x,y) {
            let moveArr=this.getCanMoveList(key);
            for (let i=0;i<moveArr.length;i++){
                if (moveArr[i].x === x && moveArr[i].y === y){
                    return true;
                }
            }
            return false;
        },
        //根据棋子获得基础走法
        getBaseStep:function (key) {
            let retarr=[]
            switch (key) {
                case "b1":
                    retarr.push(this.$data.board.stepList[0][0]);
                    retarr.push(this.$data.board.stepList[0][2]);
                    retarr.push(this.$data.board.stepList[0][3]);
                    break;
                case "r1":
                    retarr.push(this.$data.board.stepList[0][1]);
                    retarr.push(this.$data.board.stepList[0][2]);
                    retarr.push(this.$data.board.stepList[0][3]);
                    break;
                case "b2":
                    retarr.push(this.$data.board.stepList[1][0]);
                    retarr.push(this.$data.board.stepList[1][1]);
                    break;
                case "r2":
                    retarr.push(this.$data.board.stepList[1][0]);
                    retarr.push(this.$data.board.stepList[1][1]);
                    break;
                case "b3":
                    for (let i = 0; i < 8; i++) {
                        retarr.push(this.$data.board.stepList[2][i]);
                    }
                    break;
                case "r3":
                    for (let i = 0; i < 8; i++) {
                        retarr.push(this.$data.board.stepList[2][i]);
                    }
                    break;
                case "b4":
                    retarr.push(this.$data.board.stepList[3][0]);
                    retarr.push(this.$data.board.stepList[3][1]);
                    break;
                case "r4":
                    retarr.push(this.$data.board.stepList[3][0]);
                    retarr.push(this.$data.board.stepList[3][1]);
                    break;
                case "b5":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[4][i]);
                    }
                    break;
                case "r5":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[4][i]);
                    }
                    break;
                case "b6":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[5][i]);
                    }
                    break;
                case "r6":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[5][i]);
                    }
                    break;
                case "b7":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[6][i]);
                    }
                    break;
                case "r7":
                    for (let i = 0; i < 4; i++) {
                        retarr.push(this.$data.board.stepList[6][i]);
                    }
                    break;
                default:;
            }
            return retarr;
        },
        //获取当前棋子的可走的落点数组
        //没有现成的可以使用的集合类型，需要自己实现一个。目标：存入以x,y为单位的元素，对比x,y值
        getCanMoveList:function (key) {
            let retarr=[];
            let k=this.getMapKey(key.x,key.y);
            let steparr=this.getBaseStep(k);
            switch (k.charAt(1)){
                case "1":
                    if (k.charAt(0) === "b" && key.y >= 5) {
                        for (let i = 0; i < steparr.length; i++) {
                            if (this.canMoveKey("b", key.x + steparr[i].x, key.y + steparr[i].y)) {
                                let step = {x: key.x + steparr[i].x, y: key.y + steparr[i].y};
                                retarr.push(step);
                            }
                        }
                    } else if (k.charAt(0) === "r" && key.y <= 4) {
                        for (let i = 0; i < steparr.length; i++) {
                            if (this.canMoveKey("r", key.x + steparr[i].x, key.y + steparr[i].y)) {
                                let step = {x: key.x + steparr[i].x, y: key.y + steparr[i].y};
                                retarr.push(step);
                            }
                        }
                    } else {
                        if (this.canMoveKey(k.charAt(0), key.x + steparr[0].x, key.y + steparr[0].y)) {
                            let step = {x: key.x + steparr[0].x, y: key.y + steparr[0].y};
                            retarr.push(step);
                        }
                    }
                    break;
                case "2":
                    let first=false

                    //炮，将直线上的所有无阻碍点都加入，当碰到第一个棋子后，若之后碰到的第一个棋子为敌人，加入
                    //右
                    for (let i=1;this.isInBoard(key.x+i,key.y);i++){
                        if (!first && this.getMapKey(key.x+i,key.y) === "  "){
                            let step={x:key.x+i,y:key.y};
                            retarr.push(step);
                        }else if (!first && this.getMapKey(key.x+i,key.y) !== "  "){
                            first=true;
                        }else if (first && this.getMapKey(key.x+i,key.y) !== "  "){
                            if (k.charAt(0) !== this.getMapKey(key.x+i,key.y).charAt(0) ){
                                retarr.push({x:key.x+i, y:key.y});
                            }
                            break;
                        }
                    }
                    //左
                    first=false;
                    for (let i=1;this.isInBoard(key.x-i,key.y);i++){
                        if (!first && this.getMapKey(key.x-i,key.y) === "  "){
                            let step={x:key.x-i,y:key.y};
                            retarr.push(step);
                        }else if (!first && this.getMapKey(key.x-i,key.y) !== "  "){
                            first=true;
                        }else if (first && this.getMapKey(key.x-i,key.y) !== "  "){
                            if (k.charAt(0) !== this.getMapKey(key.x-i,key.y).charAt(0) ){
                                retarr.push({x:key.x-i, y:key.y});
                            }
                            break;
                        }
                    }
                    //下
                    first=false;
                    for (let i=1;this.isInBoard(key.x,key.y+i);i++){
                        if (!first && this.getMapKey(key.x,key.y+i) === "  "){
                            let step={x:key.x,y:key.y+i};
                            retarr.push(step);
                        }else if (!first && this.getMapKey(key.x,key.y+i) !== "  "){
                            first=true;
                        }else if (first && this.getMapKey(key.x,key.y+i) !== "  "){
                            if (k.charAt(0) !== this.getMapKey(key.x,key.y+i).charAt(0) ){
                                retarr.push({x:key.x, y:key.y+i});
                            }
                            break;
                        }
                    }
                    //上
                    first=false;
                    for (let i=1;this.isInBoard(key.x,key.y-i);i++){
                        if (!first && this.getMapKey(key.x,key.y-i) === "  "){
                            let step={x:key.x,y:key.y-i};
                            retarr.push(step);
                        }else if (!first && this.getMapKey(key.x,key.y-i) !== "  "){
                            first=true;
                        }else if (first && this.getMapKey(key.x,key.y-i) !== "  "){
                            if (k.charAt(0) !== this.getMapKey(key.x,key.y-i).charAt(0) ){
                                retarr.push({x:key.x, y:key.y-i});
                            }
                            break;
                        }
                    }
                    break;
                case "3":
                    //马，马脚判断，两个一组，依次为下、右、上、左
                    //下
                    if (this.canMoveKey_(key.x,key.y+1)){
                        for (let j=0;j<2;j++){
                            if (this.canMoveKey(k.charAt(0),steparr[j].x+key.x,steparr[j].y+key.y) ){
                                retarr.push({x:steparr[j].x+key.x,y:steparr[j].y+key.y});
                            }
                        }
                    }
                    //右
                    if (this.canMoveKey_(key.x+1,key.y)){
                        for (let j=0;j<2;j++){
                            if (this.canMoveKey(k.charAt(0),steparr[2+j].x+key.x,steparr[2+j].y+key.y) ){
                                retarr.push({x:steparr[2+j].x+key.x,y:steparr[2+j].y+key.y});
                            }
                        }
                    }
                    //上
                    if (this.canMoveKey_(key.x,key.y-1)){
                        for (let j=0;j<2;j++){
                            if (this.canMoveKey(k.charAt(0),steparr[4+j].x+key.x,steparr[4+j].y+key.y) ){
                                retarr.push({x:steparr[4+j].x+key.x,y:steparr[4+j].y+key.y});
                            }
                        }
                    }
                    //左
                    if (this.canMoveKey_(key.x-1,key.y)){
                        for (let j=0;j<2;j++){
                            if (this.canMoveKey(k.charAt(0),steparr[6+j].x+key.x,steparr[6+j].y+key.y) ){
                                retarr.push({x:steparr[6+j].x+key.x,y:steparr[6+j].y+key.y});
                            }
                        }
                    }
                    break;
                case "4":
                    //車，将直线上无阻碍的所有点加入，若第一个棋子为敌人，加入
                    //右
                    for (let i=1;this.isInBoard(key.x+i,key.y);i++){
                        if (this.getMapKey(key.x+i,key.y) === "  "){
                            let step={x:key.x+i,y:key.y};
                            retarr.push(step);
                        }else if (this.getMapKey(key.x+i,key.y) !== "  "){
                            //判断是否为敌人
                            if (this.canMoveKey(k.charAt(0),key.x+i,key.y)){
                                retarr.push({x:key.x+i,y:key.y});
                            }
                            break
                        }
                    }
                    //左
                    for (let i=1;this.isInBoard(key.x-i,key.y);i++){
                        if (this.getMapKey(key.x-i,key.y) === "  "){
                            let step={x:key.x-i,y:key.y};
                            retarr.push(step);
                        }else if (this.getMapKey(key.x-i,key.y) !== "  "){
                            //判断是否为敌人
                            if (this.canMoveKey(k.charAt(0),key.x-i,key.y)){
                                retarr.push({x:key.x-i,y:key.y});
                            }
                            break
                        }
                    }
                    //上
                    for (let i=1;this.isInBoard(key.x,key.y-i);i++){
                        if (this.getMapKey(key.x,key.y-i) === "  "){
                            let step={x:key.x,y:key.y-i};
                            retarr.push(step);
                        }else if (this.getMapKey(key.x,key.y-i) !== "  "){
                            //判断是否为敌人
                            if (this.canMoveKey(k.charAt(0),key.x,key.y-i)){
                                retarr.push({x:key.x,y:key.y-i});
                            }
                            break
                        }
                    }
                    //下
                    for (let i=1;this.isInBoard(key.x,key.y+i);i++){
                        if (this.getMapKey(key.x,key.y+i) === "  "){
                            let step={x:key.x,y:key.y+i};
                            retarr.push(step);
                        }else if (this.getMapKey(key.x,key.y+i) !== "  "){
                            //判断是否为敌人
                            if (this.canMoveKey(k.charAt(0),key.x,key.y+i)){
                                retarr.push({x:key.x,y:key.y+i});
                            }
                            break
                        }
                    }
                    break;
                case "5":
                    //象,象脚判断，顺序为 右下、右上、左下、左上
                    if (this.canMoveKey_(key.x+1,key.y+1)){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[0].x,key.y+steparr[0].y)){
                            retarr.push({x:key.x+steparr[0].x,y:key.y+steparr[0].y})
                        }
                    }
                    if (this.canMoveKey_(key.x+1,key.y-1)){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[1].x,key.y+steparr[1].y)){
                            retarr.push({x:key.x+steparr[1].x,y:key.y+steparr[1].y})
                        }
                    }
                    if (this.canMoveKey_(key.x-1,key.y+1)){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[2].x,key.y+steparr[2].y)){
                            retarr.push({x:key.x+steparr[2].x,y:key.y+steparr[2].y})
                        }
                    }
                    if (this.canMoveKey_(key.x-1,key.y-1)){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[3].x,key.y+steparr[3].y)){
                            retarr.push({x:key.x+steparr[3].x,y:key.y+steparr[3].y})
                        }
                    }

                    break;
                case "6":
                    for (let i=0;i<steparr.length;i++){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[i].x,key.y+steparr[i].y)){
                            retarr.push({x:key.x+steparr[i].x,y:key.y+steparr[i].y})
                        }
                    }
                    break;
                case "7":
                    for (let i=0;i<steparr.length;i++){
                        if (this.canMoveKey(k.charAt(0),key.x+steparr[i].x,key.y+steparr[i].y)){
                            retarr.push({x:key.x+steparr[i].x,y:key.y+steparr[i].y})
                        }
                    }
                    break;
                default:;
            }
            return retarr;
        },
        //进行棋子移动
        moveKey:function (oldx,oldy,newx,newy){
            let key=this.getMapKey(oldx,oldy);
            this.$data.board.boardmap[oldy][oldx]="  ";
            this.$data.board.boardmap[newy][newx]=key;
            this.$data.board.key.isKey=false;
        },
        //棋子合法性检查
        canChoose:function (x,y,color){
            if (this.getMapKey(x,y) !== "  " && this.getMapKey(x,y).charAt(0) === color ){
                return true;
            }else return false;
        },
        //判断坐标是否落在棋盘中
        isInBoard:function(x,y){
            return x >= 0 && x <= 8 && y >= 0 && y <= 9;
        },
        //重置聊天信息
        clearMessage(){
            this.$data.chattext="快来聊天吧!";
        }
        ,
        addTextLine(name,text){
            this.$data.chattext+="\n";
            this.$data.chattext+=name+":"+text;
        }
        ,
        //发送聊天信息
        sendMessage(){
            //棋局进行中才能聊天
            if(!(this.$data.board.bstate === "0" || this.$data.board.bstate === "2")){
                return;
            }
            //name:text

        }
        ,
        Prepare:function () {
            this.updateBoard();
            this.$data.isWait=true;
            if (this.$data.socket !== null && this.$data.socket.readyState === WebSocket.OPEN){
                console.log("发送准备协议包")
                this.sendPrepare(this.$data.board.player[0]);
            }else {
                this.createSocket();
            }
        },
        Drawthegame:function (){
            //判定是否存在ws连接，是否棋局进行中，是否在自己回合内
            if (this.$data.socket === null || this.$data.board.bstate !== "0" || this.$data.board.isPlay === false){
              return;
            }
            this.$data.board.canDraw=false;
            //发送求和请求
            this.$data.board.bstate="2";
            this.sendDrawTheGame(this.$data.board.player[0]);
        },
        Giveup:function (){
            if (this.$data.socket === null || this.$data.board.bstate !== "0"){
                return;
            }
            this.$data.board.bstate="2";
            this.sendGiveUp(this.$data.board.player[0]);
        }
        ,
        //创建ws连接
        createSocket:function () {
            this.$data.socket=new WebSocket("ws://" + location.hostname + ":8099/websocket");

            this.$data.socket.onopen = function(event) {
                // 发送消息到服务器
                console.log("WebSocket连接已建立");
                let data={
                    protocol:"ws",
                    operation:111,
                    result:{
                        user: app.$data.board.player[0]
                    }
                }
                this.send(JSON.stringify(data));
            };

            //消息处理机制
            this.$data.socket.onmessage = function(event) {
                const message = JSON.parse(event.data);
                console.log("ws收到信息:",message);
                switch (message.operation){
                    case "126":
                        app.$alert(message.result.msg, '错误', {
                            confirmButtonText: '确定',
                            callback: action => {
                            }
                        });
                        break;
                    case "221":
                        //收到开始对局信息
                        app.$data.isWait=false;
                        app.$data.board.bstate="0";
                        app.$data.board.canDraw=true;
                        app.$data.board.player[0].color=message.result.self.color;
                        app.$data.board.playerColor=message.result.self.color;
                        app.$data.board.player[1].id=message.result.other.id;
                        app.$data.board.player[1].color=message.result.other.color;
                        app.$data.board.player[1].name=message.result.other.name;
                        if (app.$data.board.player[0].color === "r"){
                            app.$data.board.isPlay=true;
                        }else {
                            app.$data.board.isPlay=false;
                        }
                        app.updateBoard();
                        break;
                    case "223":
                        //收到从服务器发来的走棋同步信息
                        //根据收到的走棋信息，对棋盘进行操作
                        //取反，交换落子权
                        app.$data.board.isPlay=!app.$data.board.isPlay;
                        //落子
                        app.moveKey(message.result.step.oldx,message.result.step.oldy,message.result.step.newx,message.result.step.newy);
                        if (message.result.ending === -1 ){
                            //黑胜
                            app.$data.board.isPlay=false;
                            app.$data.board.bstate="-1";
                            if (app.$data.board.player[0].color === "b"){
                               app.$data.board.ending="恭喜你，你赢了！" ;
                            }else {
                                app.$data.board.ending="棋差一着，再接再厉。";
                            }
                        }else if (message.result.ending === 1){
                            //红胜
                            app.board.isPlay=false;
                            app.$data.board.bstate="1";
                            if (app.$data.board.player[0].color === "r"){
                                app.$data.board.ending="恭喜你，你赢了！" ;
                            }else {
                                app.$data.board.ending="棋差一着，请再接再厉。";
                            }
                        }
                        app.updateBoard();
                        if (message.result.ending !== 0 && message.result.ending !== 2){
                            app.$data.board.canDraw=false;
                            app.$alert(app.$data.board.ending, '对局结束', {
                                confirmButtonText: '确定',
                                callback: action => {
                                }
                            });
                        }
                        break;
                    case "224":
                        //收到从服务器发来的重新走棋信息
                        break;
                    case "226":
                        //收到对方求和信息
                        //弹出弹窗确认(30秒自动拒绝)
                        app.$confirm('对方发起求和, 是否同意?', '提示', {
                        confirmButtonText: '同意',
                        cancelButtonText: '拒绝',
                        type: 'info'
                    }).then(() => {
                        //发送同意求和
                            app.sendDrawResponse(true);
                    }).catch(() => {
                        //发送拒绝求和
                            app.sendDrawResponse(false);
                    });
                        //响应完成后向服务器发送sendDrawResponse(res)
                        break;
                    case "228":
                        //收到对方拒绝求和信息
                        app.$data.board.bstate="0";
                        break;
                    case "321":
                        app.$data.board.canDraw=false;
                        if (!(app.$data.board.bstate === "0" || app.$data.board.bstate === "2") ){
                            break;
                        }
                        //收到对局结束信息
                        if (message.result.ending === -1 ){
                            //黑胜
                            app.$data.board.isPlay=false;
                            app.$data.board.bstate="-1";
                            if (app.$data.board.player[0].color === "b"){
                                app.$data.board.ending="恭喜你，你赢了！" ;
                            }else {
                                app.$data.board.ending="棋差一着，再接再厉。";
                            }
                        }else if (message.result.ending === 1){
                            //红胜
                            app.board.isPlay=false;
                            app.$data.board.bstate="1";
                            if (app.$data.board.player[0].color === "r"){
                                app.$data.board.ending="恭喜你，你赢了！" ;
                            }else {
                                app.$data.board.ending="棋差一着，请再接再厉。";
                            }
                        }else if (message.result.ending === 3){
                            app.board.isPlay=false;
                            app.$data.board.bstate="3";
                            app.$data.board.ending=message.result.text;
                        }
                        app.updateBoard();
                        if (message.result.ending !== 0){
                            app.$alert(message.result.text+","+app.$data.board.ending, '对局结束', {
                                confirmButtonText: '确定',
                                callback: action => {
                                }
                            });
                        }
                        break;
                }
            };

            this.$data.socket.onclose = function(event) {
                console.log("WebSocket连接已关闭");
            };

            window.addEventListener("beforeunload", function() {
                socket.close();
            });

        },
        //使用ws向服务器发送准备信息
        sendPrepare:function (user) {
            let data={
                protocol: "ws",
                operation: "112",
                result: {
                    user:user
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        },
        sendChatMessage(user){
            let data={
                protocol: "ws",
                operation: "411",
                result: {
                    user:user,
                    text:app.$data.input
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        }
        ,
        //发送求和请求
        sendDrawTheGame(user){
            let data={
                protocol: "ws",
                operation: "215",
                result: {
                    user:user
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        },
        //发送求和响应信息
        sendDrawResponse(res){
            let data={
                protocol: "ws",
                operation: "217",
                result: {
                    res:res
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        },
        sendGiveUp(user){
            let data={
                protocol: "ws",
                operation: "218",
                result: {
                    user:user
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        },
        //发送落子信息,step为本次走棋的信息，包括{oldx,oldy,newx,newy}
        sendPlayChess(step){
            let data={
                protocol:"ws",
                operation:"212",
                result:{
                    step:step
                }
            }
            this.$data.socket.send(JSON.stringify(data));
        }
    },
    mounted: function () {
        var mycanvas=document.getElementById("chess");
        var ctx=mycanvas.getContext("2d");
        var image = new Image();
        image.src = 'img/png/棋盘.png';
        image.onload = function() {
            // 图像加载完成后，在此处进行绘制操作
            ctx.drawImage(image, 0, 0);
        }
        this.initchess();
        var tmp=this;
        //初始化用户数据
        $.ajax(
            {
                type:"get",
                url:"/getData",
                data:{
                },
                success:function (data) {
                    console.log("data:",data);
                    if (data === ""){
                        window.location.href="/index.html";
                    }else {
                        tmp.$data.board.player[0].id=data.id;
                        tmp.$data.board.player[0].name=data.name;
                        tmp.$data.board.player[0].fightnum=data.fightnum;
                        tmp.$data.board.player[0].victorynum=data.victorynum;
                        tmp.initall();
                        tmp.createSocket();
                    }

                }
            }
        )


    }
})