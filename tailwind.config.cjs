/** @type {import('tailwindcss').Config} */
module.exports = {
 content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
 theme: { extend: {
  colors: {
   fondo: 'var(--fondo)', texto: 'var(--texto)', primario: 'var(--primario)',
   oro: 'var(--oro)', 'rojo-fuego': 'var(--rojo-fuego)', 'verde-ok': 'var(--verde-ok)',
   'azul-staff': 'var(--azul-staff)', 'blanco-tarjeta': 'var(--blanco-tarjeta)',
   pendiente: 'var(--pendiente)', 'oro-oscuro': 'var(--oro-oscuro)',
   'texto-ayuda': 'var(--texto-ayuda)', 'borde-input': 'var(--borde-input)',
   'primario-texto': 'var(--primario-texto)',
  },
  minHeight: { tap: '48px', control: '52px' },
  borderRadius: { tarjeta: '20px', control: '12px' },
  fontSize: { base: ['16px', { lineHeight: '1.6' }] },
 } }, plugins: [],
};
