import { Consumer, Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";

import prismaClient from "../prisma";

const kafka = new Kafka({
  brokers: ["kafka-7c28c8f-aqibjaved0910-d965.f.aivencloud.com:28872"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./src/services/kafka/ca.pem"), "utf-8")],
  },
  sasl: {
    username: "avnadmin",
    password: "AVNS_ze3C1wGdls1YE113XPl",
    mechanism: "plain",
  },
});

let producer: Producer | null = null;

const createProducer = async () => {
  console.log("\nStarting the Kafka Producer Service");
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

export const produceMessage = async (message: string) => {
  const producer = await createProducer();
  console.log("Kafka Producer connected successfully.");

  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });

  console.log("Produce the Message to Kafka Broker.");
  return true;
};

const createConsumer = async () => {
  console.log("\n\nStarting the Kafka Consumer Service");
  const consumer = kafka.consumer({ groupId: "default" });

  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  return consumer;
};

const commitToDatabase = async (
  message: string,
  consumer: Consumer,
  pause: any
) => {
  try {
    await prismaClient.message.create({
      data: {
        text: message,
      },
    });
  } catch (error) {
    console.log("Error is : ", error);
    // pausing the consumer service for 1 min
    pause();
    setInterval(() => {
      consumer.resume([{ topic: "MESSAGES" }]);
    }, 60 * 1000);
  }
};

export const startConsumerSrv = async () => {
  const consumer = await createConsumer();
  console.log("\nKafka Consumer connected successfully.");

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      const msg = message.value?.toString();
      const payload: { message: string } = JSON.parse(msg);

      //   pushing the message from Kafka into the db
      await commitToDatabase(payload.message, consumer, pause);
    },
  });
};

export default kafka;
