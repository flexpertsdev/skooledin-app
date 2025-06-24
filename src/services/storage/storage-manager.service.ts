import { db } from '@/lib/db';
import type { FileAttachment } from '@types';

interface StorageStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  fileCount: number;
  largestFiles: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    createdAt: Date;
  }>;
  breakdown: {
    images: { count: number; size: number };
    pdfs: { count: number; size: number };
    other: { count: number; size: number };
  };
}

interface CleanupOptions {
  olderThanDays?: number;
  orphanedOnly?: boolean;
  maxSizeGB?: number;
  keepFavorites?: boolean;
}

export class StorageManagerService {
  private readonly MAX_STORAGE_GB = 5; // 5GB limit
  private readonly WARNING_THRESHOLD = 0.8; // Warn at 80% usage

  /**
   * Get current storage statistics
   */
  async getStorageStats(userId: string): Promise<StorageStats> {
    try {
      // Get all attachments from notebooks
      const notebooks = await db.notebooks
        .where('userId')
        .equals(userId)
        .toArray();

      const allAttachments: FileAttachment[] = [];
      notebooks.forEach(notebook => {
        if (notebook.attachments) {
          allAttachments.push(...notebook.attachments);
        }
      });

      // Calculate stats
      let totalSize = 0;
      const breakdown = {
        images: { count: 0, size: 0 },
        pdfs: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      };

      allAttachments.forEach(attachment => {
        totalSize += attachment.size;
        
        if (attachment.mimeType.startsWith('image/')) {
          breakdown.images.count++;
          breakdown.images.size += attachment.size;
        } else if (attachment.mimeType === 'application/pdf') {
          breakdown.pdfs.count++;
          breakdown.pdfs.size += attachment.size;
        } else {
          breakdown.other.count++;
          breakdown.other.size += attachment.size;
        }
      });

      // Get largest files
      const largestFiles = allAttachments
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.mimeType,
          createdAt: file.uploadedAt
        }));

      // Check browser storage quota if available
      let availableSize = this.MAX_STORAGE_GB * 1024 * 1024 * 1024;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.quota && estimate.usage) {
            availableSize = estimate.quota - estimate.usage;
          }
        } catch (error) {
          console.warn('Could not estimate storage:', error);
        }
      }

      return {
        totalSize,
        usedSize: totalSize,
        availableSize,
        fileCount: allAttachments.length,
        largestFiles,
        breakdown
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old or orphaned files
   */
  async cleanupStorage(userId: string, options: CleanupOptions = {}): Promise<{
    deletedCount: number;
    freedSpace: number;
  }> {
    const {
      olderThanDays = 90,
      orphanedOnly = false,
      keepFavorites = true
    } = options;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const notebooks = await db.notebooks
        .where('userId')
        .equals(userId)
        .toArray();

      let deletedCount = 0;
      let freedSpace = 0;

      // Track all referenced attachment IDs
      const referencedIds = new Set<string>();
      notebooks.forEach(notebook => {
        notebook.attachments?.forEach(att => referencedIds.add(att.id));
      });

      // Clean up attachments from notebooks
      for (const notebook of notebooks) {
        if (keepFavorites && notebook.metadata.isFavorite) {
          continue;
        }

        const updatedAttachments = notebook.attachments?.filter(attachment => {
          const shouldDelete = orphanedOnly 
            ? !referencedIds.has(attachment.id)
            : attachment.uploadedAt < cutoffDate;

          if (shouldDelete) {
            deletedCount++;
            freedSpace += attachment.size;
            return false;
          }
          return true;
        }) || [];

        if (updatedAttachments.length !== notebook.attachments?.length) {
          await db.notebooks.update(notebook.id, {
            attachments: updatedAttachments
          });
        }
      }

      return { deletedCount, freedSpace };
    } catch (error) {
      console.error('Storage cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Check if storage is near limit
   */
  async checkStorageHealth(userId: string): Promise<{
    isHealthy: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    try {
      const stats = await this.getStorageStats(userId);
      const warnings: string[] = [];
      const recommendations: string[] = [];

      const usageRatio = stats.usedSize / (this.MAX_STORAGE_GB * 1024 * 1024 * 1024);

      if (usageRatio > this.WARNING_THRESHOLD) {
        warnings.push(`Storage usage is at ${(usageRatio * 100).toFixed(1)}% of limit`);
        recommendations.push('Consider removing old or large files');
      }

      if (stats.largestFiles.length > 0 && stats.largestFiles[0].size > 50 * 1024 * 1024) {
        warnings.push('You have files larger than 50MB');
        recommendations.push('Consider compressing large PDFs or images');
      }

      const oldFiles = await this.getOldFiles(userId, 180); // 6 months
      if (oldFiles.length > 10) {
        recommendations.push(`You have ${oldFiles.length} files older than 6 months that could be archived`);
      }

      return {
        isHealthy: warnings.length === 0,
        warnings,
        recommendations
      };
    } catch (error) {
      console.error('Storage health check failed:', error);
      return {
        isHealthy: false,
        warnings: ['Failed to check storage health'],
        recommendations: []
      };
    }
  }

  /**
   * Get files older than specified days
   */
  private async getOldFiles(userId: string, days: number): Promise<FileAttachment[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const notebooks = await db.notebooks
      .where('userId')
      .equals(userId)
      .toArray();

    const oldFiles: FileAttachment[] = [];
    notebooks.forEach((notebook: any) => {
      notebook.attachments?.forEach((attachment: any) => {
        if (attachment.uploadedAt < cutoffDate) {
          oldFiles.push(attachment);
        }
      });
    });

    return oldFiles;
  }

  /**
   * Export storage data for backup
   */
  async exportStorageData(userId: string): Promise<Blob> {
    const notebooks = await db.notebooks
      .where('userId')
      .equals(userId)
      .toArray();

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      notebooks: notebooks.map(notebook => ({
        ...notebook,
        // Convert file data to base64 for portability
        attachments: notebook.attachments?.map(att => ({
          ...att,
          data: att.url // In real implementation, convert blob URLs to base64
        }))
      }))
    };

    const json = JSON.stringify(exportData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Get storage usage by time period
   */
  async getStorageHistory(userId: string, _days: number = 30): Promise<{
    date: Date;
    size: number;
    fileCount: number;
  }[]> {
    // In a real implementation, this would track historical data
    // For now, return current data as a single point
    const stats = await this.getStorageStats(userId);
    
    return [{
      date: new Date(),
      size: stats.usedSize,
      fileCount: stats.fileCount
    }];
  }

  /**
   * Optimize images in storage
   */
  async optimizeImages(_userId: string, _quality: number = 0.8): Promise<{
    optimizedCount: number;
    savedSpace: number;
  }> {
    // This is a placeholder - real implementation would:
    // 1. Find all images
    // 2. Compress them using Canvas API
    // 3. Replace the original files
    // 4. Update attachment records
    
    return {
      optimizedCount: 0,
      savedSpace: 0
    };
  }
}

export const storageManagerService = new StorageManagerService();