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

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (!base64String) {
        setError('Failed to read file');
        setUploading(false);
        return;
      }

      const payload = new URLSearchParams();
      payload.append('fileName', file.name);
      payload.append('fileContent', base64String);

      try {
        const response = await fetch('/.netlify/functions/upload', {
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
          }
          alert(`File uploaded successfully. Path: ${result.filePath}`); // Success message
        } else {
          // Handle non-JSON responses
          const text = await response.text();
          throw new Error(`Unexpected response format: ${text}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message); // Handle known errors
        } else {
          setError('An unknown error occurred'); // Handle unknown errors
        }
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setUploading(false);
    };
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
    </div>
  );
}
