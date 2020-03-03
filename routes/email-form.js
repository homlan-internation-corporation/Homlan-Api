'use strict';
const https = require("https")

const nodemailer = require('nodemailer');

const express = require('express');
const router = express.Router();

const Joi = require('@hapi/joi');
const formSchema = Joi.object({
    name: Joi.string().required(),
    company: Joi.string().allow(''),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    reason: Joi.string().allow('')
})

const pug = require('pug');
const compileEmailForm = pug.compileFile('./views/email-form.pug');

//Request Dump
router.post('/', async (req, res, next) => {
    const data = JSON.stringify(req.body);

    const options = {
        hostname: process.env.REQUEST_BIN_URL,
        port: 443,
        path: "/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
        },
    }

    const request = https.request(options)
    request.write(data)
    request.end()
    next()
})

//Validate Format
router.post('/', async (req, res, next) => {
    console.log(req.body);
    const result = formSchema.validate(req.body);
    if (result.error) {
        res.status(422).send('Invalid Format')
        console.error(result.error);
    } else {
        next()
    }
})

//Send Email
router.post('/', async (req, res, next) => {
    let transporter = nodemailer.createTransport({
        service: 'SendPulse',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: `"${req.body.name}" ${process.env.SMTP_SENDER}`, // sender address
        to: process.env.EMAIL_RECIPIENT, // list of receivers
        subject: `${req.body.name}寄來詢價單!`, // Subject line
        html: compileEmailForm(req.body),
    }, (err, info) => {
        if (err) {
            console.log(err);
            res.status(500).send('Something broke!')
        } else {
            res.info = info
            next()
        }
    });
})

//Success
router.post('/', async (req, res) => {
    console.log(res.info);
    res.send("Success!")
});

module.exports = router;