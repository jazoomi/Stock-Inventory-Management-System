import { useState } from "react";
import * as XLSX from "xlsx";

const ImportIngredients = ({ refreshIngredients }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [triggerUpdate, setTriggerUpdate] = useState(false) //to force rerender

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
                    quantity: Amount || 0,
                    unit: Unit,
                    price: Price || 0
                }));

                await Promise.all(formattedData.map(ingredient => 
                    fetch("http://localhost:3001/raw-ingredients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ingredient),
                })
            ))

                alert("Ingredients imported successfully!");
                setFile(null);
                refreshIngredients(); 
                setTriggerUpdate(prev => !prev); //force state change

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
        //key is used to force rerender
        <div key={triggerUpdate}>
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