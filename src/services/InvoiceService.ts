import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class InvoiceService {
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imageBuffer,
        'eng', // Language
        {
          logger: (m) => console.log(m), // Logging progress
        }
      ).then(({ data: { text } }) => {
        resolve(text); // Return extracted text
      }).catch(reject);
    });
  }

  // Function to extract total amount from the OCR result
 /* extractTotalAmount(text: string): number {
    // Regular expression to find the total amount (e.g., "Total: 150.50")
    const totalMatch = text.match(/(?:total|amount due|total due|amount payable|Total TTC)\s*[:\-\s]*\$(\d+(\.\d{1,2})?)/i);
    if (totalMatch && totalMatch[1]) {
      return parseFloat(totalMatch[1]);
    }
    return 0; // Return 0 if no match is found
  }*/


}
