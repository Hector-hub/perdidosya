export default function PoliticasCookies() {
  return (
    <div className="bg-card rounded-lg shadow-lg p-8">
      <h1 className="text-4xl font-bold mb-2">Política de Cookies</h1>
      <p className="text-muted-foreground mb-8">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-muted/50 p-4 rounded-lg mb-8">
          <p className="text-lg">
            Esta política de cookies explica cómo PerdidosYa! utiliza las
            cookies y tecnologías similares para mejorar tu experiencia en
            nuestra plataforma.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. ¿Qué son las cookies?
        </h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu
          dispositivo cuando visitas nuestra plataforma. Nos ayudan a:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Mantener tu sesión activa.</li>
          <li>Recordar tus preferencias.</li>
          <li>Mejorar la seguridad de la plataforma.</li>
          <li>Analizar el uso de la plataforma.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. Tipos de cookies que utilizamos
        </h2>
        <p>Utilizamos los siguientes tipos de cookies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Cookies esenciales:</strong> Necesarias para el
            funcionamiento básico de la plataforma.
          </li>
          <li>
            <strong>Cookies de funcionalidad:</strong> Permiten recordar tus
            preferencias y configuraciones.
          </li>
          <li>
            <strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo
            se utiliza la plataforma.
          </li>
          <li>
            <strong>Cookies de seguridad:</strong> Protegen tu cuenta y datos
            personales.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. Control de cookies
        </h2>
        <p>Puedes controlar las cookies a través de tu navegador:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Bloquear todas las cookies.</li>
          <li>Eliminar las cookies existentes.</li>
          <li>Configurar preferencias específicas por sitio.</li>
        </ul>
        <p className="mt-4">
          Ten en cuenta que al deshabilitar ciertas cookies, algunas funciones
          de la plataforma pueden no funcionar correctamente.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Actualizaciones</h2>
        <p>
          Nos reservamos el derecho de actualizar esta política de cookies en
          cualquier momento. Los cambios entrarán en vigor inmediatamente
          después de su publicación.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contacto</h2>
        <p>
          Si tienes preguntas sobre nuestra política de cookies, contáctanos en:
          <br />
          <a
            href="mailto:plurals.standby.7k@icloud.com"
            className="text-primary hover:underline"
          >
            plurals.standby.7k@icloud.com
          </a>
        </p>
      </div>
    </div>
  );
}
