const Agenda = require('agenda');
require('dotenv').config();

const agenda = new Agenda({
    db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '10 seconds'
});

agenda.on('ready', async () => {
    console.log('✅ Agenda job queue ready');
    await agenda.start();
});

agenda.on('error', (err) => {
    console.error('❌ Agenda connection error:', err);
});

module.exports = agenda;
