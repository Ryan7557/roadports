const nodemailer = require('nodemailer');

module.exports = function(agenda) {
    agenda.define('send-status-email', async (job) => {
        const { email, name, status, potholeId } = job.attrs.data;
        
        console.log(`[Job: send-status-email] Starting email job for ${email} - Pothole ${potholeId}`);

        try {
            // Use Ethereal fake SMTP for testing if no real SMTP is provided
            let transporter;
            if (process.env.SMTP_HOST) {
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: false, // Use STARTTLS on port 587
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    },
                    tls: {
                        rejectUnauthorized: false // Allow self-signed certs in dev
                    }
                });
            } else {
                // Generate test SMTP service account from ethereal.email
                let testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
            }

            // Map internal statuses to friendly messages
            const statusMessages = {
                'reported': 'has been successfully received and logged.',
                'verified': 'has been verified by our team and is awaiting assignment.',
                'assigned': 'has been assigned to a maintenance crew.',
                'in_progress': 'is currently being repaired by our crew on site.',
                'repaired': 'has been successfully repaired! Thank you for keeping our roads safe.',
                'rejected': 'has been reviewed and rejected (e.g., duplicate report or not a pothole).'
            };

            const statusText = statusMessages[status] || 'has been updated.';

            const fromAddress = process.env.SMTP_USER
                ? `"Roadports" <${process.env.SMTP_USER}>`
                : '"Roadports System" <no-reply@roadports.gov>';

            let info = await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject: `Update on your Pothole Report (${status.replace('_', ' ').toUpperCase()})`,
                text: `Hello ${name || 'Citizen'},\n\nYour recent pothole report ${statusText}\n\nThank you for your contribution to Roadports!\n\nReference ID: ${potholeId}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Roadports AI Update</h2>
                        <p>Hello <strong>${name || 'Citizen'}</strong>,</p>
                        <p>Your recent pothole report <strong>${statusText}</strong></p>
                        <hr />
                        <p style="font-size: 12px; color: gray;">Thank you for your contribution to Roadports!<br/>Reference ID: ${potholeId}</p>
                    </div>
                `
            });

            console.log(`✅ Email sent successfully to ${email}`);
            if (!process.env.SMTP_HOST) {
                console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send email to ${email}:`, error);
            throw error; // Let agenda retry if configured
        }
    });
};
