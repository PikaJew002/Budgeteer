import './bootstrap.js';
import '../sass/app.scss';

import { createApp } from 'vue';
import { router } from './routes.js';
import { store } from './store.js';
import mitt from 'mitt';
import App from './App.vue';

const app = createApp(App);
const eventBus = mitt();

app.use(router);
app.use(store);
app.provide('eventBus', eventBus);
app.mount('#app');
