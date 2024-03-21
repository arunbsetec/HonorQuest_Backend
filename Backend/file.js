const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Shuffle function for randomizing characters
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const characters = ['Squire', 'Knight', 'Wizard', 'Rogue', 'Archer']; // Characters to shuffle randomly

    req.files.forEach((file, index) => {
        const nameIndex = index + 1; // Incremental index for name
        const characterIndex = Math.floor(Math.random() * characters.length); // Random character index
        const shuffledCharacters = shuffle(characters.slice()); // Shuffle characters
        const dynamicData = {
            name: `#${nameIndex}`,
            description: `#${nameIndex} ${shuffledCharacters[characterIndex]}`,
            image: `${shuffledCharacters[characterIndex].toLowerCase()}.jpg`,
            external_url: "http://localhost:3000/api/item/meta",
            attributes: [
                { trait_type: "Character", value: shuffledCharacters[characterIndex] },
                { trait_type: "Squires Level", value: "0" },
                { trait_type: "Coffers Level", value: "0" },
                { trait_type: "Horse Level", value: "0" },
                { trait_type: "Dragon Level", value: "0" }
            ]
        };

        const jsonData = JSON.parse(fs.readFileSync(file.path, 'utf8'));

        // Merge dynamic data into the existing JSON object
        const mergedData = { ...dynamicData, ...jsonData };

        const fileName = `file_${index + 1}.json`;

        fs.writeFile(fileName, JSON.stringify(mergedData, null, 2), err => {
            if (err) {
                console.error(`Error writing file ${fileName}:`, err);
            } else {
                console.log(`File ${fileName} saved successfully.`);
            }
        });

        // Clean up the temporary file
        fs.unlinkSync(file.path);
    });

    res.send('Files uploaded successfully.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
