import app from "./app.js"
//not sure how correct this part is, i think it doesn't matter what port number.
const PORT = 3001; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
