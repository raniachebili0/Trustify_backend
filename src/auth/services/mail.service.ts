import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 587,
      auth: {
        user:  'chatesprit3@gmail.com', // Remplace par ton email de test
        pass: 'vdhu sqjt wuid vjkr',
      },
    });
  }

  async sendEmailVerification(email: string, emailToken: string) {
    const verificationLink = `http://localhost:3000/auth/verify/${emailToken}`;
    const mailOptions = {
      from:  'Trustify-backend service service <chatesprit3@gmail.com>',
      to: email,
      subject: 'Verify Email',
    
      html: `<p>Hi!</p><p>Thanks for your registration.</p><p><a href="${verificationLink}">Click here to activate your account</a></p>`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
