export enum Location {
  CAFETERIA = "Cafetería",
  BIBLIOTECA = "Biblioteca",
  GIMNASIO = "Gimnasio",
  PLAZOLETA = "Plazoleta",
  AUDITORIO = "Auditorio",
  EDIFICIO_AULA = "Edificio/Aula",
  OTROS = "Otros",
}

export const getLocationDescription = (location: Location): string => {
  switch (location) {
    case Location.EDIFICIO_AULA:
      return "Por favor, especifica el edificio y aula en la descripción";
    case Location.OTROS:
      return "Por favor, especifica la ubicación en la descripción";
    default:
      return "";
  }
};
