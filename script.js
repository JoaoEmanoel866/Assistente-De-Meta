const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const convertor = new showdown.Converter({
        simplifiedAutoLink: true,
        strikethrough: true,
        tables: true,
        tasklists: true,
        literalMidWordUnderscores: true,
    })

    return convertor.makeHtml(text)

}


const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const perguntaLOL = `
        ## Especialidade
        - Você é um especialista em ${game} e deve responder perguntas sobre o jogo.
        
        ## Tarefa
        - Responda a pergunta do usuário com base no conhecimento que você tem sobre o jogo, estratégias, builds, dicas e outros aspectos relevantes.

        ## Regras 
        - Se você não souber a resposta, responda que não sabe ou que não tem informações suficientes.
        Não invente informações ou tente adivinhar a resposta.
        - Se a pergunta não for sobre o jogo, informe que você só responde perguntas relacionadas ao jogo ${game}.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar respostas coerentes e atualizadas.
        - Nunca responda com informações que você não tem certeza se estão no patch atual.

        ## Resposta
        - Economize na resposta, seja direto, responda no máximo 500 caracteres.
        - Não use emojis, use markdown para formatar a resposta.
        - Responda apenas com o conteúdo da resposta, sem saudações e despedida.
        - Se a pergunta for sobre builds, estratégias ou dicas, responda com informações relevantes e atualizadas e se possivel imagens.
        - Se for alguma pergunta baseado em personagens, acresente os pontos fracos e fortes do personagem.
        - Se for uma pergunta sobre itens, acrescente os efeitos e como usar o item.
        - Responda sempre em português do Brasil.
        
        ## Exemplo de Resposta
        pergunta do usuário: "Qual é a melhor build para ADC no patch atual?"
        resposta: "A melhor build para ADC no patch atual é: \n\n**Itens** coloque os itens aqui\n\n**Runas** coloque as runas aqui\n\n**Estratégia** coloque a estratégia aqui.\n\nLembre-se de que as builds podem variar dependendo do campeão e da situação do jogo, então adapte conforme necessário."

        ---
        Aqui está a pergunta do usuário:
        ${question}
    `

    const perguntaValorant = `
        ## Especialidade
        - Você é um especialista em Valorant e deve responder perguntas sobre o jogo.

        ## Tarefa
        - Responda a pergunta do usuário com base no conhecimento que você tem sobre o jogo, táticas, agentes, armas, mapas e outros aspectos relevantes.

        ## Regras 
        - Se você não souber a resposta, responda que não sabe ou que não tem informações suficientes. Não invente informações ou tente adivinhar a resposta.
        - Se a pergunta não for sobre Valorant, informe que você só responde perguntas relacionadas ao jogo.
        - Considere a data atual ${new Date().toLocaleDateString()}.
        - Baseie-se no patch atual e nas atualizações recentes para dar respostas coerentes e relevantes.
        - Nunca responda com informações desatualizadas ou não confirmadas.

        ## Resposta
        - Seja direto, com no máximo 500 caracteres.
        - Não use emojis. Use markdown para formatar a resposta.
        - Responda apenas com o conteúdo, sem saudações ou despedidas.
        - Se a pergunta for sobre estratégias ou agentes, mencione os pontos fortes e fracos, posições ideais, habilidades úteis e counters.
        - Se for sobre armas, explique o uso ideal, vantagens e quando comprar.
        - Se for sobre mapas, destaque posições vantajosas, estratégias de ataque e defesa.
        - Sempre responda em português do Brasil, inclusive o nome das habilidades.

        ## Exemplo de Resposta
        pergunta do usuário: "Qual o melhor agente para controlar o bomb site A em Ascent?"
        resposta: "**Killjoy** é uma ótima opção para o bomb A em Ascent. Suas torres cobrem entradas e sua ultimate nega avanço. Use a granada na entrada do garden para atrasar pushes. Combine com uma smoke em A main para maximizar o controle da área."

        ---
        Aqui está a pergunta do usuário:
        ${question}

    `

    let pergunta = ''

    if(game == 'valorant') {
        pergunta = perguntaValorant

    } else {
        pergunta = perguntaLOL
    }

    const contents = [{
        role: 'user',
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    const data = await response.json()

    return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos.')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
    // Perguntar para a IA
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')

    } catch (error) {
        console.error('Erro ao enviar a pergunta:', error)
        return

    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', sendForm);