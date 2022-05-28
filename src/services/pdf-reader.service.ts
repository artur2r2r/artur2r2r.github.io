import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { DocumentInitParameters, PDFDataRangeTransport, TypedArray } from "pdfjs-dist/types/src/display/api";

// import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

@Injectable({
  providedIn: 'root'
})
export class PdfReaderService {
  constructor() {
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.13.216/build/pdf.worker.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.js';

  }

  public async readPdf(src: string | URL | TypedArray | PDFDataRangeTransport | DocumentInitParameters): Promise<string> {
    const pdf1 = await pdfjsLib.getDocument(src);
    const pdf: PDFDocumentProxy = await pdf1.promise;

    const countPromises = []; // collecting all page promises
    for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // @ts-ignore
      countPromises.push(textContent.items.map((s: TextItem | TextMarkedContent) => s.str).join(''));
    }
    const pageContents = await Promise.all(countPromises);
    return pageContents.join('');
  }
}
