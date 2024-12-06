import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob'; // Azure SDK for Blob Storage

@Injectable()
export class AzureBlobService {
  private readonly containerName = 'documents'; // Replace this with your actual container name
  private readonly connectionString = 'DefaultEndpointsProtocol=https;AccountName=trastify;AccountKey=SFGiksNLB/BdsG4N6sylQNdTKn+9Z7Keg5FkH0l0MkGzlzNG/I9iR0WlkHJPX1/rKWqmqLTU+cRj+ASth3s+RA==;EndpointSuffix=core.windows.net'; // Replace this with your Azure connection string

  // Get the BlobServiceClient to interact with Azure Blob Storage
  private getBlobServiceClient(): BlobServiceClient {
    return BlobServiceClient.fromConnectionString(this.connectionString);
  }

  /**
   * Uploads a file to Azure Blob Storage.
   * @param fileBuffer The buffer of the file to be uploaded.
   * @param fileName The name of the file in Azure Blob Storage.
   * @returns The blob ID (name) and URL of the uploaded file.
   */
  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<{ blobId: string; url: string }> {
    // Get the client for interacting with the container
    const blobServiceClient = this.getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(this.containerName);

    // Create a blob client to interact with a specific file (blob) in the container
    const blobClient = containerClient.getBlockBlobClient(fileName);

    // Upload the file to Azure Blob Storage
    await blobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: 'application/octet-stream' }, // Set appropriate MIME type for the file
    });

    // Return the blob ID and URL of the uploaded file
    return {
      blobId: fileName,
      url: blobClient.url, // This is the URL of the uploaded file
    };
  }
}
