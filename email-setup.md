# Configuración de Notificaciones por Correo Electrónico

Este proyecto utiliza EmailJS para enviar notificaciones por correo electrónico a los usuarios cuando se agregan comentarios a una publicación. A continuación, se detallan los pasos para configurar este servicio:

## Paso 1: Crear una cuenta en EmailJS

1. Ve a [EmailJS](https://www.emailjs.com/) y regístrate para obtener una cuenta gratuita.
2. El plan gratuito permite enviar hasta 200 correos electrónicos por mes, lo cual es suficiente para probar el sistema.

## Paso 2: Configurar un servicio de correo

1. En tu dashboard de EmailJS, ve a "Email Services" y haz clic en "Add New Service".
2. Selecciona el servicio que deseas utilizar (Gmail, Outlook, etc.).
3. Sigue las instrucciones para conectar tu cuenta de correo.
4. Una vez conectado, copia el ID del servicio (lo necesitarás más adelante).

## Paso 3: Crear una plantilla de correo

1. En tu dashboard de EmailJS, ve a "Email Templates" y haz clic en "Create New Template".
2. Asigna un nombre a tu plantilla (por ejemplo, "NotificacionComentario").
3. Configura los campos de la plantilla:

   - **To Email**: `{{to_email}}`
   - **From Name**: `PerdidosYa!`
   - **From Email**: `notificaciones@perdidosya.web.app`
   - **Use Default Email Address**: No
   - **Reply To**: `notificaciones@perdidosya.web.app`
   - **BCC**: `{{bcc}}`
   - **Subject**: `Nuevo comentario en "{{item_name}}" - PerdidosYa!`

4. Diseña tu plantilla de correo. Puedes usar el siguiente código HTML como punto de partida:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Notificación de Nuevo Comentario</title>
    <style>
      /* Estilos generales */
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
        color: #333;
        background-color: #f9f9f9;
      }

      .container {
        padding: 30px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin: 20px;
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
      }

      /* Estilo del título similar al de la página principal */
      .site-title {
        font-size: 32px;
        font-weight: bold;
        background: linear-gradient(to right, #3182ce, #805ad5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
        margin: 0;
        padding: 10px 0;
      }

      .content {
        background-color: #f5f7fa;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 25px;
      }

      h2 {
        color: #2c3e50;
        margin-top: 0;
        font-size: 22px;
        font-weight: 600;
      }

      p {
        line-height: 1.6;
        margin: 12px 0;
        color: #4a5568;
      }

      /* Estilo del comentario */
      .comment-box {
        background-color: white;
        padding: 18px;
        border-left: 4px solid #3498db;
        margin: 25px 0;
        border-radius: 6px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }

      .author {
        color: #3498db;
        font-weight: 600;
      }

      /* Botón de acción */
      .action-button {
        text-align: center;
        margin: 30px 0;
      }

      .btn {
        background-color: #3498db;
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        display: inline-block;
        transition: background-color 0.3s;
      }

      .btn:hover {
        background-color: #2980b9;
      }

      /* Footer */
      .footer {
        border-top: 1px solid #eee;
        padding-top: 20px;
        margin-top: 25px;
        color: #a0aec0;
        font-size: 0.9em;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="site-title">PerdidosYa!</h1>
      </div>

      <div class="content">
        <h2>Nuevo comentario en tu publicación</h2>
        <p>Hola {{recipient_name}},</p>
        <p>
          Se ha agregado un nuevo comentario en la publicación
          "<strong>{{item_name}}</strong>":
        </p>

        <div class="comment-box">
          <p style="margin: 0;">
            <span class="author">{{comment_author}}</span>: {{comment_text}}
          </p>
        </div>

        <p>Puedes ver todos los comentarios visitando la publicación:</p>
        <div class="action-button">
          <a href="{{item_url}}" class="btn">Ver publicación</a>
        </div>
      </div>

      <div class="footer">
        <p>
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
        <p>
          PerdidosYa! - Ayudando a reunir personas con sus objetos perdidos.
        </p>
      </div>
    </div>
  </body>
</html>
```

5. Asegúrate de que en la plantilla aparezcan las siguientes variables:

   - `{{to_email}}` - El email del destinatario principal
   - `{{bcc}}` - Lista de emails en copia oculta (separados por comas)
   - `{{subject}}` - El asunto del correo
   - `{{recipient_name}}` - El nombre del destinatario
   - `{{item_name}}` - El nombre de la publicación
   - `{{item_url}}` - La URL de la publicación
   - `{{comment_author}}` - El nombre del autor del comentario
   - `{{comment_text}}` - El texto del comentario

6. Guarda la plantilla y copia el ID de la plantilla.

## Paso 4: Obtener la clave API pública

1. En tu dashboard de EmailJS, ve a "Account" > "API Keys".
2. Copia tu "Public Key".

## Paso 5: Configurar las variables de entorno

1. Abre el archivo `.env.local` en la raíz del proyecto.
2. Actualiza las siguientes variables con tus propios valores:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID="tu_service_id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="tu_template_id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="tu_public_key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000" # Cambia esto en producción
```

## Paso 6: Probar las notificaciones

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Inicia sesión en la aplicación
3. Busca una publicación existente o crea una nueva
4. Agrega un comentario
5. Verifica que se envíe la notificación por correo electrónico al autor de la publicación y a los otros comentaristas en BCC

## Notas adicionales

- En producción, asegúrate de actualizar `NEXT_PUBLIC_BASE_URL` con la URL de tu sitio web.
- Los correos enviados desde un cliente pueden acabar en spam. En producción, considera implementar un backend para enviar correos o usar un servicio especializado.
- EmailJS tiene un límite de 200 correos por mes en su plan gratuito. Si necesitas enviar más, considera actualizar a un plan de pago.
- **Optimización de correos**: Esta implementación envía un solo correo a múltiples destinatarios utilizando BCC (copia oculta), lo que reduce significativamente el número de correos enviados y te permite mantenerte dentro del límite gratuito más fácilmente.
- El sistema prioriza enviar el correo al dueño de la publicación como destinatario principal, y a los comentaristas en BCC, economizando el uso de tu cuota de EmailJS.
