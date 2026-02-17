import { v2 as cloudinary } from 'cloudinary';
import { Logger, withTrace } from '@/lib/logger';

const logger = new Logger("StorageService");

export class StorageService {
    private static configured = false;

    private static configure() {
        if (this.configured) return;

        if (!process.env.CLOUDINARY_URL) {
            throw new Error("CLOUDINARY_URL is not defined");
        }

        cloudinary.config({
            secure: true
        });
        this.configured = true;
    }

    static async upload(file: File | Buffer | Uint8Array, folder: string = "ielts-lover/exercises"): Promise<string> {
        return withTrace(async () => {
            try {
                this.configure();

                let buffer: Buffer;

                if (file instanceof Buffer) {
                    buffer = file;
                } else if (file instanceof Uint8Array) {
                    buffer = Buffer.from(file);
                } else {
                    const arrayBuffer = await file.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);
                }

                const result = await new Promise<string>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder,
                            resource_type: "auto",
                        },
                        (error, result) => {
                            if (error) {
                                logger.error("Cloudinary upload error", { error });
                                reject(error);
                            } else {
                                resolve(result!.secure_url);
                            }
                        }
                    );

                    uploadStream.end(buffer);
                });

                logger.info("File uploaded successfully", { folder });
                return result;
            } catch (error) {
                logger.error("Failed to upload file", { error, folder });
                throw error;
            }
        });
    }
}
