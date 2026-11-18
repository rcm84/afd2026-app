import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),VitePWA({
 registerType:'prompt',injectRegister:'script',
 manifest:{name:'AFD App',short_name:'AFD',lang:'es',start_url:'./',scope:'./',display:'standalone',theme_color:'#F7F2E9',background_color:'#F7F2E9',icons:[{src:'afd-192.svg',sizes:'192x192',type:'image/svg+xml'},{src:'afd-512.svg',sizes:'512x512',type:'image/svg+xml'}]},
 workbox:{globPatterns:['**/*.{js,css,html,svg,png,ico,woff2}'],maximumFileSizeToCacheInBytes:4*1024*1024,navigateFallback:'index.html',skipWaiting:false,clientsClaim:false,cleanupOutdatedCaches:true}
})]});
