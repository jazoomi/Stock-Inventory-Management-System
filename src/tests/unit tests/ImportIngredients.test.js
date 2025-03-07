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

describe("ImportIngredients unit tests", () => {
    let fileMock, setFileMock, setFileNameMock;

    beforeEach(() => {
        fileMock = new File(["test"], "test.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        setFileMock = jest.fn();
        setFileNameMock = jest.fn();
    });

    test("handleFileChange sets file and fileName correctly", () => {
        const result = handleFileChange(fileMock, setFileMock, setFileNameMock);

        expect(result.success).toBe(true);
        expect(setFileMock).toHaveBeenCalledWith(fileMock);
        expect(setFileNameMock).toHaveBeenCalledWith("test.xlsx");
    });

    test("handleFileChange doesnt accept files larger than 2MB", () => {
        const largeFileMock = new File(["A".repeat(3 * 1024 * 1024)], "large.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const result = handleFileChange(largeFileMock, setFileMock, setFileNameMock);

        expect(result.error).toBe("File size exceeds 2MB. Please upload a smaller file.");
        expect(setFileMock).not.toHaveBeenCalled();
        expect(setFileNameMock).not.toHaveBeenCalled();
    });

    test("handleRemoveFile clears file and fileName", () => {
        handleRemoveFile(setFileMock, setFileNameMock);

        expect(setFileMock).toHaveBeenCalledWith(null);
        expect(setFileNameMock).toHaveBeenCalledWith("");
    });
});