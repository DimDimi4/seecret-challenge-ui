import { createApp } from 'vue';
import vClickOutside from 'click-outside-vue3';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueCookies from 'vue-cookies';

import App from './App.vue';

const app = createApp(App);
app.use(vClickOutside);
app.use(
    VueAxios,
    axios.create({
        baseURL: 'http://localhost:8080/',
    }),
);
app.use(VueCookies, { expire: '7d' });
app.mount('#app');
