var express = require('express');
var mysql = require('mysql');
var bodyParser= require('body-parser');
const storage = require('node-persist');
storage.init( /* options ... */);

var app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:false}))

var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"todo_db"
});

con.connect();

// User Login

app.get('/',async function(req,res){
    var user_id = await storage.getItem('id');

    if(user_id == undefined){
        res.render('login');
    }
    else{
        var userData = "select* from task";

        con.query(userData,function(error,results,field){
            if(error) throw error;
            res.render('dashboard',{results})
        })
    }
});

app.post('/', function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    var userLogin = "select id,email,password from user where email='"+email+"' && password='"+password+"'";

    con.query(userLogin, async function(error,result,field){
        if (error) throw error;

        if(result.length==1){
            await storage.setItem('id',result[0].id);
            res.redirect('/dashboard');
        }
        else{
            res.redirect('/');
        }
    })
})

app.get('/login',function(req,res){
    res.render('login');
})


// ...

// Dashboard
app.get('/dashboard',async function(req,res){
    var user_id = await storage.getItem('id');

    if(user_id==undefined){
        res.send('User First Need To Login After Show Dashboard!!')
    }
    else {
        var userData = "Select * from task"

        con.query(userData, function (error, results, field) {
            if (error) throw error;

            res.render('dashboard', { results }); 

        });
    }
});

app.get('/dashboard',function(req,res){
    var insert="select task.* , user.* from task join user on task.task_user=user.id WHERE task.status NOT IN(2,4)";

    con.query(insert,function(error,results,field){
        if(error) throw error;
        res.render('dashboard',{results});
    })
});

app.get('/updatestatus/:role/:id',function(req,res){
    var status = req.params.role;
    var id = req.params.id;

    var query = "update task set status='"+status+"' where task_id="+id;

    con.query(query,function(error,result,field){
        if(error) throw error;
        res.redirect('/dashboard');
    })
})
// ...

// User logout
app.get('/logout',async function(req,res){
    var user_id = await storage.getItem('id');

    if(user_id==undefined){
        res.send("User already logout")
    }
    else{
        await storage.clear();

        res.send('User logout successfull !!');
        // res.redirect('login');
    }
});
// ....

app.listen(2000);