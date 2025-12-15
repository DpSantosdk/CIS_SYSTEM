// print.js

window.printPassword = (fullNumber, typeName, issueTime) => {
    // 1. Cria o conteúdo HTML com estilos para impressão
    const printContent = `
        <html>
        <head>
            <title>Senha de Atendimento</title>
            <style>
                /* Estilos aplicados APENAS durante a impressão */
                @media print {
                    /* Configura o tamanho da página para 80mm e margem zero */
                    @page {
                        size: 80mm auto; /* Largura 80mm, altura ajusta ao conteúdo */
                        margin: 0;
                    }
                    
                    /* Limpa margens padrão do corpo */
                    body {
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                        font-family: 'Consolas', monospace; /* Fonte para recibo */
                        color: #000;
                        /* Garante que o fundo branco seja impresso, se necessário */
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* Força margem zero e remove elementos de rodapé/cabeçalho */
                    header, footer, nav, aside {
                        display: none;
                    }
                }

                /* Estilos visuais do recibo */
                .ticket {
                    padding: 10px 5px;
                    text-align: center;
                }
                .header {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .password-number {
                    font-size: 3.5em; /* Destaque máximo */
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
                    CIS - AFYA TERESINA
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

    // 2. Abre uma nova janela/aba
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está ativo.');
        return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // 3. Dispara a impressão
    printWindow.onload = function() {
        // Tenta dar foco à janela de impressão antes de imprimir, para maior compatibilidade
        printWindow.focus();
        printWindow.print();
        
        // Timeout para fechar a janela/aba
        setTimeout(() => {
            printWindow.close();
        }, 500); 
    };
};

