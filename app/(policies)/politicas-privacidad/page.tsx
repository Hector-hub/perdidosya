export default function PoliticasPrivacidad() {
  return (
    <div className="bg-card rounded-lg shadow-lg p-8">
      <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-muted-foreground mb-8">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-muted/50 p-4 rounded-lg mb-8">
          <p className="text-lg">
            En PerdidosYa!, nos tomamos muy en serio la privacidad de nuestros
            usuarios. Esta plataforma actúa únicamente como medio de
            comunicación para facilitar la recuperación de objetos perdidos en
            el campus universitario.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. Alcance del Servicio
        </h2>
        <p>
          PerdidosYa! es una plataforma de comunicación que facilita la conexión
          entre personas que han perdido objetos y quienes los han encontrado.
          Es importante notar que:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            La plataforma no se hace responsable de los objetos reportados.
          </li>
          <li>No garantizamos la recuperación de los objetos.</li>
          <li>Actuamos únicamente como medio de comunicación.</li>
          <li>
            El proceso de recuperación debe seguir el protocolo oficial de la
            universidad.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. Flujo de Recuperación
        </h2>
        <p>El proceso oficial de recuperación de objetos es el siguiente:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            La persona que encuentra el objeto debe entregarlo al área de
            objetos perdidos de la universidad.
          </li>
          <li>
            El dueño del objeto debe reclamarlo en el área de objetos perdidos.
          </li>
          <li>PerdidosYa! solo facilita la comunicación entre las partes.</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. Información Recopilada
        </h2>
        <p>
          Recopilamos la siguiente información cuando utilizas nuestra
          plataforma:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Información de cuenta (nombre, correo electrónico).</li>
          <li>Información de perfil (foto de perfil, nombre de usuario).</li>
          <li>Información de publicaciones (objetos perdidos/encontrados).</li>
          <li>Datos de uso y analíticos.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          4. Uso de la Información
        </h2>
        <p>La información recopilada se utiliza exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Facilitar la comunicación entre usuarios.</li>
          <li>Mejorar la experiencia en la plataforma.</li>
          <li>Enviar notificaciones relevantes sobre objetos reportados.</li>
          <li>Mantener la seguridad de la plataforma.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          5. Protección de Datos
        </h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para
          proteger tu información personal. Sin embargo, es importante que:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>No compartas información sensible en las publicaciones.</li>
          <li>Utilices el sistema de mensajería interno para comunicarte.</li>
          <li>Reportes cualquier actividad sospechosa.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política de privacidad o sobre el uso
          de la plataforma, contáctanos en:
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
