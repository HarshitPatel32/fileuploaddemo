'use client';
import { useState } from 'react';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }
        alert('File uploaded successfully'); 
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message); 
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const mystyle = {
    display: "flex",
    width: "100vw",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center"
  }

  return (
    <div style={mystyle}>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>} 
    </div>
  );
}
