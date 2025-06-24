import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HardDrive, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Image,
  File,
  Loader2
} from 'lucide-react';
import { Button } from '@components/common/Button';
import { storageManagerService } from '@/services/storage/storage-manager.service';
import { useAuthStore } from '@stores/auth';
import { formatBytes, formatDate } from '@/utils/format';

interface StorageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageManager({ isOpen, onClose }: StorageManagerProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState({
    olderThanDays: 90,
    orphanedOnly: false,
    keepFavorites: true
  });

  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && user) {
      loadStorageData();
    }
  }, [isOpen, user]);

  const loadStorageData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [storageStats, storageHealth] = await Promise.all([
        storageManagerService.getStorageStats(user.id),
        storageManagerService.checkStorageHealth(user.id)
      ]);

      setStats(storageStats);
      setHealth(storageHealth);
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!user) return;

    setIsCleaningUp(true);
    try {
      const result = await storageManagerService.cleanupStorage(user.id, selectedOptions);
      
      // Show success message
      alert(`Cleanup complete! Deleted ${result.deletedCount} files, freed ${formatBytes(result.freedSpace)}`);
      
      // Reload data
      await loadStorageData();
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Failed to clean up storage. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;

    try {
      const blob = await storageManagerService.exportStorageData(user.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skooledin-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (!isOpen) return null;

  const usagePercentage = stats ? (stats.usedSize / (5 * 1024 * 1024 * 1024)) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Storage Manager</h2>
                <p className="text-sm text-gray-600">Manage your notebook storage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Storage Overview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Storage Overview</h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{formatBytes(stats?.usedSize || 0)} used</span>
                    <span>5 GB limit</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usagePercentage > 80 ? 'bg-red-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Storage Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                      <Image className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-xs text-gray-600">
                      {stats?.breakdown.images.count || 0} files
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(stats?.breakdown.images.size || 0)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-sm font-medium">PDFs</p>
                    <p className="text-xs text-gray-600">
                      {stats?.breakdown.pdfs.count || 0} files
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(stats?.breakdown.pdfs.size || 0)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2">
                      <File className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Other</p>
                    <p className="text-xs text-gray-600">
                      {stats?.breakdown.other.count || 0} files
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatBytes(stats?.breakdown.other.size || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Status */}
              {health && (
                <div className={`rounded-xl p-6 ${
                  health.isHealthy ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {health.isHealthy ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">
                        {health.isHealthy ? 'Storage is Healthy' : 'Storage Needs Attention'}
                      </h3>
                      
                      {health.warnings.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {health.warnings.map((warning: string, i: number) => (
                            <p key={i} className="text-sm text-gray-700">{warning}</p>
                          ))}
                        </div>
                      )}
                      
                      {health.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Recommendations:</p>
                          {health.recommendations.map((rec: string, i: number) => (
                            <p key={i} className="text-sm text-gray-600">• {rec}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Largest Files */}
              {stats?.largestFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Largest Files</h3>
                  <div className="space-y-2">
                    {stats.largestFiles.slice(0, 5).map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{formatBytes(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cleanup Options */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Storage Cleanup</h3>
                
                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOptions.orphanedOnly}
                      onChange={(e) => setSelectedOptions({
                        ...selectedOptions,
                        orphanedOnly: e.target.checked
                      })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm">Only remove orphaned files</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOptions.keepFavorites}
                      onChange={(e) => setSelectedOptions({
                        ...selectedOptions,
                        keepFavorites: e.target.checked
                      })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm">Keep files from favorite notes</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Remove files older than</span>
                    <select
                      value={selectedOptions.olderThanDays}
                      onChange={(e) => setSelectedOptions({
                        ...selectedOptions,
                        olderThanDays: Number(e.target.value)
                      })}
                      className="px-3 py-1 border rounded-lg text-sm"
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>6 months</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleCleanup}
                  disabled={isCleaningUp}
                  variant="destructive"
                  className="w-full"
                >
                  {isCleaningUp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cleaning up...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Up Storage
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>Export Backup</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}