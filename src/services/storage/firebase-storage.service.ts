import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage, auth } from '@/config/firebase';
import type { FileAttachment } from '@/types';

export interface UploadOptions {
  folder?: string;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  path: string;
  metadata: {
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
  };
}

class FirebaseStorageService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  // Upload file to Firebase Storage
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);
      
      // Check authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to upload files');
      }
      
      // Generate file path
      const folder = options.folder || 'uploads';
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `users/${user.uid}/${folder}/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      // Add metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name,
          ...options.metadata
        }
      };
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const url = await getDownloadURL(snapshot.ref);
      
      return {
        url,
        path: filePath,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        }
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Upload image with automatic resizing
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid image type. Allowed types: JPEG, PNG, GIF, WebP');
    }
    
    // For images, we could add client-side resizing here if needed
    // For now, just upload as is
    return this.uploadFile(file, { ...options, folder: options.folder || 'images' });
  }

  // Upload document (PDF, Word, etc.)
  async uploadDocument(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error('Invalid document type. Allowed types: PDF, DOC, DOCX');
    }
    
    return this.uploadFile(file, { ...options, folder: options.folder || 'documents' });
  }

  // Delete file from storage
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(path: string): Promise<any> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      console.error('Get metadata error:', error);
      throw error;
    }
  }

  // List files in a folder
  async listFiles(folderPath: string): Promise<FileAttachment[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      const listRef = ref(storage, `users/${user.uid}/${folderPath}`);
      const result = await listAll(listRef);
      
      const files: FileAttachment[] = [];
      
      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        
        files.push({
          id: itemRef.name,
          name: metadata.customMetadata?.originalName || itemRef.name,
          url,
          type: this.getFileTypeFromMimeType(metadata.contentType || ''),
          size: metadata.size,
          mimeType: metadata.contentType || 'application/octet-stream',
          uploadedAt: new Date(metadata.timeCreated),
          uploadedBy: metadata.customMetadata?.uploadedBy || auth.currentUser?.uid || ''
        });
      }
      
      return files;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  // Create a file attachment object from upload result
  createFileAttachment(uploadResult: UploadResult): FileAttachment {
    return {
      id: `file-${Date.now()}`,
      name: uploadResult.metadata.name,
      url: uploadResult.url,
      type: this.getFileTypeFromMimeType(uploadResult.metadata.type),
      size: uploadResult.metadata.size,
      mimeType: uploadResult.metadata.type,
      uploadedAt: uploadResult.metadata.uploadedAt,
      uploadedBy: auth.currentUser?.uid || ''
    };
  }

  // Validate file before upload
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    // Check file type
    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDocument = this.ALLOWED_DOCUMENT_TYPES.includes(file.type);
    
    if (!isImage && !isDocument) {
      throw new Error('Invalid file type. Allowed types: Images (JPEG, PNG, GIF, WebP) and Documents (PDF, DOC, DOCX)');
    }
  }

  // Generate a public URL for sharing
  async generatePublicUrl(path: string, expiresIn?: number): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      // Update metadata to make file public (optional)
      if (expiresIn) {
        const expireDate = new Date();
        expireDate.setSeconds(expireDate.getSeconds() + expiresIn);
        
        await updateMetadata(storageRef, {
          customMetadata: {
            expiresAt: expireDate.toISOString()
          }
        });
      }
      
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Generate public URL error:', error);
      throw error;
    }
  }

  // Convert MIME type to FileAttachment type
  private getFileTypeFromMimeType(mimeType: string): 'pdf' | 'image' | 'document' | 'video' | 'audio' {
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    
    // Document types (Word, etc.)
    if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType.includes('document') ||
      mimeType.includes('text/')
    ) {
      return 'document';
    }
    
    // Default to document for unknown types
    return 'document';
  }
}

export const firebaseStorageService = new FirebaseStorageService();