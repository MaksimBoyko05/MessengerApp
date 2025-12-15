import { Worker } from "bullmq";
import IORedis from "ioredis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
const connection = new IORedis();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { email, subject, text } = job.data;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });
    console.log(`Email sent to ${email}`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
    },
  }
);

worker.on("failed", (job, err) => {
  console.error(` Job failed: ${job.id}`, err);
});
