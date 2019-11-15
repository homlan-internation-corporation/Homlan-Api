'use strict';
const nodemailer = require('nodemailer');

const express = require('express');
const router = express.Router();

const pug = require('pug');

const compileEmailForm = pug.compileFile('./views/email-form.pug');

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
        from: `"${req.body.name}" homlansmtp@gmail.com`, // sender address
        to: process.env.EMAIL_RECIPIENT, // list of receivers
        subject: `${req.body.name}寄來詢價單!`, // Subject line
        html: compileEmailForm(req.body),
    }, (err, info) => {
        if (err)
            console.log(err);
        else
            console.log(info);
    });

    res.end();
});

module.exports = router;