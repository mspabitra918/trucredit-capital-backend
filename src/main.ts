import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Express } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");

  const corsOrigin = config.get<string>("CORS_ORIGIN");
  const stripSlash = (u: string) => u.trim().replace(/\/+$/, "");
  const envOrigins = corsOrigin
    ? corsOrigin.split(",").map(stripSlash).filter(Boolean)
    : [];
  const defaultOrigins = [
    "http://localhost:3000",
    "https://trucreditcapital.com",
    "https://www.trucreditcapital.com",
    "https://trucredit-capital-frontend.vercel.app",
    "https://trucredit-capital-backend-six.vercel.app",
  ];
  const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const normalized = stripSlash(origin);
      try {
        const host = new URL(normalized).hostname;
        if (allowedOrigins.includes(normalized) || /\.vercel\.app$/.test(host)) {
          return cb(null, true);
        }
      } catch {
        // fall through to deny
      }
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ✅ Swagger setup START
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Business Loan API")
    .setDescription("API documentation for Business Loan system")
    .setVersion("1.0")
    .addBearerAuth() // optional (JWT support)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api/docs", app, document);
  // ✅ Swagger setup END

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const port = config.get<number>("PORT", 4000);
    await app.listen(port);

    Logger.log(
      `Business Loan API running on http://localhost:${port}/api/v1`,
      "Bootstrap",
    );
  }

  await app.init();
  return app.getHttpAdapter().getInstance();
}

// For local development
if (!process.env.VERCEL) {
  bootstrap();
}

// For Vercel
let server: Express;
export default async (req: any, res: any) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
};
