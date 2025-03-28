import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ImportIngredients = ({ refreshIngredients }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [existingIngredients, setExistingIngredients] = useState(new Set()); // Store existing names

    // Fetch existing ingredient names 
    useEffect(() => {
        fetch("http://localhost:3001/raw-ingredients")
            .then((res) => res.json()) 
            .then((data) => {
                console.log;
                const names = new Set(data.map(item => item.name.toLowerCase())); // Store lowercase names for case-insensitive matching
                setExistingIngredients(names);
            })
            .catch((err) => console.error("Error fetching ingredients:", err));
    }, []);

    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const selectedFile = e.target.files[0];
        //if (!selectedFile) return;
        console.log("Selected File:", selectedFile.name);
        if (selectedFile.size > MAX_FILE_SIZE) {
            alert("File size exceeds 2MB. Please upload a smaller file.");
            setFile(null);
            setFileName(""); // Clear file name
            e.target.value = ""; // Reset input field
            return;
        }

        setFile(selectedFile);
        setFileName(selectedFile.name); // display file name
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
        setUploading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Convert the data to match the API field names
                const formattedData = jsonData.map(({ Name, Amount, "Unit/Measurement": Unit, Price, Threshold }) => ({
                    name: Name,
                    quantity: parseFloat (Amount) || 0,
                    unit: Unit,
                    price: parseFloat (Price) || 0,
                    threshold: parseFloat(Threshold) || 0
                }));

                 // Remove duplicates (skip if the name already exists in the DB)
                 const uniqueIngredients = formattedData.filter(item => 
                    !existingIngredients.has(item.name.toLowerCase())
                );

                if (uniqueIngredients.length === 0) {
                    alert("No new ingredients to import. All already exist in the database.");
                    setFile(null);
                    setFileName(""); 
                    document.getElementById("fileInput").value = "";
                    setUploading(false);
                    return;
                }

                await Promise.all(uniqueIngredients.map(ingredient => 
                    fetch("http://localhost:3001/raw-ingredients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ingredient),
                })
            ))

                alert("Ingredients imported successfully!");
                //refresh existing ingredients right after upload
                fetch("http://localhost:3001/raw-ingredients")
                .then((res) => res.json())
                .then((data) => {
                    const names = new Set(data.map(item => item.name?.toLowerCase()));
                    setExistingIngredients(names);
                })
                .catch((err) => console.error("Error fetching updated ingredients:", err));

                setFile(null);
                setFileName("");
                document.getElementById("fileInput").value = "";
                refreshIngredients(); 

            } catch (error) {
                alert("Error uploading file");
                console.error(error);
            } finally {
                setUploading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFileName("");
        document.getElementById("fileInput").value = ""; // Reset file input field
    };

    return (
        <div>
            <input 
                type="file" 
                accept=".csv, .xlsx" 
                onChange={handleFileChange} 
                style={{ display: "none" }} 
                id="fileInput" 
            />
            <button onClick={() => document.getElementById("fileInput").click()}>
                Import Ingredients
            </button>
            {fileName && (
                <div style={{ marginLeft: "10px", fontWeight: "bold", color: "#333333"  }}>
                    <span>{fileName}</span>
                    <button onClick={handleRemoveFile} style={{ marginLeft: "10px", marginTop:"10px", marginBottom:"10px", backgroundColor: "#808080", color: "white"}}>
                        Remove
                    </button>
                </div>
            )}
            {file && <button onClick={handleUpload} disabled={uploading} style={{ marginLeft: "10px" }}>{uploading ? "Uploading..." : "Upload"}</button>}
        </div>
    );
};

export default ImportIngredients;