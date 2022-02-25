var express = require("express");
var router = express.Router();

var user_md = require("../models/user");
var post_md = require("../models/post")
var helper = require ("../helpers/helper");

const { param } = require("express/lib/request");
const { getAllPosts } = require("../models/post");

router.get("/", function(req,res){
    var data = post_md.getAllPosts();
    data.then(function(posts){
        var data = {
            posts: posts, 
            error: false
        }
        res.render("admin/dashboard", {data: data});
    }).catch(function(err){
        res.render("admin/dashboard", {data: {error:"GET posts data error"}});
    })
    
})
//Signup server 
router.get("/signup", function(req, res){
    res.render("signup", {data:{}});
})
router.get("/test", function(req, res){
    res.render("test");
})

router.post("/signup", function(req, res){
    var user = req.body;

    if(user.email.trim().length == 0)
    {
        res.render("signup",{data:{error: "Email is required."}});
    }

    if(user.passwd != user.repasswd && user.passwd.trim().lenth != 0) {
        res.render("signup",{data:{error: "Password is not match."}});
    }

    
    //crype pass 
    var password = helper.hash_password(user.passwd);
    //insert DB
    user = {
        email: user.email,
        password: password,
        first_name: user.firstname,
        last_name: user.lastname
    }
    var result = user_md.addUser(user);

    result.then(function(data){
        res.redirect("/admin/signin");
    }).catch(function(error){
        res.render("signup", {data:{error: error}});
    });
    
})

//Sign in server
router.get("/signin", function(req, res){
    res.render("signin", {data:{}});
});

router.post("/signin", function(req, res){
    var params =req.body;

    if(params.email.trim().length == 0) {
        res.render("signin", {data: {error: "Please enter an email."}});
    }else {
        var data = user_md.getUserByEmail(params.email);
        if(data){
            data.then(function(users){
                var user =users[0];
                var status = helper.compare_password(params.password, user.password);

                if(!status) {
                    res.render("signin", {data: {error: "Password Wrong."}});
                }else {
                    req.session.user = user;
                    console.log(req.session.user); 
                    res.redirect("/admin/");
                }
            });

        }else {
            res.render("signin", {data: {error: "User not exists."}});
        }
        
    }


})
//Add new post 
router.get("/post/new", function(req, res){
    res.render("admin/post/new", {data: {error: false}});
});

router.post("/post/new", function(req, res){
    var params = req.body
    if(params.title.trim().length ==0 || params.content.trim().length == 0 || params.author.trim().length == 0)
    {
        var data = {
            error: "Must fill all of the text fields."
        };  
        res.render("admin/post/new", {data: data});
    }else {
        var now = new Date(); //update current time
        params.created_at = now; 
        params.updated_at = now;
    
        var data = post_md.addPost(params); 
        data.then(function(result){
            res.redirect("/admin");
        }).catch(function(err)
        {
            var data = {
                error: "Could not add post."
            };
    
            res.render("admin/post/new", {data: data});
        });
    }
    
   
});

//Edit a post 
router.get("/post/edit/:id", function(req, res){
    var params = req.params; 
    var id = params.id; 

    var data = post_md.getPostbyID(id);

    if(data) {
        data.then(function(posts){
            var post = posts[0];

            var data = {
                post:post,
                error: false 
            }

            res.render("admin/post/edit", {data:data});
        }).catch(function(err){
            var data= {
                error: "Could not get post by ID"
            }
            res.render("admin/post/edit", {data:data});
        })
    }
    else {
        var data= {
            error: "Could not get post by ID"
        }
        res.render("admin/post/edit", {data:data});
    }

});

module.exports = router;
