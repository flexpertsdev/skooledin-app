interface PDFProcessResponse {
  content: string;
  metadata: {
    mode: string;
    pageCount: number;
    wordCount: number;
    processedAt: string;
  };
}

export class PDFProcessorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  /**
   * Convert PDF pages to images in the browser
   * This uses pdf.js to render pages as canvas and convert to base64
   */
  async pdfToImages(file: File, maxPages: number = 20): Promise<string[]> {
    // Dynamically import pdf.js to avoid bundling it if not used
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const numPages = Math.min(pdf.numPages, maxPages);
    const images: string[] = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2; // Higher scale for better quality
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      // Remove data URL prefix
      const base64 = imageData.replace(/^data:image\/jpeg;base64,/, '');
      images.push(base64);
    }
    
    return images;
  }

  /**
   * Process PDF with GPT-4 Vision
   */
  async processPDF(
    images: string[],
    mode: 'extract' | 'summarize' | 'study-guide' = 'extract',
    options?: {
      language?: string;
      preserveFormatting?: boolean;
      includePageNumbers?: boolean;
    }
  ): Promise<PDFProcessResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images,
          mode,
          options
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process PDF');
      }

      return await response.json();
    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  }

  /**
   * Process a PDF file end-to-end
   */
  async processFile(
    file: File,
    mode: 'extract' | 'summarize' | 'study-guide' = 'extract',
    options?: {
      maxPages?: number;
      language?: string;
      preserveFormatting?: boolean;
      includePageNumbers?: boolean;
    }
  ): Promise<PDFProcessResponse> {
    // Validate file
    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('PDF file size must be less than 10MB');
    }
    
    // Convert to images
    const images = await this.pdfToImages(file, options?.maxPages);
    
    // Process with GPT-4 Vision
    return this.processPDF(images, mode, options);
  }
}

export const pdfProcessorService = new PDFProcessorService();