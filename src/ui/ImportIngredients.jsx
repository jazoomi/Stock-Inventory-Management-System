import { useState } from "react";

const ImportIngredients = ({ onFileUpload }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) return alert("Please select a file");

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://localhost:3001/raw-ingredients", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(result => alert(result.message))
        .catch(error => alert("Error uploading file"));
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
            {file && <button onClick={handleUpload}>Upload</button>}
        </div>
    );
};

export default ImportIngredients;