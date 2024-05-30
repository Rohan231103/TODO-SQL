var express = require('express');
var mysql = require('mysql');
var bodyparser = require('body-parser');
const storage = require('node-persist');
storage.init( /* options ... */);

var con = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"",
    database:"todo_db"
})
con.connect();

var app = express();

app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:false}));

// var user_id = 0;
// var username = "";

// Admin Login Start

app.get('/',async function(req,res){
    var admin_id = await storage.getItem('ad_id');

    if(admin_id == undefined){
        res.render('login');
    }
    else{
        var userData = "select* from user";

        con.query(userData,function(error,results,field){
            if(error) throw error;
            res.render('dashboard',{results})
        })
    }
});

app.post('/', function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    var adminLogin = "select id,email,password from admin where email='"+email+"' && password='"+password+"'";

    con.query(adminLogin, async function(error,result,field){
        if (error) throw error;

        if(result.length==1){
            await storage.setItem('ad_id',result[0].id);
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

// Admin login End 


// Admin Dashboard
app.get('/dashboard',async function(req,res){
    var admin_id = await storage.getItem('ad_id');

    if(admin_id==undefined){
        res.send('Admin First Need To Login After Show Admin Dashboard!!')
    }
    else {
        var userData = "Select * from user"

        con.query(userData, function (error, results, field) {
            if (error) throw error;

            res.render('dashboard', { results });  // user data admin dashboard ma aama show karava jethi teadmin dashboard ma print thay

        });
    }
})

// ......

// Admin logout
app.get('/logout',async function(req,res){
    var admin_id = await storage.getItem('ad_id');

    if(admin_id==undefined){
        res.send("Admin already logout")
    }
    else{
        await storage.clear();

        res.send('Admin logout successfull !!');
        // res.redirect('login');
    }
});
// ....

// Admin Task...Add user

app.get('/userDashboard', function (req, res) {
    res.render('userDashboard');
});

app.get('/adduser', function (req, res) {
    var select = "select * from user"
    con.query(select, function (error, results, field) {
        if (error) throw error;

        res.render('index', { results });  

    });
});

app.post('/adduser',function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var select = "select email from user where email = ?";
    con.query(select,[email],function(error,result,field){
        if(error) throw error;

        if(result.length === 0){
            var insert = "insert into user(name,email,password) values('"+name+"','"+email+"','"+password+"')";
            con.query(insert,function(error,result,field){
                if(error) throw error;
                res.redirect('dashboard');
            });
        }
        else{
            res.send("Please try with another email address. This email address is already in use.")
        }
    })
})

// ...


// Update User Details

app.get('/update', function (req, res) {
    var select = "select * from user"
    con.query(select, function (error, results, field) {
        if (error) throw error;

        res.render('manageuser', { results });  

    });
});

app.get('/update/:id',function(req,res){
    var id = req.params.id;

    var select = "select * from user where id='"+id+"'";

    con.query(select,function(error,results,field){
        if (error) throw error;
        res.render('updateuser',{results});
    })
});

app.post('/update/:id',function(req,res){
    var id = req.params.id;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var update = "update user set name = '"+name+"',email='"+email+"',password='"+password+"' where id = '"+id+"'";

    con.query(update,function(error,results,field){
        if (error) throw error;
        res.redirect('/');
    })
})

app.get('/delete/:id',function(req,res){
    var id = req.params.id;
    var del = "delete from user where id ='"+id+"'";

    con.query(del,function(error,results,field){
        if (error) throw error;

        res.redirect('/');
    })
})
// ...

// Add Task

app.get('/addtask', function(req,res){
    var add = "select * from user";

    con.query(add,function(error,results,field){
        if (error) throw error;
        res.render("addtask",{results});
    })
})

app.post('/addtask',function(req,res){
    var task_name = req.body.task_name;
    var id = req.body.id;

    var insert = "insert into task(task_name,task_user) values ('"+task_name+"','"+id+"')";

    con.query(insert,function(error,results,field){
        if(error) throw error;
        res.redirect('/viewtask')
    })
})

app.get('/viewtask',function(req,res){
    var insert = "select * from task";
    // var insert="select task.* , user.* from task join user on task.task_user=user.id ";

    con.query(insert,function(error,results,field){
        if(error) throw error;
        res.render('viewtask',{results});
    })
});

// ...

// Update Task

app.get('/showtask', function (req, res) {
    var select = "select * from task"
    con.query(select, function (error, results, field) {
        if (error) throw error;

        res.render('showtask', { results });  

    });
});

app.get('/managetask/:task_id',function(req,res){
    var task_id = req.params.task_id;

    var select = "select * from task where task_id='"+task_id+"'";

    con.query(select,function(error,results,field){
        if (error) throw error;
        res.render('managetask',{results});
    })
});

app.post('/managetask/:task_id',function(req,res){

    var task_id = req.params.task_id;
    var task_name = req.body.task_name;
    var task_user = req.body.task_user;
    
    var update = "update task set task_name='"+task_name+"', task_user='"+task_user+"' where task_id='"+task_id+"'";


    con.query(update,function(error,results,field){
        if (error) throw error;
        res.redirect('/');
    })
});

app.get('/deletetask/:id',function(req,res){
    var task_id = req.params.id;

    var query = "delete from task where task_id="+task_id;
    console.log(query);

    con.query(query,function(error,results,field){
        if(error) throw error;
        res.redirect('/showtask');
    })
});

app.listen(4000);