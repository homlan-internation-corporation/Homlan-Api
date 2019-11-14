'use strict';
const nodemailer = require('nodemailer');

const express = require('express');
const router = express.Router();

const pug = require('pug');

const compileNewsRequestEmail = pug.compileFile('./views/news-request-email.pug');

router.post('/', async (req, res) => {
    console.log(req.body);

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    let info = await transporter.sendMail({
        from: `"Homlan.com" homlansmtp@gmail.com`, // sender address
        to: process.env.EMAIL_RECIPIENT, // list of receivers
        subject: 'News Letter Request', // Subject line
        html: compileNewsRequestEmail({
            email: req.body.email
        }),
    }, (err, info) => {
        if (err)
            console.log(err);
        else
            console.log(info);
    });

    res.end();
});

module.exports = router;