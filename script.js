// Constantes para os tipos de senha
const PASSWORD_TYPES = {
    MEDICINA: { prefix: 'MED', name: 'Medicina', isPriority: false },
    FISIOTERAPIA: { prefix: 'FIS', name: 'Fisioterapia', isPriority: false },
    RETORNO: { prefix: 'RTN', name: 'Retorno', isPriority: false },
    NORMAL: { prefix: 'NRM', name: 'Normal', isPriority: false },
    PRIORIDADE: { prefix: 'PRI', name: 'Prioridade', isPriority: true },
    ODONTOLOGIA: { prefix: 'ODT', name: 'Odontologia', isPriority: false }
};

// Funções de Gerenciamento de Dados
// -------------------------------------------------------------

function getQueue() {
    return JSON.parse(localStorage.getItem('queue') || '[]');
}

function getCalledHistory() {
    return JSON.parse(localStorage.getItem('calledHistory') || '[]');
}

function saveQueue(queue) {
    localStorage.setItem('queue', JSON.stringify(queue));
}

function saveCalledHistory(history) {
    localStorage.setItem('calledHistory', JSON.stringify(history));
}

// -------------------------------------------------------------

// Função para gerar uma nova senha
window.generatePassword = (typeKey) => {
    const type = PASSWORD_TYPES[typeKey];
    if (!type) return;

    let queue = getQueue();
    let nextNumber = 1;

    // Lógica para determinar o próximo número
    const lastPassword = queue
        .filter(p => p.type.prefix === type.prefix)
        .sort((a, b) => b.number - a.number)[0];
    
    if (lastPassword) {
        nextNumber = lastPassword.number + 1;
    } else {
        const history = getCalledHistory();
        const lastCalled = history
            .filter(p => p.type.prefix === type.prefix)
            .sort((a, b) => b.number - a.number)[0];
        
        if (lastCalled && lastCalled.number >= nextNumber) {
            nextNumber = lastCalled.number + 1;
        }
    }

    const newPassword = {
        id: Date.now(), 
        fullNumber: `${type.prefix}${String(nextNumber).padStart(2, '0')}`,
        number: nextNumber,
        type: type,
        // Garante que o horário da retirada da senha esteja no formato correto para o ticket
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    };

    queue.push(newPassword);
    saveQueue(queue);
    
    // --- IMPORTANTE: ALERT REMOVIDO PARA NÃO INTERFERIR NA IMPRESSÃO ---
    // alert(`Sua senha: ${newPassword.fullNumber}\nTipo: ${newPassword.type.name}\nHora: ${newPassword.time}`);
    // Se desejar feedback, use um modal temporário ou log:
    console.log(`Nova senha gerada: ${newPassword.fullNumber}`);
    
    // ATUALIZAÇÃO PARA IMPRESSÃO: Chama a função que criamos no print.js
    if (window.printPassword) {
        // Envia o número, o nome da categoria (em maiúsculas) e a hora
        window.printPassword(newPassword.fullNumber, newPassword.type.name.toUpperCase(), newPassword.time);
    }
    
    return newPassword;
};

// Função para chamar a próxima senha (Automático)
window.callNextPassword = (guicheNumber) => {
    let queue = getQueue();
    let history = getCalledHistory();

    if (queue.length === 0) {
        alert("Não há senhas na fila.");
        return null;
    }

    let nextPassword;

    // Lógica de Prioridade: Pega a PRI mais antiga (menor timestamp), senão a Normal mais antiga
    const priorityQueue = queue.filter(p => p.type.isPriority);
    
    if (priorityQueue.length > 0) {
        nextPassword = priorityQueue.sort((a, b) => a.timestamp - b.timestamp)[0];
    } else {
        nextPassword = queue.sort((a, b) => a.timestamp - b.timestamp)[0];
    }

    if (!nextPassword) return null; 

    queue = queue.filter(p => p.id !== nextPassword.id);

    const calledPassword = {
        ...nextPassword,
        guiche: guicheNumber,
        calledTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    history.unshift(calledPassword); 
    history = history.slice(0, 10); 

    saveQueue(queue);
    saveCalledHistory(history);
    
    console.log(`Senha chamada: ${calledPassword.fullNumber} no Guichê ${guicheNumber}`);
    
    return calledPassword;
};

// Função para chamar uma senha específica (Manual) - Usada pelo clique na lista
window.callSpecificPassword = (fullNumber, guicheNumber) => {
    let queue = getQueue();
    let history = getCalledHistory();
    
    const targetNumber = fullNumber.trim().toUpperCase();

    // 1. Encontra a senha na fila
    const passwordIndex = queue.findIndex(p => p.fullNumber === targetNumber);

    if (passwordIndex === -1) {
        alert(`A senha "${targetNumber}" não está na fila de espera.`);
        return null;
    }
    
    const nextPassword = queue[passwordIndex];

    // Remove da fila
    queue.splice(passwordIndex, 1);

    const calledPassword = {
        ...nextPassword,
        guiche: guicheNumber,
        calledTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    history.unshift(calledPassword); 
    history = history.slice(0, 10); 

    saveQueue(queue);
    saveCalledHistory(history);
    
    console.log(`Senha manual chamada: ${calledPassword.fullNumber} no Guichê ${guicheNumber}`);
    alert(`Senha ${calledPassword.fullNumber} (${calledPassword.type.name}) chamada no Guichê ${guicheNumber}.`);
    
    return calledPassword;
};


// Funções de Inicialização do Painel de Chamada (CORRIGIDA: CLIQUE NA LISTA)
window.initCallerPanel = () => {
    const queueList = document.getElementById('queue-list');
    const historyList = document.getElementById('history-list');
    const guicheInput = document.getElementById('guiche-input');
    const callButton = document.getElementById('call-button');

    if (!queueList || !historyList || !guicheInput || !callButton) return;

    // Função para renderizar a fila (agora com evento de clique)
    function renderQueue() {
        const queue = getQueue();
        queueList.innerHTML = '';
        
        const priority = queue.filter(p => p.type.isPriority).sort((a, b) => a.timestamp - b.timestamp);
        const normal = queue.filter(p => !p.type.isPriority).sort((a, b) => a.timestamp - b.timestamp);
        const sortedQueue = [...priority, ...normal];

        if (sortedQueue.length === 0) {
            queueList.innerHTML = '<p class="empty-message">Nenhuma senha aguardando.</p>';
            return;
        }

        sortedQueue.forEach(p => {
            const li = document.createElement('li');
            li.className = p.type.isPriority ? 'priority-item' : 'normal-item';
            
            // Adicionamos um atributo data-number para fácil acesso ao número completo
            li.setAttribute('data-password-number', p.fullNumber);
            
            li.innerHTML = `<span>${p.fullNumber}</span> (${p.type.name}) - ${p.time}`;
            
            // NOVO: Adiciona o evento de clique para CHAMADA MANUAL
            li.onclick = function() {
                const guicheNumber = guicheInput.value.trim();
                const fullNumber = this.getAttribute('data-password-number');
                
                if (!guicheNumber || isNaN(parseInt(guicheNumber))) {
                    alert("Por favor, digite um número de guichê válido no campo 'Meu Guichê' antes de clicar na senha.");
                    return;
                }

                const called = window.callSpecificPassword(fullNumber, guicheNumber);
                if (called) {
                    renderQueue();
                    renderHistory();
                }
            };
            
            queueList.appendChild(li);
        });
    }

    function renderHistory() {
        const history = getCalledHistory();
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-message">Nenhuma senha chamada recentemente.</p>';
            return;
        }

        history.forEach(p => {
            const li = document.createElement('li');
            // Corrigido para remover a marcação de negrito (**) que só funciona em markdown, e para ser mais legível
            li.innerHTML = `${p.fullNumber} (${p.type.name}) - Guichê ${p.guiche} às ${p.calledTime}`;
            historyList.appendChild(li);
        });
    }
    
    // 1. Chamada Automática
    callButton.onclick = () => {
        const guicheNumber = guicheInput.value.trim();
        
        if (!guicheNumber || isNaN(parseInt(guicheNumber))) {
            alert("Por favor, digite um número de guichê válido.");
            return;
        }

        const called = window.callNextPassword(guicheNumber);
        if (called) {
            renderQueue();
            renderHistory();
        }
    };
    
    // Atualiza a cada 5 segundos
    setInterval(renderQueue, 5000); 
    setInterval(renderHistory, 5000); 
    renderQueue();
    renderHistory();
};


// FUNÇÃO DO PAINEL DE EXIBIÇÃO - AGORA COM DETECÇÃO DE CHAMADA E ÁUDIO
window.initDisplayPanel = () => {
    const displayContainer = document.getElementById('display-container');
    const audioPlayer = document.getElementById('audio-alert'); 
    let lastCalledId = null; 

    if (!displayContainer) return;

    function renderDisplay() {
        const history = getCalledHistory();
        
        if (history.length === 0) {
            if (displayContainer.innerHTML.indexOf('empty-display') === -1) {
                 displayContainer.innerHTML = '<div class="empty-display">Aguardando Chamadas...</div>';
            }
            lastCalledId = null;
            return;
        }

        const latestCall = history[0];

        // Detecção de Nova Chamada
        const isNewCall = latestCall.id !== lastCalledId;

        if (isNewCall) {
            // Toca o som APENAS quando uma nova senha for detectada
            if (audioPlayer) {
                audioPlayer.currentTime = 0; 
                audioPlayer.volume = 1.0; 
                audioPlayer.play().catch(e => {
                    console.warn("Áudio não pôde ser tocado automaticamente. Requer interação do usuário.", e);
                });
            }
            
            lastCalledId = latestCall.id;
        
            // Limpa o painel e redesenha (Apenas quando houver uma nova senha)
            displayContainer.innerHTML = ''; 

            // Cria a área de destaque (última chamada)
            const latestDiv = document.createElement('div');
            latestDiv.className = 'latest-call highlight'; 
            latestDiv.innerHTML = `
                <div class="main-info">
                    <span class="password-number">${latestCall.fullNumber}</span>
                    <span class="guiche-number">GUICHÊ ${latestCall.guiche}</span>
                </div>
                <div class="category-info">
                    ${latestCall.type.name.toUpperCase()} | ${latestCall.calledTime}
                </div>
            `;
            displayContainer.appendChild(latestDiv);
            
            // Remove o destaque (classe 'highlight') após 4 segundos
            setTimeout(() => {
                latestDiv.classList.remove('highlight');
            }, 4000); 

            // Cria a lista de histórico (chamadas anteriores)
            const historyList = document.createElement('div');
            historyList.className = 'history-list-display';
            
            history.slice(1, 6).forEach(p => { 
                 const item = document.createElement('div');
                 item.className = 'history-item';
                 
                 // MODIFICADO AQUI: Adiciona p.calledTime (hora da chamada) ao histórico
                 item.innerHTML = `
                    <span class="history-number">${p.fullNumber}</span>
                    <span class="history-time">${p.calledTime.substring(0, 5)}</span> 
                    <span class="history-guiche">GUICHÊ ${p.guiche}</span>
                `;
                historyList.appendChild(item);
            });

            displayContainer.appendChild(historyList);
        }
    }
    
    setInterval(renderDisplay, 2000); 
    renderDisplay();
};


// FUNÇÃO PARA CONTORNAR O BLOQUEIO DE REPRODUÇÃO AUTOMÁTICA DO NAVEGADOR
window.activateAudio = () => {
    const activationDiv = document.getElementById('audio-activation');
    const audioPlayer = document.getElementById('audio-alert');

    if (audioPlayer) {
        audioPlayer.volume = 0.1; 
        audioPlayer.play().then(() => {
            console.log("Áudio desbloqueado com sucesso.");
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            if (activationDiv) {
                 activationDiv.style.display = 'none';
            }
        }).catch(e => {
             console.error("Erro ao tentar tocar áudio na ativação.", e);
             alert("Não foi possível ativar o áudio. Tente recarregar a página e clicar novamente.");
        });
    } else if (activationDiv) {
        activationDiv.style.display = 'none';
    }
}
