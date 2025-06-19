const express = require('express');
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
var mail = module.exports = {

	forgotPassMail: function(data) {
		var template = fs.readFileSync(path.join(__dirname, `../public/email/forgot_password.html`), 'utf8');
		$ = cheerio.load(template);
		
		$('#receiver').text(data.name); 
		$('#message').text(data.message);
 		$('#btn-link').attr('href', data.link).text(data.reset_text);
		$('#expire-message').text(data.expire_message);
		$('#footer').text(data.footer);
		$('#support_team').text(data.support_team);

 		var content = $.html();
		 return mail.send_email(data.email, data.subject, content);
		
		
	},
	
	updatePassMail: function(data) {
		
		var template = fs.readFileSync(path.join(__dirname, `../public/email/update_password.html`), 'utf8');
		$ = cheerio.load(template);
		
 		$('#receiver').text(data.name);
		$('#message').text(data.message);
		$('#pass-reset-support-mail').text(data.pass_reset_support);
		$('#btn-link').attr('href', data.link).text(data.login_text);
 		$('#footer').text(data.footer);
		$('#support_team').text(data.support_team);
		var content = $.html();
		return mail.send_email(data.email, data.subject, content);
	},
	updateTwoFactorMail: function(data) {
		
		var template = fs.readFileSync(path.join(__dirname, `../public/email/update_twoFactor.html`), 'utf8');
		$ = cheerio.load(template);
		
 		$('#receiver').text(data.name);
		$('#message').text(data.message);
		$('#twofactor-reset-support-mail').text(data.twoFactor_reset_support);
 		$('#footer').text(data.footer);
		$('#support_team').text(data.support_team);
		var content = $.html();
		return mail.send_email(data.email, data.subject, content);
	},

	registrationMail: function(data) {
		
		var template = fs.readFileSync(path.join(__dirname, `../public/email/registration.html`), 'utf8');
		$ = cheerio.load(template);

		$('#receiver').text(data.name);
		$('#message').text(`${data.message}`);
  		$('#footer').html(data.footer);
		$('#support_team').text(data.support_team);
		var content = $.html();
		return mail.send_email(data.email, data.subject, content);
	},


    send_email: async function(email, subject, content) {
        const transporter = nodemailer.createTransport({
            // host: process.env.MAIL_HOST,
            // port: process.env.MAIL_PORT,
            // secure: true, 
            // auth: {
            //     user: process.env.MAIL_USERNAME,
            //     pass: process.env.MAIL_PASSWORD,
            // },
            // tls: {
            //     rejectUnauthorized: false 
            // }
			service: 'gmail',
            auth: {
                user: 'itech012025@gmail.com',
                pass: 'ribv asst wluh wjxb'
            }
        });
			
		try {
            // await transporter.sendMail({
            //     from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            //     to: email,
            //     subject: subject,
            //     html: content,
            // }); 
			let mailStatus = await transporter.sendMail({
                from: "kshrmadot@gmail.com",
                to: email,
                subject: subject,
                html: content,
            }); 0
            // console.log(`Email sent to: ${email}`);
            return true;
        } catch (error) {
            console.log("Error sending email: "+ error);
            throw new Error("Failed to send email.");
        }
			
			
		
	}
	
};