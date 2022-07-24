const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) =>{
    res.status(200).json({
        message:'Places get!'
    });
});

router.post('/', (req, res, next) =>{
    const place = {
        modalityId: req.body.modalityId,
        name: req.body.name
    }
    res.status(201).json({
        message:'Places post!',
        createdPlace:place
    });
});

router.get('/:orderId', (req, res, next) =>{
    res.status(200).json({
        message:'Places details!',
        id: req.params.orderId
    });
});

router.delete('/:orderId', (req, res, next) =>{
    res.status(200).json({
        message:'Place deleted!',
        id: req.params.orderId
    });
});




module.exports = router;