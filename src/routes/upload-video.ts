import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import fs from "node:fs";
import { prisma } from "../lib/prisma";

const MAX_FILE_SIZE = 1_048_576 * 25; // 25MB
const UPLOAD_DIRECTORY = path.resolve(__dirname, "../../tmp");
const ALLOWED_EXTENSION = ".mp3";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });
  app.post("/videos", async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: "Missing file input." });
    }

    const extension = path.extname(data.filename);

    if (extension !== ALLOWED_EXTENSION) {
      return reply.status(400).send({
        error: "Invalid input type, please upload a MP3.",
      });
    }

    const fileBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;
    const uploadDestination = path.resolve(UPLOAD_DIRECTORY, fileUploadName);

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    });

    return {
      video,
    };
  });
}
