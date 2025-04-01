export default function TerminosCondiciones() {
  return (
    <div className="bg-card rounded-lg shadow-lg p-8">
      <h1 className="text-4xl font-bold mb-2">Términos y Condiciones</h1>
      <p className="text-muted-foreground mb-8">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-muted/50 p-4 rounded-lg mb-8">
          <p className="text-lg">
            Al utilizar PerdidosYa!, aceptas estos términos y condiciones. Esta
            plataforma actúa únicamente como medio de comunicación para
            facilitar la recuperación de objetos perdidos en el campus
            universitario.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. Alcance del Servicio
        </h2>
        <p>PerdidosYa! es una plataforma de comunicación que:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Facilita la conexión entre personas que han perdido objetos y
            quienes los han encontrado.
          </li>
          <li>No se hace responsable de los objetos reportados.</li>
          <li>No garantiza la recuperación de los objetos.</li>
          <li>Actúa únicamente como medio de comunicación.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          2. Proceso de Recuperación
        </h2>
        <p>
          El proceso oficial de recuperación de objetos debe seguir estos pasos:
        </p>
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
          3. Responsabilidades del Usuario
        </h2>
        <p>Al utilizar nuestra plataforma, te comprometes a:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Proporcionar información precisa y veraz.</li>
          <li>No publicar contenido inapropiado o ofensivo.</li>
          <li>Respetar los derechos de otros usuarios.</li>
          <li>No utilizar el servicio para fines ilegales.</li>
          <li>Seguir el proceso oficial de recuperación de objetos.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          4. Limitación de Responsabilidad
        </h2>
        <p>PerdidosYa! no se hace responsable de:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>La pérdida o daño de objetos reportados.</li>
          <li>La recuperación exitosa de los objetos.</li>
          <li>Las interacciones entre usuarios fuera de la plataforma.</li>
          <li>
            El funcionamiento del área de objetos perdidos de la universidad.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Los cambios entrarán en vigor inmediatamente después de su
          publicación.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contacto</h2>
        <p>
          Si tienes preguntas sobre estos términos o sobre el uso de la
          plataforma, contáctanos en:
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
