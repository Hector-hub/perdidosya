#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\x1b[36m%s\x1b[0m", "🔍 Verificando configuración de Firebase...");

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), ".env.local");
let envContent = "";
let hasEnvFile = false;

try {
  envContent = fs.readFileSync(envPath, "utf8");
  hasEnvFile = true;
  console.log("\x1b[32m%s\x1b[0m", "✅ Archivo .env.local encontrado");
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", "❌ No se encontró archivo .env.local");
}

// Verificar configuración de Firebase
const firebaseConfigVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingVars = [];
let configOk = true;

if (hasEnvFile) {
  console.log("\n\x1b[36m%s\x1b[0m", "🔍 Verificando variables de Firebase...");

  firebaseConfigVars.forEach((varName) => {
    if (!envContent.includes(varName + "=")) {
      missingVars.push(varName);
      configOk = false;
    } else {
      const regex = new RegExp(`${varName}=["']?([^"'\n]+)["']?`);
      const match = envContent.match(regex);
      if (match && match[1] && match[1].includes("your_")) {
        console.log(
          "\x1b[33m%s\x1b[0m",
          `⚠️ ${varName} parece tener un valor predeterminado, no una configuración real`
        );
        configOk = false;
      } else if (match && match[1]) {
        console.log("\x1b[32m%s\x1b[0m", `✅ ${varName} configurado`);
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          `❌ ${varName} no tiene un valor válido`
        );
        configOk = false;
      }
    }
  });
}

// Verificar archivos de configuración de Firebase
console.log(
  "\n\x1b[36m%s\x1b[0m",
  "🔍 Verificando archivos de configuración..."
);

const firebaseFiles = ["lib/firebase.ts", "firebase/config.ts"];

let hasDuplicateConfig = false;
let filesFound = 0;

firebaseFiles.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    fs.readFileSync(fullPath, "utf8");
    filesFound++;
    console.log("\x1b[32m%s\x1b[0m", `✅ Archivo ${filePath} encontrado`);
  } catch (error) {
    console.log("\x1b[33m%s\x1b[0m", `⚠️ Archivo ${filePath} no encontrado`);
  }
});

if (filesFound > 1) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    `❌ Se encontraron múltiples archivos de configuración de Firebase. Esto puede causar problemas de inicialización duplicada.`
  );
  hasDuplicateConfig = true;
}

// Verificar conexión a Firebase
console.log("\n\x1b[36m%s\x1b[0m", "🔍 Realizando diagnóstico de red...");

try {
  console.log(
    "\x1b[90m%s\x1b[0m",
    "Verificando conectividad a identitytoolkit.googleapis.com..."
  );
  execSync(
    'curl -s -o /dev/null -w "%{http_code}" https://identitytoolkit.googleapis.com/'
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ Conectividad a servicios de Firebase Authentication OK"
  );
} catch (error) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "❌ Error de conectividad a servicios de Firebase Authentication"
  );
}

try {
  console.log(
    "\x1b[90m%s\x1b[0m",
    "Verificando conectividad a firestore.googleapis.com..."
  );
  execSync(
    'curl -s -o /dev/null -w "%{http_code}" https://firestore.googleapis.com/'
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ Conectividad a servicios de Firestore OK"
  );
} catch (error) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "❌ Error de conectividad a servicios de Firestore"
  );
}

// Resumen
console.log("\n\x1b[36m%s\x1b[0m", "📋 Resumen del diagnóstico:");

if (!hasEnvFile) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "❌ Falta archivo .env.local. Debes crear este archivo con las variables de Firebase."
  );
}

if (missingVars.length > 0) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "❌ Faltan las siguientes variables en .env.local:"
  );
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
}

if (hasDuplicateConfig) {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "❌ Múltiples configuraciones de Firebase pueden causar errores como \"Firebase App named '[DEFAULT]' already exists\""
  );
  console.log(
    "\x1b[33m%s\x1b[0m",
    "⚠️ Recomendación: Usa solo una configuración en lib/firebase.ts y elimina o modifica firebase/config.ts para que importe desde lib/firebase.ts"
  );
}

if (configOk && !hasDuplicateConfig) {
  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ La configuración de Firebase parece correcta"
  );
} else {
  console.log(
    "\x1b[33m%s\x1b[0m",
    "⚠️ Se encontraron problemas en la configuración de Firebase"
  );
}

// Pasos siguientes
console.log("\n\x1b[36m%s\x1b[0m", "🔧 Pasos sugeridos:");

if (!configOk) {
  console.log(`
1. Crear o editar el archivo .env.local con la configuración correcta de Firebase
2. Obtener las credenciales correctas de la consola de Firebase (https://console.firebase.google.com/)
3. En la consola de Firebase, asegurarse de:
   - Habilitar Authentication > Sign-in method > Google
   - Añadir localhost a Authentication > Settings > Authorized domains
   - Configurar las restricciones de API en Google Cloud Platform
`);
} else {
  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ Todo parece estar configurado correctamente"
  );
}

rl.close();
