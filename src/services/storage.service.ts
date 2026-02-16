import { v2 as cloudinary } from 'cloudinary';

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

    static async upload(file: File, folder: string = "ielts-lover/exercises"): Promise<string> {
        this.configure();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result!.secure_url);
                    }
                }
            );

            uploadStream.end(buffer);
        });
    }
}
