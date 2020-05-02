//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser:true, useUnifiedTopology:true});
const itemsSchema = { name: String };
const Item = mongoose.model("Item", itemsSchema);
const eat = new Item({name: "Eat"});
const pray = new Item({name: "Pray"});
const love = new Item({name: "Love"});

const defaultArray = [eat,pray,love];

const listSchema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, docs){
    if(docs.length === 0){
      Item.insertMany(defaultArray, function(err){
        if(err){console.log(err)}
        else{console.log("Successfully inserted the default records.")}
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: docs});
    }
  });
});

app.get("/:listName", function(req, res){
  const customListName = _.capitalize(req.params.listName);
  List.findOne({name:customListName}, function(err, dupliList){
    if(!err){
      if(!dupliList){
        //Create new List
        const list = new List({
          name: customListName,
          items: defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list",{listTitle:dupliList.name, newListItems:dupliList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listTitle}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){console.log(er)}
      else{
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
