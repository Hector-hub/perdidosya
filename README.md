# PerdidosYa! 🎒

Una plataforma web moderna para ayudar a la comunidad universitaria a encontrar objetos perdidos y facilitar su recuperación.

## 🌟 Características

- 🔍 Búsqueda avanzada de objetos perdidos
- 📱 Diseño responsive y moderno
- 🔐 Autenticación segura con Firebase
- 🖼️ Carga y moderación de imágenes
- 📍 Categorización por ubicaciones
- 🔔 Notificaciones en tiempo real
- 🌐 Interfaz en español
- 🎨 Tema claro/oscuro

## 🚀 Tecnologías Utilizadas

- **Frontend:**

  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - Lucide Icons

- **Backend:**

  - Firebase
  - Firebase Authentication
  - Firebase Storage
  - Firebase Firestore

- **Herramientas:**
  - ESLint
  - Prettier
  - TypeScript
  - Git

## 📋 Prerrequisitos

- Node.js 18.x o superior
- npm o yarn
- Cuenta de Firebase
- Navegador moderno

## 🛠️ Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/perdidosya.git
   cd perdidosya
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o
   yarn install
   ```

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Uso

1. **Registro/Inicio de Sesión:**

   - Crea una cuenta o inicia sesión con tu cuenta existente
   - Verifica tu correo electrónico

2. **Reportar Objeto Perdido:**

   - Haz clic en "Reportar Objeto"
   - Completa el formulario con los detalles
   - Sube una imagen del objeto
   - Selecciona la ubicación y categoría

3. **Buscar Objetos:**
   - Usa el buscador en la página principal
   - Filtra por categoría o ubicación
   - Contacta al finder si encuentras tu objeto

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia Apache 2.0 - ver el archivo [LICENSE-2.0.txt](LICENSE-2.0.txt) para más detalles.

## 👥 Autores

- **Hector Hub** - _Desarrollo inicial_ - [hector-hub](https://github.com/hector-hub)

## 🙏 Agradecimientos

- A la comunidad de Next.js por su excelente documentación
- A los creadores de Shadcn/ui por sus componentes
- A todos los contribuidores y usuarios de la plataforma

## 📞 Contacto

Hector Hub - [@hector_hub](https://twitter.com/hector_hub) - plurals.standby.7k@icloud.com

Link del Proyecto: [https://github.com/hector-hub/perdidosya](https://github.com/hector-hub/perdidosya)
