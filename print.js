// print.js

// Função que recebe os dados da senha e dispara a impressão
window.printPassword = (fullNumber, typeName, issueTime) => {
    // 1. Cria o conteúdo HTML do recibo
    const printContent = `
        <html>
        <head>
            <title>Senha de Atendimento</title>
            <style>
                /* Configurações básicas para a bobina de 80mm */
                @page {
                    size: 80mm 30cm; /* Largura da bobina (80mm) */
                    margin: 0;
                }
                body {
                    width: 80mm;
                    margin: 0;
                    padding: 0;
                    font-family: 'Consolas', monospace; /* Fonte que simula recibos */
                    text-align: center;
                    color: #000;
                }
                .ticket {
                    padding: 10px 5px;
                    background-color: #fff;
                }
                .header {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .password-number {
                    font-size: 3em; /* Destaque grande para a senha */
                    font-weight: bold;
                    display: block;
                    margin: 15px 0;
                    border-bottom: 2px dashed #ccc;
                    border-top: 2px dashed #ccc;
                    padding: 10px 0;
                }
                .category {
                    font-size: 1.5em;
                    margin-bottom: 10px;
                }
                .time {
                    font-size: 1em;
                    margin-top: 15px;
                }
                .footer {
                    font-size: 0.8em;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    SUA EMPRESA AQUI
                </div>
                <div class="password-number">
                    ${fullNumber}
                </div>
                <div class="category">
                    ${typeName}
                </div>
                <div class="time">
                    Retirada às: ${issueTime}
                </div>
                <div class="footer">
                    Aguarde a chamada no painel principal.<br>Obrigado!
                </div>
            </div>
        </body>
        </html>
    `;

    // 2. Abre uma nova janela/aba para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está ativo.');
        return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 3. Dispara o comando de impressão e fecha a janela após o comando
    printWindow.onload = function() {
        printWindow.print();
        
        // Timeout para fechar a janela/aba após a impressão ser disparada (pode variar)
        setTimeout(() => {
            printWindow.close();
        }, 500); 
    };
};