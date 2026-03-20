#!/bin/bash
# Build script para minificar y ofuscar en producción

# Requerimientos:
# npm install -g terser uglify-js

echo "🔨 Minificando y ofuscando código..."

# Minificar script.js
if command -v terser &> /dev/null; then
  terser script.js -o script.min.js \
    -c toplevel=true,passes=3,unsafe=true \
    -m toplevel=true,eval=true
  echo "✅ script.js minificado → script.min.js"
else
  echo "⚠️ terser no instalado. Instala con: npm install -g terser"
fi

# Minificar emailjs-config.js
if [ -f emailjs-config.js ]; then
  terser emailjs-config.js -o emailjs-config.min.js \
    -c toplevel=true,passes=3 \
    -m toplevel=true
  echo "✅ emailjs-config.js minificado"
fi

# Minificar firebase-config.js
if [ -f firebase-config.js ]; then
  terser firebase-config.js -o firebase-config.min.js \
    -c toplevel=true,passes=3 \
    -m toplevel=true
  echo "✅ firebase-config.js minificado"
fi

# Minificar styles.css (opcional con cssnano)
if command -v cleancss &> /dev/null; then
  cleancss -o styles.min.css styles.css
  echo "✅ styles.css minificado"
fi

echo ""
echo "📋 Próximos pasos:"
echo "1. Actualiza index.html para usar .min.js en producción"
echo "2. Usa versiones normales (.js) en desarrollo"
echo "3. Deploy a Netlify usa la versión minificada"
