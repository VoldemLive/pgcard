import { createApp } from 'vue'
import App  from './App'
import components from '@/components/UI'
const app = createApp(App)
components.forEach(element => {
    app.component(element.name, element);
});
app.mount('#app')
