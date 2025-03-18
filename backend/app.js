import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import multer from 'multer';
//import apikeys from './apikey.json' assert { type: "json" };
import { assert } from 'console';



const apikeys = JSON.parse(fs.readFileSync('./apikey.json', 'utf-8'));


const SCOPE = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}

dotenv.config(); // Load environment variables

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* export async function uploadToyImage(filePath, fileName, folderID) {
    const authClient = await authorize();
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileMetadata = {
            name:fileName,
//parents:["1vJRLZXRYYUJlluOs_5jq9KIstr27waNG?lfhs=2"]
            parents: [folderID]
        };
        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(filePath)
        };

        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, (err, file) => {
            if (err) {
                console.error('Error uploading image:', err);
                reject(err);
            } else {
                console.log('Image uploaded:', file.data); // to confirm that the image has been successfully uploaded to Google Drive 
                resolve(file.data.id);
            }
        });
    });
}
 */

export async function uploadToyImage(filePath) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { folder: 'toy_shop' }, (error, result) => {
            if (error) {
                console.error('Error uploading image:', error);
                reject(error);
            } else {
                console.log('Image uploaded:', result); // to confirm that the image has been successfully uploaded to Cloudinary
                resolve(result.secure_url); // Return the secure URL of the uploaded image
            }
        });
    });
}


// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: './uploads/', // Temporary storage before uploading to Drive
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
export default cloudinary;