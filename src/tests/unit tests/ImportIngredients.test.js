import { jest } from "@jest/globals";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

//handles file selection
const handleFileChange = (file, setFile, setFileName) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        return { error: "File size exceeds 2MB. Please upload a smaller file." };
    }

    setFile(file);
    setFileName(file.name);
    return { success: true };
};

//removes the selected file
const handleRemoveFile = (setFile, setFileName) => {
    setFile(null);
    setFileName("");
};

//simulates uploading a file
const handleUpload = async (file, fetchMock) => {
    if (!file) return { error: "No file selected" };

    const response = await fetchMock("http://localhost:3001/raw-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
    });

    if (!response.ok) {
        return { error: "Upload failed" };
    }

    return { success: true };
};
