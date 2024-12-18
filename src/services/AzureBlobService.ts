import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalFileService {
  private readonly uploadDirectory = path.join(__dirname, '..', '..', 'uploads'); // Local upload directory

  constructor() {
    // Check if the upload directory exists, otherwise create it
    if (!fs.existsSync(this.uploadDirectory)) {
      fs.mkdirSync(this.uploadDirectory, { recursive: true });
    }
  }

  /**
   * Uploads a file to the local server directory.
   * @param fileBuffer The content of the file as a buffer.
   * @param fileName The name of the file.
   * @returns The file ID (name) and its relative path.
   */
  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<{ fileId: string; relativePath: string }> {
    try {
      // Full path to store the file
      const filePath = path.join(this.uploadDirectory, fileName);

      // Write the file to the file system
      await fs.promises.writeFile(filePath, fileBuffer);

      // Return file metadata (use relative path)
      return {
        fileId: fileName, // File ID is the filename
        relativePath: path.join('uploads', fileName), // Relative path for database storage
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Unable to upload the file.');
    }
  }
}