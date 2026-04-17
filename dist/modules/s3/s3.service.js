"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
let S3Service = S3Service_1 = class S3Service {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.bucket = this.config.get('AWS_S3_BUCKET', 'trucredit-documents');
        this.s3 = new client_s3_1.S3Client({
            region: this.config.get('AWS_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.config.get('AWS_ACCESS_KEY_ID', ''),
                secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY', ''),
            },
        });
    }
    async uploadFile(file, applicationId = 'temp') {
        const ext = file.originalname.split('.').pop() || 'pdf';
        const s3Key = `applications/${applicationId}/${(0, uuid_1.v4)()}.${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ServerSideEncryption: 'AES256',
        }));
        this.logger.log(`Uploaded ${s3Key} (${file.size} bytes)`);
        return { s3Key };
    }
    async getPresignedUrl(s3Key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: s3Key,
            ResponseContentType: 'application/pdf',
            ResponseContentDisposition: 'inline',
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 600 });
        return url;
    }
    async deleteFile(s3Key) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: s3Key,
        }));
        this.logger.log(`Deleted ${s3Key}`);
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map