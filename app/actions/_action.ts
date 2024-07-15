"use server";

import fs from "fs/promises";
import path from "path";

export async function saveFile(formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new Error("No file provided");
  }

  const data = await file.arrayBuffer();
  const tempFolderPath = path.join(process.cwd(), 'uploads');

  // Ensure the tempfolder exists
  await fs.mkdir(tempFolderPath, { recursive: true });

  // Get the current date and time in a shorter format
  const now = new Date();
  const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  const currentDateTime = `${formattedDate}_${formattedTime}`;

  // Create the new file name
  const originalFileName = file.name;
  const fileExtension = path.extname(originalFileName);
  const baseFileName = path.basename(originalFileName, fileExtension).split(' ')[0].replace(/ /g, '_');
  const newFileName = `${baseFileName}_${currentDateTime}${fileExtension}`;

  const filePath = path.join(tempFolderPath, newFileName);

  await fs.writeFile(filePath, Buffer.from(data));
}
