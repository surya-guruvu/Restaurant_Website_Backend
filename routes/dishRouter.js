// handles /dishes /dishes:dishId

const express=require('express');
const bodyParser=require('body-parser');

const mongoose=require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter=express.Router(); 
dishRouter.use(bodyParser.json());

const authenticate=require('../authenticate');

//////////////////////////////////////////////////////

dishRouter.route('/')
.get((req,res,next)=>{
	Dishes.find({})
	.populate('comments.author')   //This populates the commments.author with author from user
	.then((dishes)=>{
		res.StatusCode=200;
		res.setHeader("Content-Type","application/json");
		res.json(dishes); //takes input as json,and sents it as json response to the server.
	}, (err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,(req,res,next)=>{
	Dishes.create(req.body)
	.then((dish)=>{
		console.log("Dish Created");
		res.statusCode=200;
		res.setHeader("Content-Type","application/json");
		res.json(dish);
	},((err)=>next(err)))
	.catch((err)=>next(err));

})

.put(authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
	res.end('put operation is not supported on /dishes'); 
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.remove({})
    .then((resp) => {                          //doubt
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));  

});

//////////////////////////////////////////////////////

dishRouter.route('/:dishId')

.get((req,res,next)=>{
	Dishes.findById(req.params.dishId)   
	.populate('comments.author')
	.then((dish)=>{
		res.StatusCode=200;
		res.setHeader("Content-Type","application/json");
		res.json(dish); //takes input as json,and sents it as json response to the server.
	},((err)=>next(err)))
	.catch((err)=>next(err));
})

.post(authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403; 
	res.end('put operation is not supported on /dishes/'+req.params.dishId); 
})

.put(authenticate.verifyUser,(req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {    //doubt
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {                          //doubt
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));  

});

dishRouter.route('/:dishId/comments')
.get((req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish)=>{
		if(dish!=null){
			res.StatusCode=200;
			res.setHeader("Content-Type","application/json");
			res.json(dish.comments); 
		}
		else{
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,(req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.then((dish)=>{
		if(dish!=null){
			res.StatusCode=200;
			dish.comments.push(req.body);
			dish.save()
			.then((dish)=>{
				res.setHeader("Content-Type","application/json");
				res.json(dish); 
			},(err)=>next(err));
		}
		else{
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));

})

.put(authenticate.verifyUser,(req,res,next)=>{
	res.statusCode=403;
    res.end('PUT operation not supported on /dishes/'
        + req.params.dishId + '/comments');
})

.delete(authenticate.verifyUser,(req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.then((dish)=>{
		if(dish!=null){
			res.StatusCode=200;
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish)=>{
				res.setHeader("Content-Type","application/json");
				res.json(dish); 
            },(err)=>next(err));
		}
		else{
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));

});

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish)=>{
		if(dish!=null && dish.comments.id(req.params.commentId)!=null){
			res.StatusCode=200;
			res.setHeader("Content-Type","application/json");
			res.json(dish.comments); 
		}
		else if(dish==null){
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
		else{
			err=new Error('Dish ' + req.params.commentId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));
})

.post((req,res,next)=>{
	res.statusCode=403; 
	res.end('put operation is not supported on /dishes/'+req.params.dishId+'/comments'+req.params.commentId); 

})

.put(authenticate.verifyUser,(req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.then((dish)=>{
		if(dish!=null && dish.comments.id(req.params.commentId)!=null){
			res.StatusCode=200;
			if(req.body.rating){
				dish.comments.id(req.params.commentId).rating=req.body.rating;
			}
			if(req.body.comment){
				dish.comments.id(req.params.commentId).comment=req.body.comment;
			}
			dish.save()
			.then((dish)=>{
				res.setHeader("Content-Type","application/json");
				res.json(dish); 			
			},(err)=>next(err));
		}
		else if(dish==null){
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
		else{
			err=new Error('Dish ' + req.params.commentId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next)=>{
	Dishes.findById(req.params.dishId)
	.then((dish)=>{
		if(dish!=null && dish.comments.id(req.params.commentId)!=null){
			res.StatusCode=200;
			dish.comments.id(req.params.commentId)
			dish.save()
			.then((dish)=>{
				res.setHeader("Content-Type","application/json");
				res.json(dish); 			
			},(err)=>next(err));
		}
		else if(dish==null){
			err=new Error('Dish ' + req.params.dishId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
		else{
			err=new Error('Dish ' + req.params.commentId + ' not found');
			res.StatusCode=404;
			return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));

});


module.exports=dishRouter;