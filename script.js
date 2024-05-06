document.getElementById('fileInput').addEventListener('change', handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const fileContent = event.target.result;
    const jsonObject = JSON.parse(fileContent);

    // Get the checksum values, game names, and files nested within the specified object
    const gameChecksumFiles = getGameChecksumFiles(jsonObject);

    // Display the checksum values, game names, and files in a table
    displayGameChecksumFiles(gameChecksumFiles);
  };

  reader.readAsText(file);
}

function getGameChecksumFiles(obj) {
  const gameChecksumFiles = {};

  function extractChecksum(obj) {
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }

    for (const key in obj) {
      if (key === 'game' && obj.game !== 'RNG' && obj.criticalAssets && Array.isArray(obj.criticalAssets)) {
          const game = obj.game;
          const brand = obj.brand; // Extract the brand property
          const gameVersion = obj.gameVersion; // Include the value for gameVersion
          gameChecksumFiles[game] = gameChecksumFiles[game] || { brand, gameVersion, files: [] };
          obj.criticalAssets.forEach(item => {
              if (item.checksum && item.file) {
                  gameChecksumFiles[game].files.push({ fileName: item.file, checksum: item.checksum });
              }
          });
      } else {
        extractChecksum(obj[key]);
      }
    }
  }

  // Traverse the 'modules' array to find the 'game', 'gameVersion', and 'criticalAssets' values
  if (Array.isArray(obj.modules)) {
    obj.modules.forEach(module => {
      extractChecksum(module);
    });
  }

  return gameChecksumFiles;
}


// Define a variable to store the original game checksum files
let originalGameChecksumFiles = null;

// Function to handle the search functionality
function handleSearch() {
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();

    // Filter game checksum files based on partial search query
    const filteredGameChecksumFiles = {};
    for (const game in originalGameChecksumFiles) {
        if (game.toLowerCase().includes(searchQuery)) {
            filteredGameChecksumFiles[game] = originalGameChecksumFiles[game];
        }
    }

    // Display filtered results
    displayGameChecksumFiles(filteredGameChecksumFiles);
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', handleSearch);

// Function to display game checksums with copy buttons
function displayGameChecksumFiles(gameChecksumFiles) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    for (const game in gameChecksumFiles) {
        const gameData = gameChecksumFiles[game];

        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');

        // Create elements for game name, brand, version, and checksum count
        const gameInfoParagraph = document.createElement('p');
        gameInfoParagraph.classList.add('game-info');
        gameInfoParagraph.textContent = `Game: ${game} | Brand: ${gameData.brand} | Version: ${gameData.gameVersion} | Checksum Count: ${gameData.files.length}`;
        gameDiv.appendChild(gameInfoParagraph);

        // Create table element
        const table = document.createElement('table');
        table.classList.add('checksum-table');

        // Create table header
        const headerRow = table.createTHead().insertRow();
        const fileNameHeader = document.createElement('th');
        fileNameHeader.textContent = 'File';
        const checksumHeader = document.createElement('th');
        checksumHeader.textContent = 'Checksum';
        headerRow.appendChild(fileNameHeader);
        headerRow.appendChild(checksumHeader);

        // Populate table with data
        gameData.files.forEach(fileChecksum => {
            const row = table.insertRow();
            const fileNameCell = row.insertCell();
            const checksumCell = row.insertCell();
            fileNameCell.textContent = fileChecksum.fileName;
            checksumCell.textContent = fileChecksum.checksum;
        });

        // Append table to gameDiv
        gameDiv.appendChild(table);

        // Create copy button for each game
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Checksums';
        copyButton.addEventListener('click', function() {
            copyChecksumsToClipboard(gameData.files);
        });
        gameDiv.appendChild(copyButton);

        resultDiv.appendChild(gameDiv);
    }
}

// Function to copy checksums to clipboard
function copyChecksumsToClipboard(files) {
    const checksums = files.map(file => file.checksum);
    const checksumsString = checksums.join('\n');

    navigator.clipboard.writeText(checksumsString).then(function() {
        alert('Checksums copied to clipboard!');
    }, function() {
        alert('Failed to copy checksums to clipboard.');
    });
}

// Event listener for file input
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        const jsonObject = JSON.parse(fileContent);

        // Store the original game checksum files
        originalGameChecksumFiles = getGameChecksumFiles(jsonObject);

        // Display the checksum values, game names, and files in a table
        displayGameChecksumFiles(originalGameChecksumFiles);
    };

    reader.readAsText(file);
});

