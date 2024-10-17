function loadQuests() {
    const quests = JSON.parse(localStorage.getItem('quests')) || [];
    quests.forEach(quest => {
        if (!quest.completed) {
            addQuestToList(quest);
        }
    });
}

function addQuestToList(quest) {
    const questItem = document.createElement('li');
    questItem.innerHTML = `<strong>${quest.name}</strong> - ${quest.description} <br> Récompense: ${quest.reward}`;
    
    const completeBtn = document.createElement('button');
    completeBtn.textContent = "Terminer";
    completeBtn.addEventListener('click', function() {
        quest.completed = true;
        questItem.classList.add('completed');
        questItem.style.display = 'none';
        saveQuests();
    });
    
    questItem.appendChild(completeBtn);
    document.getElementById('quests').appendChild(questItem);
}

document.getElementById('add-quest-btn').addEventListener('click', function() {
    const questName = document.getElementById('quest-name').value;
    const questDescription = document.getElementById('quest-description').value;
    const questReward = document.getElementById('quest-reward').value;

    if (questName === '' || questDescription === '' || questReward === '') {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    const newQuest = { name: questName, description: questDescription, reward: questReward, completed: false };
    
    const quests = JSON.parse(localStorage.getItem('quests')) || [];
    quests.push(newQuest);
    localStorage.setItem('quests', JSON.stringify(quests));
    
    addQuestToList(newQuest);
    document.getElementById('quest-name').value = '';
    document.getElementById('quest-description').value = '';
    document.getElementById('quest-reward').value = '';
});

function saveQuests() {
    const quests = [];
    document.querySelectorAll('#quests li').forEach(questItem => {
        const questName = questItem.querySelector('strong').textContent;
        const questDescription = questItem.childNodes[1].textContent.trim();
        const questReward = questItem.childNodes[3].textContent.split(': ')[1];
        const completed = questItem.classList.contains('completed');
        
        quests.push({
            name: questName,
            description: questDescription,
            reward: questReward,
            completed: completed
        });
    });
    
    localStorage.setItem('quests', JSON.stringify(quests));
}

document.getElementById('search').addEventListener('input', function(e) {
    const searchValue = e.target.value.toLowerCase();
    const quests = document.querySelectorAll('#quests li');

    quests.forEach(function(quest) {
        const questText = quest.textContent.toLowerCase();
        if (questText.includes(searchValue)) {
            quest.style.display = 'block';
        } else {
            quest.style.display = 'none';
        }
    });
});

loadQuests();
