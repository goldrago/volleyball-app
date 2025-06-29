document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const drawTabBtn = document.getElementById('drawTabBtn');
    const archiveTabBtn = document.getElementById('archiveTabBtn');
    const drawView = document.getElementById('drawView');
    const archiveView = document.getElementById('archiveView');
    const playerNameInput = document.getElementById('playerNameInput');
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const playerListDiv = document.getElementById('playerList');
    const playerCountSpan = document.getElementById('playerCount');
    const groupSizeSelect = document.getElementById('groupSizeSelect');
    const drawTeamsBtn = document.getElementById('drawTeamsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsArea = document.getElementById('resultsArea');
    const saveResultArea = document.getElementById('saveResultArea');
    const winningTeamInput = document.getElementById('winningTeamInput');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const archiveContainer = document.getElementById('archiveContainer');
    const exportTodayBtn = document.getElementById('exportTodayBtn'); // New button
    const modal = document.getElementById('confirmationModal');
    const modalText = document.getElementById('modalText');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // --- State Variables ---
    let players = [];
    let history = [];
    let currentDrawnTeams = [];

    // --- Functions (Existing functions remain the same) ---

    function renderPlayers() {
        playerListDiv.innerHTML = '';
        players.forEach((player, index) => {
            const playerTag = document.createElement('div');
            playerTag.className = 'player-tag';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = player;
            const removeSpan = document.createElement('span');
            removeSpan.className = 'remove-player';
            removeSpan.textContent = 'x';
            removeSpan.onclick = () => removePlayer(index);
            playerTag.appendChild(nameSpan);
            playerTag.appendChild(removeSpan);
            playerListDiv.appendChild(playerTag);
        });
        playerCountSpan.textContent = `שחקנים: ${players.length}`;
    }

    function addPlayer() {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            if (players.includes(playerName)) {
                alert('שם זה כבר קיים ברשימה.');
                return;
            }
            players.push(playerName);
            renderPlayers();
            playerNameInput.value = '';
            playerNameInput.focus();
        }
    }

    function removePlayer(index) {
        players.splice(index, 1);
        renderPlayers();
    }

    function resetApp() {
        players = [];
        currentDrawnTeams = [];
        renderPlayers();
        resultsArea.innerHTML = '';
        saveResultArea.classList.add('hidden');
        playerNameInput.focus();
    }

    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    function performDraw() {
        resultsArea.innerHTML = '';
        currentDrawnTeams = [];
        const groupSize = parseInt(groupSizeSelect.value);
        const shuffledPlayers = shuffleArray([...players]);
        const totalPlayers = shuffledPlayers.length;
        const numGroups = Math.floor(totalPlayers / groupSize);

        let playerIndex = 0;
        for (let i = 0; i < numGroups; i++) {
            const team = { number: i + 1, players: [] };
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team';
            const teamTitle = document.createElement('h3');
            teamTitle.textContent = `קבוצה ${team.number}`;
            teamDiv.appendChild(teamTitle);
            const teamList = document.createElement('ul');
            for (let j = 0; j < groupSize; j++) {
                const playerName = shuffledPlayers[playerIndex];
                team.players.push(playerName);
                const listItem = document.createElement('li');
                listItem.textContent = playerName;
                teamList.appendChild(listItem);
                playerIndex++;
            }
            teamDiv.appendChild(teamList);
            resultsArea.appendChild(teamDiv);
            currentDrawnTeams.push(team);
        }

        const remainingPlayersCount = totalPlayers % groupSize;
        if (remainingPlayersCount > 0) {
            const leftovers = { players: shuffledPlayers.slice(playerIndex) };
            currentDrawnTeams.push(leftovers);
        }
        
        saveResultArea.classList.remove('hidden');
        winningTeamInput.value = '';
        winningTeamInput.max = numGroups;
    }

    function handleDrawClick() {
        const totalPlayers = players.length;
        const groupSize = parseInt(groupSizeSelect.value);
        if (totalPlayers < groupSize || totalPlayers < 2) {
            alert('אין מספיק שחקנים כדי ליצור אפילו קבוצה אחת.');
            return;
        }
        const remainder = totalPlayers % groupSize;
        if (remainder !== 0) {
            const singularOrPlural = remainder === 1 ? "אדם אחד יישאר" : `${remainder} אנשים יישארו`;
            modalText.textContent = `שים לב! ${singularOrPlural} ללא קבוצה. האם להמשיך?`;
            modal.style.display = 'flex';
        } else {
            performDraw();
        }
    }
    
    function loadHistory() {
        const historyJSON = localStorage.getItem('volleyballHistory');
        if (historyJSON) {
            history = JSON.parse(historyJSON);
        }
    }

    function saveHistory() {
        localStorage.setItem('volleyballHistory', JSON.stringify(history));
    }
    
    function saveResult() {
        const winningTeamNumber = parseInt(winningTeamInput.value);
        if (!winningTeamNumber || winningTeamNumber < 1 || winningTeamNumber > currentDrawnTeams.filter(t => t.number).length) {
            alert('אנא הזן מספר קבוצה מנצחת תקין.');
            return;
        }

        const winner = currentDrawnTeams.find(t => t.number === winningTeamNumber);
        const losers = currentDrawnTeams.filter(t => t.number && t.number !== winningTeamNumber);
        
        const today = new Date().toLocaleDateString('he-IL');
        let todayEntry = history.find(entry => entry.date === today);

        if (!todayEntry) {
            todayEntry = { date: today, games: [] };
            history.push(todayEntry);
        }

        const gameNumber = todayEntry.games.length + 1;
        const gameRecord = { gameNumber, winner, losers };
        todayEntry.games.push(gameRecord);

        saveHistory();
        alert(`תוצאת משחק ${gameNumber} נשמרה!`);
        saveResultArea.classList.add('hidden');
    }

    function renderHistory() {
        archiveContainer.innerHTML = '';
        if (history.length === 0) {
            archiveContainer.textContent = 'אין משחקים שמורים בארכיון.';
            return;
        }
        
        const numberToText = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי"];

        [...history].reverse().forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'archive-entry';
            const dateDiv = document.createElement('div');
            dateDiv.className = 'archive-date';
            dateDiv.textContent = entry.date;
            entryDiv.appendChild(dateDiv);

            entry.games.forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'archive-game';
                const gameTitle = document.createElement('h4');
                const gameName = game.gameNumber <= 7 ? numberToText[game.gameNumber - 1] : game.gameNumber;
                gameTitle.textContent = `משחק ${gameName}`;
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'archive-game-result';
                
                const winnerDiv = document.createElement('div');
                winnerDiv.className = 'archive-team archive-winner';
                winnerDiv.innerHTML = `<h5>🏆 קבוצה מנצחת (${game.winner.number})</h5>`;
                const winnerList = document.createElement('ul');
                game.winner.players.forEach(p => {
                    winnerList.innerHTML += `<li>${p}</li>`;
                });
                winnerDiv.appendChild(winnerList);
                
                const loserDiv = document.createElement('div');
                loserDiv.className = 'archive-team';
                loserDiv.innerHTML = `<h5>קבוצות מפסידות</h5>`;
                game.losers.forEach(team => {
                    const loserList = document.createElement('ul');
                    loserList.innerHTML += `<strong>קבוצה ${team.number}:</strong>`;
                    team.players.forEach(p => {
                        loserList.innerHTML += `<li>${p}</li>`;
                    });
                    loserDiv.appendChild(loserList);
                });

                resultDiv.appendChild(winnerDiv);
                resultDiv.appendChild(loserDiv);
                gameDiv.appendChild(gameTitle);
                gameDiv.appendChild(resultDiv);
                entryDiv.appendChild(gameDiv);
            });
            archiveContainer.appendChild(entryDiv);
        });
    }

    // --- NEW: Export Function ---
    function exportTodayResults() {
        const today = new Date().toLocaleDateString('he-IL');
        const todayEntry = history.find(entry => entry.date === today);

        if (!todayEntry || todayEntry.games.length === 0) {
            alert('אין משחקים שנשמרו בתאריך של היום כדי לייצא.');
            return;
        }

        // CSV Headers
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF for UTF-8 BOM for Excel
        csvContent += "תאריך,מספר משחק,סטטוס,מספר קבוצה,שחקנים\r\n";

        // CSV Rows
        todayEntry.games.forEach(game => {
            // Winner row
            const winnerPlayers = game.winner.players.join(' | ');
            csvContent += `${today},${game.gameNumber},מנצחת,${game.winner.number},"${winnerPlayers}"\r\n`;

            // Loser rows
            game.losers.forEach(loserTeam => {
                const loserPlayers = loserTeam.players.join(' | ');
                csvContent += `${today},${game.gameNumber},מפסידה,${loserTeam.number},"${loserPlayers}"\r\n`;
            });
        });

        // Create and trigger download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const safeDate = today.replace(/\//g, '-');
        link.setAttribute("download", `תוצאות-כדורעף-${safeDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function switchTab(tab) {
        if (tab === 'draw') {
            drawTabBtn.classList.add('active');
            archiveTabBtn.classList.remove('active');
            drawView.classList.add('active');
            archiveView.classList.remove('active');
        } else { // archive
            drawTabBtn.classList.remove('active');
            archiveTabBtn.classList.add('active');
            drawView.classList.remove('active');
            archiveView.classList.add('active');
            renderHistory();
        }
    }

    // --- Event Listeners ---
    addPlayerBtn.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => e.key === 'Enter' && addPlayer());
    drawTeamsBtn.addEventListener('click', handleDrawClick);
    resetBtn.addEventListener('click', resetApp);
    saveResultBtn.addEventListener('click', saveResult);
    exportTodayBtn.addEventListener('click', exportTodayResults); // New listener
    
    // Tabs
    drawTabBtn.addEventListener('click', () => switchTab('draw'));
    archiveTabBtn.addEventListener('click', () => switchTab('archive'));

    // Modal
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    confirmBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        performDraw();
    });
    window.addEventListener('click', (e) => e.target == modal && (modal.style.display = 'none'));

    // --- Initial Load ---
    loadHistory();
    switchTab('draw');
});
