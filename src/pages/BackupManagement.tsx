import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Backup {
  filename: string;
  size: number;
  created: string;
  type: 'database' | 'files';
}

interface BackupConfig {
  autoBackupEnabled: boolean;
  autoBackupSchedule: string;
  autoBackupTime: string;
  retentionDays: number;
  lastAutoBackup: string | null;
}

interface BackupStats {
  totalBackups: number;
  databaseBackups: number;
  fileBackups: number;
  totalSize: number;
  latestBackup: {
    filename: string;
    created: string;
  } | null;
  backupDirectory: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: false,
    autoBackupSchedule: 'daily',
    autoBackupTime: '02:00',
    retentionDays: 30,
    lastAutoBackup: null
  });
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBackups();
    loadConfig();
    loadStats();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await api.get('/backup');
      setBackups(response.data);
    } catch (error) {
      console.error('Error loading backups:', error);
      showMessage('error', 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await api.get('/backup/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/backup/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      await api.post('/backup/create');
      showMessage('success', 'Backup created successfully');
      loadBackups();
      loadStats();
    } catch (error: any) {
      console.error('Error creating backup:', error);
      showMessage('error', error.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = (filename: string) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:3001/api/backup/download/${filename}?token=${token}`, '_blank');
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }

    try {
      await api.delete(`/backup/${filename}`);
      showMessage('success', 'Backup deleted successfully');
      loadBackups();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      showMessage('error', error.response?.data?.error || 'Failed to delete backup');
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!filename.endsWith('.db')) {
      showMessage('error', 'Can only restore database backups');
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING ⚠️\n\n` +
      `Restoring from backup will replace all current data!\n\n` +
      `A backup of the current database will be created before restoration.\n\n` +
      `Are you absolutely sure you want to restore from: ${filename}?`
    );

    if (!confirmed) return;

    try {
      const response = await api.post(`/backup/restore/${filename}`, { confirmed: true });
      showMessage('success', response.data.message);
      setTimeout(() => {
        alert('Please restart the application for changes to take effect.');
      }, 2000);
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      showMessage('error', error.response?.data?.error || 'Failed to restore backup');
    }
  };

  const saveConfig = async () => {
    try {
      await api.post('/backup/config', config);
      showMessage('success', 'Backup configuration saved');
    } catch (error: any) {
      console.error('Error saving config:', error);
      showMessage('error', 'Failed to save configuration');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Backup Management</h1>
        <button
          onClick={createBackup}
          disabled={creating}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Backup
            </>
          )}
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Backups</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalBackups}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Database Backups</div>
            <div className="text-3xl font-bold text-green-600">{stats.databaseBackups}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">File Backups</div>
            <div className="text-3xl font-bold text-purple-600">{stats.fileBackups}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-3xl font-bold text-orange-600">{formatBytes(stats.totalSize)}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Available Backups</h2>
          </div>
          <div className="p-4">
            {backups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p>No backups available</p>
                <p className="text-sm mt-2">Create your first backup using the button above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.filename} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{backup.filename}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${backup.type === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatBytes(backup.size)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(backup.created)}</td>
                        <td className="px-4 py-3 text-sm text-right space-x-2">
                          <button
                            onClick={() => downloadBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            title="Download"
                          >
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          {backup.type === 'database' && (
                            <button
                              onClick={() => restoreBackup(backup.filename)}
                              className="text-green-600 hover:text-green-800 font-medium"
                              title="Restore"
                            >
                              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => deleteBackup(backup.filename)}
                            className="text-red-600 hover:text-red-800 font-medium"
                            title="Delete"
                          >
                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Backup Configuration */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Backup Configuration</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoBackupEnabled}
                  onChange={(e) => setConfig({ ...config, autoBackupEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Enable Auto Backup</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">Automatically create backups on schedule</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={config.autoBackupSchedule}
                onChange={(e) => setConfig({ ...config, autoBackupSchedule: e.target.value })}
                disabled={!config.autoBackupEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Time</label>
              <input
                type="time"
                value={config.autoBackupTime}
                onChange={(e) => setConfig({ ...config, autoBackupTime: e.target.value })}
                disabled={!config.autoBackupEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 02:00 (2:00 AM)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention (Days)</label>
              <input
                type="number"
                value={config.retentionDays}
                onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) })}
                min="1"
                max="365"
                disabled={!config.autoBackupEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Delete backups older than this many days</p>
            </div>

            {config.lastAutoBackup && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">Last Auto Backup</div>
                <div className="text-sm font-medium">{formatDate(config.lastAutoBackup)}</div>
              </div>
            )}

            <button
              onClick={saveConfig}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Save Configuration
            </button>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h3>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>Auto-backup requires server-side cron setup</li>
                <li>Manual backups are always available</li>
                <li>Keep backups in secure, off-site location</li>
                <li>Test restoration regularly</li>
                <li>Restoration requires app restart</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Backup Info */}
      {stats?.latestBackup && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Latest backup: <span className="font-bold">{stats.latestBackup.filename}</span>
              {' - '}
              {formatDate(stats.latestBackup.created)}
            </span>
          </div>
        </div>
      )}

      {/* Backup Directory */}
      {stats && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-xs text-gray-600">Backup Directory</div>
          <div className="text-sm font-mono text-gray-800">{stats.backupDirectory}</div>
        </div>
      )}
    </div>
  );
}
