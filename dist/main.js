"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    const config = app.get(config_1.ConfigService);
    app.setGlobalPrefix("api/v1");
    app.enableCors({
        origin: config.get("CORS_ORIGIN", "http://localhost:3000"),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Business Loan API")
        .setDescription("API documentation for Business Loan system")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
        const port = config.get("PORT", 4000);
        await app.listen(port);
        common_1.Logger.log(`Business Loan API running on http://localhost:${port}/api/v1`, "Bootstrap");
    }
    await app.init();
    return app.getHttpAdapter().getInstance();
}
if (!process.env.VERCEL) {
    bootstrap();
}
let server;
exports.default = async (req, res) => {
    if (!server) {
        server = await bootstrap();
    }
    return server(req, res);
};
//# sourceMappingURL=main.js.map