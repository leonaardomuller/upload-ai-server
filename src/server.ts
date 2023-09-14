import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import {
  getAllPromptsRoute,
  uploadVideoRoute,
  createTranscriptionRoute,
  generateAICompletionRoute,
} from "./routes";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAICompletionRoute);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP Server Running! 🚀");
});
