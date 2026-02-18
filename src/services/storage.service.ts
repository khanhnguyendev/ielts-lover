import { STORAGE_FOLDERS } from '@/lib/constants';
import { v2 as cloudinary } from 'cloudinary';

export class StorageService {
    private configured = false;

    private configure() {
        if (this.configured) return;

        if (!process.env.CLOUDINARY_URL) {
            throw new Error("CLOUDINARY_URL is not defined");
        }

        cloudinary.config({
            secure: true
        });
        this.configured = true;
    }

    async upload(file: File | Buffer | Uint8Array, folder: string = STORAGE_FOLDERS.EXERCISES): Promise<string> {
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
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                }
            );

            uploadStream.end(buffer);
        });

        return result;
    }
}
