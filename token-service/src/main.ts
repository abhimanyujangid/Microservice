import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const rmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";

  app.useGlobalFilters(new HttpExceptionFilter());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: "token_queue",
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();
  const port = Number(process.env.PORT || 3002);
  await app.listen(port, "0.0.0.0");
}
bootstrap();
