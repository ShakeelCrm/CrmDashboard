import nodemailer from "nodemailer";
import { config } from "../config/env.config";
// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail as an example
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Function to send a simple text email
export const sendTextEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            to,
            subject,
            text,
        };
        const result = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: result.messageId,
            recipients: result.envelope.to,
        };
    }
    catch (error) {
        console.error("Error sending text email:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};
// Function to send an email with document attachment
export const sendDocumentEmail = async (to, subject, text, documentPath, documentName) => {
    try {
        const mailOptions = {
            to,
            subject,
            text,
            attachments: [
                {
                    filename: documentName || "document.pdf",
                    path: documentPath,
                },
            ],
        };
        const result = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: result.messageId,
            recipients: result.envelope.to,
        };
    }
    catch (error) {
        console.error("Error sending document email:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};
// Generic send email function
export const sendEmail = async (options) => {
    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM || config.emailFrom || '"noreply" <noreply@example.com>',
            ...options,
        });
        return {
            success: true,
            messageId: result.messageId,
            recipients: result.envelope.to,
        };
    }
    catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};
