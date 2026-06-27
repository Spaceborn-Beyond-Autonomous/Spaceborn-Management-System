class GoogleDriveService {
  constructor() {
    this.folderId = process.env.REACT_APP_DRIVE_FOLDER_ID;
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async listFiles() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${this.folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size,webViewLink,createdTime)&orderBy=createdTime%20desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      const metadata = {
        name: file.name,
        parents: [this.folderId],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Delete failed');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  getViewUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  getDownloadUrl(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
}

export default new GoogleDriveService();