import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { EmailClient } from '@azure/communication-email';

@Injectable()
export class MailService {
  private emailClient: EmailClient;

  constructor() {
    const connectionString =
      process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure connection string is not set in the environment.');
    }
    this.emailClient = new EmailClient(connectionString);
  }

  async sendEmailVerification(email: string, emailToken: string) {
    const verificationLink = `http://localhost:3000/auth/verify/${emailToken}`;

    const emailMessage = {
      senderAddress:
        'DoNotReply@3cfe3ce4-f778-4913-9f98-7918fc0c49e2.azurecomm.net', // Set a valid sender address
      content: {
        subject: 'Email Verification',
        plainText: `Please verify your email by clicking on the link: ${verificationLink}`,
        html: `
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
              }
              .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
              }
              .header {
                background-color: #0033a0;
                color: #ffffff;
                padding: 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 20px;
                text-align: center;
              }
              .content p {
                font-size: 16px;
                line-height: 1.6;
              }
              .content a {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #0033a0;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                font-size: 16px;
              }
              .content a:hover {
                background-color: #002570;
              }
              .footer {
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #777;
                background: #f4f4f4;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Thank you for signing up! To get started, please verify your email address by clicking the button below.</p>
                <a href="${verificationLink}" target="_blank">Verify Email</a>
              </div>
              <div class="footer">
                <p>If you didn’t request this email, please ignore it.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      },
      recipients: {
        to: [{ address: email }],
      },
    };

    try {
      const poller = await this.emailClient.beginSend(emailMessage);
      const result = await poller.pollUntilDone();
      console.log('Email sent successfully', result);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    const emailMessage = {
      senderAddress: process.env.FROM_EMAIL, // Must be a verified sender in Azure
      content: {
        subject: 'Password Reset Request',
        plainText: `You requested a password reset. Use the following link to reset your password: ${resetLink}`,
        html: `
         <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #0033a0;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        text-align: center;
        color: #555555;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
      }
      .reset-button {
        display: inline-block;
        margin: 20px 0;
        padding: 10px 20px;
        background-color: #0033a0;
        color: #ffffff !important; /* Make sure text is white for visibility */
        text-decoration: none;
        font-size: 16px;
        border-radius: 4px;
        font-weight: bold; /* To make the text stand out more */
        transition: background-color 0.3s ease;
      }
      .reset-button:hover {
        background-color: #002570;
      }
      .reset-button:active {
        background-color: #001A4B; /* A slightly darker shade when clicked */
      }
      .footer {
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #777777;
        background-color: #f9f9f9;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Password Reset</h1>
      </div>
      <div class="content">
        <p>
          Hello,<br>
          We received a request to reset your password. Click the button below to reset it:
        </p>
        <a href="${resetLink}" class="reset-button" target="_blank" style="color: #ffffff !important;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>Thank you for using our service.</p>
        <p>&copy; ${new Date().getFullYear()} Trustify</p>
      </div>
    </div>
  </body>
</html>

        `,
      },
      recipients: {
        to: [{ address: to }],
      },
    };

    try {
      const poller = await this.emailClient.beginSend(emailMessage); // Send email
      const result = await poller.pollUntilDone(); // Wait for the email to be sent
      console.log('Password reset email sent successfully:', result);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
