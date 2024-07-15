import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const data = await file.arrayBuffer();
    const tempFolderPath = path.join(process.cwd(), 'uploads');

    await fs.mkdir(tempFolderPath, { recursive: true });

    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const currentDateTime = `${formattedDate}_${formattedTime}`;

    const originalFileName = file.name;
    const fileExtension = path.extname(originalFileName);
    const baseFileName = path.basename(originalFileName, fileExtension).split(' ')[0].replace(/ /g, '_');
    const newFileName = `${baseFileName}_${currentDateTime}${fileExtension}`;

    const filePath = path.join(tempFolderPath, newFileName);

    await fs.writeFile(filePath, Buffer.from(data));

    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
