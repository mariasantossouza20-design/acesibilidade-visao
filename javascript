        // --- 1. CONTROLE DE TEMA E CONTRASTE ---
        function alternarContraste() {
            document.body.classList.toggle('alto-contraste');
            const ativo = document.body.classList.contains('alto-contraste');
            emitirAvisoSonoro(ativo ? "Alto contraste ativado." : "Alto contraste desativado.");
        }

        // --- 2. CONTROLE DE TAMANHO DE FONTE ---
        let tamanhoFonteAtual = 100;
        function alterarFonte(direcao) {
            tamanhoFonteAtual += (direcao * 10);
            if (tamanhoFonteAtual >= 100 && tamanhoFonteAtual <= 200) {
                document.documentElement.style.fontSize = tamanhoFonteAtual + '%';
                emitirAvisoSonoro(`Tamanho do texto ajustado para ${tamanhoFonteAtual} por cento.`);
            }
        }

        // --- 3. SINTETIZADOR DE VOZ (TEXT-TO-SPEECH) ---
        function emitirAvisoSonoro(texto) {
            window.speechSynthesis.cancel(); // Cancela falas anteriores em fila
            const fala = new SpeechSynthesisUtterance(texto);
            fala.lang = 'pt-BR';
            window.speechSynthesis.speak(fala);
        }

        function falarTextoPrincipal() {
            const texto = document.getElementById('campo-texto').value;
            if (!texto.trim()) {
                emitirAvisoSonoro("O campo de texto está vazio.");
                return;
            }
            emitirAvisoSonoro(texto);
        }

        function lerResultado() {
            const texto = document.getElementById('texto-resultado').innerText;
            emitirAvisoSonoro(texto);
        }

        // --- 4. RECONHECIMENTO DE VOZ (SPEECH-TO-TEXT) ---
        let reconhecimento;
        let gravando = false;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            reconhecimento = new SpeechRecognition();
            reconhecimento.lang = 'pt-BR';
            reconhecimento.continuous = false;
            reconhecimento.interimResults = false;

            reconhecimento.onstart = () => {
                gravando = true;
                const btn = document.getElementById('btn-ditar');
                btn.classList.add('status-gravando');
                btn.innerHTML = "🛑 Gravando... Fale agora";
                emitirAvisoSonoro("Microfone ativado. Pode falar.");
            };

            reconhecimento.onresult = (event) => {
                const resultadoVoz = event.results[0][0].transcript;
                document.getElementById('campo-texto').value = resultadoVoz;
                
                // VALIDADOR INTELIGENTE: Valida e processa automaticamente após o ditado
                validarEProcessarComVoz(resultadoVoz);
            };

            reconhecimento.onerror = () => {
                emitirAvisoSonoro("Houve um erro na captura da voz. Tente novamente.");
                pararGravacao();
            };

            reconhecimento.onend = () => {
                pararGravacao();
            };
        } else {
            document.getElementById('btn-ditar').disabled = true;
            document.getElementById('btn-ditar').setAttribute('aria-label', 'Ditado por voz não suportado neste navegador');
        }

        function alternarDitado() {
            if (!reconhecimento) return;
            if (gravando) {
                reconhecimento.stop();
            } else {
                reconhecimento.start();
            }
        }

        function pararGravacao() {
            gravando = false;
            const btn = document.getElementById('btn-ditar');
            btn.classList.remove('status-gravando');
            btn.innerHTML = "🎙️ Ditar Texto";
        }

        // --- 5. VALIDADOR DE VOZ E LÓGICA DE PROCESSAMENTO ---
        function clicarBotaoProcessar() {
            const textoDoCampo = document.getElementById('campo-texto').value;
            validarEProcessarComVoz(textoDoCampo);
        }

        function validarEProcessarComVoz(texto) {
            const campo = document.getElementById('campo-texto');
            const blocoResultado = document.getElementById('bloco-resultado');
            const textoResultado = document.getElementById('texto-resultado');

            // 1. Validação física e auditiva de campo vazio
            if (!texto || !texto.trim()) {
                blocoResultado.style.display = 'none';
                campo.focus(); // Move o foco do teclado de volta para o campo
                emitirAvisoSonoro("Aviso do validador: O campo de texto está vazio. Digite uma mensagem ou use o botão de ditar antes de enviar.");
                return;
            }

            // 2. Processamento caso o texto passe na validação
            const totalCaracteres = texto.trim().length;
            const textoProcessado = `Validação concluída com sucesso. Seu texto possui ${totalCaracteres} caracteres e foi enviado para processamento.`;
            
            textoResultado.innerText = textoProcessado;
            blocoResultado.style.display = 'block';

            setTimeout(() => {
                emitirAvisoSonoro(textoProcessado);
            }, 300);
        }
