const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../model/tasks')

router.post('/tasks',auth,async(req,res) =>{
   const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
       await task.save()
       res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }  

})

//GET /tasks?complete=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks',auth,async(req,res) =>{
       
    const match = {}
    const sort = {}

    if(req.query.complete){
           match.complete = req.query.complete === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'?-1:1
    }

    try{
        await req.user.populate({
            path:'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id',auth,async(req,res) =>{
    
    const _id = req.params.id
    try{
       const task = await Task.findOne({_id, owner: req.user._id})
       if(!task){
        return res.status(404).send()
    }
    res.send(task)
    }catch(e){
        res.status(500).send()
    }
 })

router.patch('/tasks/:id',auth,async(req,res) =>{
    const updates = Object.keys(req.body)
    const allowupdate = ['description','complete']
    const isvalidoperation = updates.every((update) => allowupdate.includes(update))
    
    if(!isvalidoperation){
        return res.status(400).send({ error : 'Invalid operation!'})
    }
    
    try{

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
       if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
         await task.save()
           res.send(task)  
    }catch(e){
        res.status(400).send(e)
    }
 })

router.delete('/tasks/:id',auth,async(req,res) =>{
    try{
       const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

       if(!task){
           return res.status(404).send()
       }
       res.send(task)

    }catch(e){
         return res.status(500).send()
    }
})

module.exports = router
