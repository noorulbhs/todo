//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolist",{useUnifiedTopology:true});

const todoSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true]
  }
});

const Todo=mongoose.model("Todo",todoSchema);

const BuyFood=new Todo({
  name:"Buy Food"
});
const CookFood=new Todo({
  name:"Cook Food"
});
const EatFood=new Todo({
  name:"Eat Food"
});

const day = date.getDate();

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {

  Todo.find(function(err,itemslist){
    if(err){
      console.log(err);
    }
    else {
      if(itemslist.length===0){
        Todo.insertMany([BuyFood,CookFood,EatFood],function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Inserted Succesfully");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: day, newListItems: itemslist});
      }

    }
  })


});

const listSchema=new mongoose.Schema({
  name:String,
  items:[todoSchema]
});

const List=mongoose.model("List",listSchema);

app.get("/:customlistname",function(req,res){
  const customlistname=_.capitalize(req.params.customlistname);
  List.findOne({name:customlistname},function(err,founditem){
    if(!err){
      if(!founditem){
        const list=new List({
          name:customlistname,
          items:[BuyFood,CookFood,EatFood]
        });
        list.save();
        res.redirect("/"+customlistname);
      }
      else {
        res.render("list",{listTitle:founditem.name,newListItems:founditem.items});
      }
    }
  })
})

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName=req.body.list;

    const newtodo=new Todo({
      name:item
    });
    if(listName===day){
      newtodo.save();
      res.redirect("/");
    }
    else {
      List.findOne({name:listName},function(err,foundlist){
        foundlist.items.push(newtodo);
        foundlist.save();
        res.redirect("/"+listName);
      })
    }


    //items.push(item);
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const checkItemTitle=req.body.title;
  if(checkItemTitle===day)
  {
    Todo.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log("Deleted Succesfully");
      }
    })
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name:checkItemTitle},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
      if(!err){
        console.log("Succesfully Deleted from the List");
        res.redirect("/"+checkItemTitle);
      }
    })

  }


})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
