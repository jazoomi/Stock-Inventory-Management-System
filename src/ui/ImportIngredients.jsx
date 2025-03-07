import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ImportIngredients = ({ refreshIngredients }) => {
    const [file, setFile] = useState(null);
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
        setFile(e.target.files[0]);
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
                const formattedData = jsonData.map(({ Name, Amount, "Unit/Measurement": Unit, Price }) => ({
                    name: Name,
                    quantity: Amount,
                    unit: Unit,
                    price: Price
                }));

                 // Remove duplicates (skip if the name already exists in the DB)
                 const uniqueIngredients = formattedData.filter(item => 
                    !existingIngredients.has(item.name.toLowerCase())
                );

                if (uniqueIngredients.length === 0) {
                    alert("No new ingredients to import. All already exist in the database.");
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
                setFile(null);
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
            {file && <button onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>}
        </div>
    );
};

export default ImportIngredients;