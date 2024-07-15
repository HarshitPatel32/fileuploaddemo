import { Handler } from '@netlify/functions';
import { promises as fs } from 'fs';
import path from 'path';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const formData = new URLSearchParams(event.body || '');
    const fileContent = formData.get('fileContent');
    const fileName = formData.get('fileName');

    if (!fileContent || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file provided' }),
      };
    }

    const data = Buffer.from(fileContent, 'base64');
    const tempFolderPath = path.join('/temp', 'uploads');

    await fs.mkdir(tempFolderPath, { recursive: true });

    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const currentDateTime = `${formattedDate}_${formattedTime}`;

    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension).split(' ')[0].replace(/ /g, '_');
    const newFileName = `${baseFileName}_${currentDateTime}${fileExtension}`;

    const filePath = path.join(tempFolderPath, newFileName);

    await fs.writeFile(filePath, data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', filePath }),
    };
  } catch (error) {
    console.error('Error handling file upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
