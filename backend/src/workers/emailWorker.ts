import { Worker } from "bullmq";
import * as IORedis from "ioredis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Job } from "bullmq";

dotenv.config({ path: ".env" });

const redisWorkerConfig: IORedis.RedisOptions = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
};

const connection = new IORedis.Redis(redisWorkerConfig);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
    "emailQueue",
    async (job: Job) => {
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
        connection,
    }
);

worker.on("failed", (job, err) => {
    console.error(` Job failed: ${job?.id}`, err);
});
