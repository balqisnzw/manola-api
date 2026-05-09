const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "manola.noreply@gmail.com",
    pass: process.env.EMAIL_PASS, // App Password dari Google
  },
});

const sendResetPasswordEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"Manola Store" <${process.env.EMAIL_USER || "manola.noreply@gmail.com"}>`,
    to,
    subject: "Reset Password - Manola",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Password</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset password akun Anda di Manola.</p>
        <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #fff; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Atau salin link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
        <p>Link ini hanya berlaku selama <strong>1 jam</strong>.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">© Manola Store</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendResetPasswordEmail,
};
