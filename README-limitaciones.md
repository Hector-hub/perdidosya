# Limitaciones de Comentarios y Publicaciones

Para optimizar el uso de recursos y proporcionar una mejor experiencia a todos los usuarios, se han implementado las siguientes limitaciones:

## Limitación de Comentarios

Cada usuario está limitado a **3 comentarios por publicación**. Esta limitación ayuda a:

- Mantener las discusiones concisas y relevantes
- Reducir el spam y comentarios repetitivos
- Economizar el envío de notificaciones por correo electrónico

### Comportamiento:

- El usuario puede ver cuántos comentarios ha realizado en cada publicación
- Al alcanzar el límite, el formulario de comentarios se oculta y se muestra un mensaje indicando que se ha alcanzado el límite
- Los intentos de añadir más de 3 comentarios mediante la API son bloqueados con un mensaje de error

## Limitación de Publicaciones

Cada usuario está limitado a **3 publicaciones de objetos por día**. Esta limitación ayuda a:

- Prevenir el abuso de la plataforma
- Distribuir equitativamente los recursos entre todos los usuarios
- Mantener la calidad de las publicaciones

### Comportamiento:

- El contador de publicaciones diarias se muestra en la barra de navegación
- Al alcanzar el límite diario, el botón de "Publicar Objeto" se deshabilita
- Se muestra una alerta en la página principal cuando se alcanza el límite
- En el modal de creación de nuevas publicaciones, se muestra un mensaje informativo sobre el límite
- Los intentos de crear más de 3 publicaciones en un día mediante la API son bloqueados con un mensaje de error

## Reinicio de Contadores

- El contador de comentarios por publicación **nunca se reinicia** (el límite es permanente por publicación)
- El contador de publicaciones diarias se reinicia automáticamente a las 00:00 horas (medianoche) cada día

## Consideraciones Técnicas

- Las limitaciones se implementan tanto en el frontend como en el backend para garantizar su cumplimiento
- Los contadores se actualizan en tiempo real para reflejar las acciones del usuario
- En el panel de navegación, el contador de publicaciones se actualiza cada 5 minutos para mantenerlo al día

Si tiene preguntas o necesita asistencia adicional sobre estas limitaciones, contacte al equipo de soporte.
