export default function CatalogoLoading() {
  return (
    <div className="container py-8 space-y-8">
      {/* Encabezado esqueleto */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="w-full md:w-auto">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-2"></div>
        </div>
        <div className="flex items-center w-full md:w-auto gap-2">
          <div className="h-10 w-full md:w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Tabs esqueleto */}
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>

      {/* Filtros esqueleto */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      </div>

      {/* Esqueleto de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-80"
            ></div>
          ))}
      </div>
    </div>
  );
}
