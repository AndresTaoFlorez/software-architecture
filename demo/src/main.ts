import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { getLayers } from './composition/container'
import { toLayerViews } from './presentation/layerViews'

createApp(App, { layers: toLayerViews(getLayers()) }).mount('#app')
