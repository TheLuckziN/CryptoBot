const { Client, Intents } = require('discord.js');
const config = require('./config.json');

let fetch; // Declaração da variável fetch

// Importação dinâmica do módulo node-fetch
(async () => {
    const module = await import('node-fetch');
    fetch = module.default;
})();

const client = new Client({
    intents: [
        1 << 0, // Intenção GUILDS
        1 << 9  // Intenção GUILD_MESSAGES
    ]
});

const channelId = '1217847272315027478';
const cryptoSymbols = [
    'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'XRPUSDT', 'BNBUSDT',
    'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'LINKUSDT', 'LTCUSDT',
    'BCHUSDT', 'MATICUSDT', 'ICPUSDT', 'UNIUSDT', 'FILUSDT',
    'THETAUSDT', 'XLMUSDT', 'VETUSDT', 'TRXUSDT', 'EOSUSDT'
]; // Símbolos das criptomoedas na Binance

let cryptoMessage = null; // Variável para armazenar a mensagem

client.once('ready', () => {
    console.log(`Bot logado como ${client.user.tag}!`);
    client.user.setActivity('comandos de barra', { type: 'LISTENING' });

    setInterval(sendCryptoUpdates, 1 * 60 * 1000); // 1 minuto
    console.log('Enviando atualização do mercado de criptomoedas...');
});

async function sendCryptoUpdates() {
    try {
        const cryptoData = await fetchCryptoData();
        const channel = await client.channels.fetch(channelId);

        if (!cryptoMessage) {
            // Se a mensagem ainda não foi enviada, aqui ele vai enviar
            cryptoMessage = await channel.send({ embeds: [cryptoData] });
        } else {
            // Se a mensagem já foi enviada, aqui vai atualizar
            await cryptoMessage.edit({ embeds: [cryptoData] });
        }
    } catch (error) {
        console.error('Erro ao enviar/atualizar a mensagem do mercado de criptomoedas:', error);
    }
}

async function fetchCryptoData() {
    const cryptoPrices = await Promise.all(
        cryptoSymbols.map(async symbol => {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await response.json();
            return { symbol, price: data.price };
        })
    );

    const embed = {
        title: 'Atualização Criptomoedas',
        description: 'As 3 primeiras letras são as siglas das moedas.',
        fields: cryptoPrices.map(crypto => ({
            name: crypto.symbol,
            value: `Preço: $${parseFloat(crypto.price).toFixed(2)}`
        })),
        timestamp: new Date(),
        footer: {
            text: 'Atualizado em',
        },
        color: 0x01C37C
    };

    return embed;
}

client.login(config.token);