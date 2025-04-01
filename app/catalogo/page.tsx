"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Plus,
  LogOut,
  Loader2,
} from "lucide-react";
import { ItemCard } from "@/components/item-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportarObjetoModal } from "@/components/reportar-objeto-modal";
import { UserNameModal } from "@/components/user-name-modal";
import { Item, Comment } from "@/types";
import { Location } from "@/types/locations";
import Swal from "sweetalert2";
import useFirebase from "@/hooks/useFirebase";
import { getAuth, signOut } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Número de elementos por página para cargar
const ITEMS_PER_PAGE = 12;

export default function Catalogo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState<Location | "all">("all");
  const [showMyItemsOnly, setShowMyItemsOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  // Refs para observadores de intersección
  const observerTodos = useRef<IntersectionObserver | null>(null);
  const observerPerdidos = useRef<IntersectionObserver | null>(null);
  const observerEncontrados = useRef<IntersectionObserver | null>(null);

  // Refs para elementos de carga
  const loadMoreTodosRef = useRef<HTMLDivElement>(null);
  const loadMorePerdidosRef = useRef<HTMLDivElement>(null);
  const loadMoreEncontradosRef = useRef<HTMLDivElement>(null);

  const {
    getItems,
    loadMoreItems,
    resetPagination,
    hasMoreItems,
    addComment,
    addOrUpdateItem,
    toggleLike,
    deleteComment,
    deleteItemById,
  } = useFirebase();

  const auth = getAuth(firebase_app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      // Solo realizar la carga inicial una vez que la autenticación esté inicializada
      if (!authInitialized) {
        setAuthInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [auth, authInitialized]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      resetPagination(); // Resetear paginación al hacer una nueva búsqueda
      const fetchedItems = await getItems(ITEMS_PER_PAGE);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error al cargar los objetos:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al cargar los objetos",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  }, [getItems, resetPagination]);

  // Función para cargar más elementos
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMoreItems) return;

    try {
      setLoadingMore(true);
      const moreItems = await loadMoreItems(ITEMS_PER_PAGE);
      setItems((prev) => [...prev, ...moreItems]);
    } catch (error) {
      console.error("Error al cargar más objetos:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadMoreItems, loadingMore, hasMoreItems]);

  // Configurar los observadores de intersección para cada tab
  useEffect(() => {
    // Crear nuevos observadores de intersección
    observerTodos.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeTab === "todos") {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerPerdidos.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeTab === "perdidos") {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerEncontrados.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeTab === "encontrados") {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    // Observar los elementos de carga
    if (loadMoreTodosRef.current) {
      observerTodos.current.observe(loadMoreTodosRef.current);
    }
    if (loadMorePerdidosRef.current) {
      observerPerdidos.current.observe(loadMorePerdidosRef.current);
    }
    if (loadMoreEncontradosRef.current) {
      observerEncontrados.current.observe(loadMoreEncontradosRef.current);
    }

    // Limpiar observadores al desmontar
    return () => {
      if (observerTodos.current) {
        observerTodos.current.disconnect();
      }
      if (observerPerdidos.current) {
        observerPerdidos.current.disconnect();
      }
      if (observerEncontrados.current) {
        observerEncontrados.current.disconnect();
      }
    };
  }, [handleLoadMore, activeTab]);

  // Efecto para cargar elementos iniciales
  useEffect(() => {
    if (authInitialized) {
      fetchItems();
    }
  }, [fetchItems, authInitialized]);

  // Efecto para resetear la carga cuando cambian los filtros
  useEffect(() => {
    if (authInitialized) {
      fetchItems();
    }
  }, [
    dateFilter,
    locationFilter,
    showMyItemsOnly,
    fetchItems,
    authInitialized,
  ]);

  const handleAddItem = async (newItem: Partial<Item>, imageFile?: File) => {
    try {
      const savedItem = await addOrUpdateItem(newItem, imageFile);
      if (savedItem) {
        Swal.fire({
          title: "¡Publicado!",
          text: "Objeto publicado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchItems();
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo guardar el objeto",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error("Error al agregar el objeto:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al publicar el objeto",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleAddComment = async (itemId: string, comment: Comment) => {
    try {
      // Actualización optimista - añadir el comentario localmente primero
      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id === itemId) {
            // Clonar el item y añadir el nuevo comentario
            return {
              ...item,
              comments: [...(item.comments || []), comment],
            };
          }
          return item;
        });
      });

      // Luego enviar al servidor
      await addComment(itemId, comment);

      // No necesitamos recargar todos los items porque ya actualizamos el estado
      Swal.fire({
        title: "¡Éxito!",
        text: "Comentario agregado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el comentario",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });

      // Si hay un error, recargar para asegurarnos de que la UI esté sincronizada
      fetchItems();
    }
  };

  const handleLike = async (itemId: string) => {
    try {
      if (!currentUser) {
        Swal.fire({
          title: "Inicio de sesión requerido",
          text: "Por favor inicia sesión para dar like",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      await toggleLike(itemId, currentUser.uid);
      // No need to fetch items again since we're using optimistic UI updates
    } catch (error) {
      console.error("Error al dar like:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo dar like al objeto",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      // Refresh items to make sure UI is in sync with backend
      fetchItems();
    }
  };

  const handleShare = (item: Item) => {
    console.log(`Compartiendo item: ${item.id} - ${item.name}`);
    // Analytics or additional logic can be added here
  };

  const handleDeleteComment = async (itemId: string, commentId: string) => {
    try {
      if (!currentUser) {
        Swal.fire({
          title: "Inicio de sesión requerido",
          text: "Por favor inicia sesión para eliminar comentarios",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Actualización optimista - eliminar el comentario localmente primero
      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id === itemId) {
            // Clonar el item y filtrar el comentario a eliminar
            return {
              ...item,
              comments:
                item.comments?.filter((comment) => comment.id !== commentId) ||
                [],
            };
          }
          return item;
        });
      });

      // Luego eliminar en el servidor
      await deleteComment(itemId, commentId);

      Swal.fire({
        title: "¡Eliminado!",
        text: "Comentario eliminado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al eliminar el comentario",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });

      // Si hay un error, recargar para asegurarnos de que la UI esté sincronizada
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (!currentUser) {
        Swal.fire({
          title: "Inicio de sesión requerido",
          text: "Por favor inicia sesión para eliminar publicaciones",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Confirmación antes de eliminar
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Actualización optimista - eliminar el item localmente primero
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      // Luego eliminar en el servidor
      const success = await deleteItemById(itemId);

      if (success) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Publicación eliminada correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Si hay un error, recargar para asegurarnos de que la UI esté sincronizada
        fetchItems();
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la publicación",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al eliminar la publicación",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      // Si hay un error, recargar para asegurarnos de que la UI esté sincronizada
      fetchItems();
    }
  };

  // Verificar si el usuario puede eliminar una publicación
  const canDeleteItem = (item: Item) => {
    if (!currentUser) return false;
    return item.authorId === currentUser.uid;
  };

  // Verificar si el objeto tiene menos de 3 meses de antigüedad
  const isLessThanThreeMonthsOld = (item: Item) => {
    if (!item.createdAt) return false;

    const itemDate = item.createdAt.toDate();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return itemDate >= threeMonthsAgo;
  };

  // Usar el tipo directamente del objeto en lugar de inferirlo del texto
  const isPerdido = (item: Item) =>
    item.type === "perdido" && isLessThanThreeMonthsOld(item);

  // Usar el tipo directamente del objeto en lugar de inferirlo del texto
  const isEncontrado = (item: Item) =>
    item.type === "encontrado" && isLessThanThreeMonthsOld(item);

  // Función para filtrar items
  const filterItems = useCallback(
    (item: Item) => {
      // Filtro por búsqueda
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por ubicación
      const matchesLocation =
        locationFilter === "all" || item.location === locationFilter;

      // Filtro por fecha
      const itemDate = item.createdAt.toDate();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      let matchesDate = true;
      switch (dateFilter) {
        case "today":
          matchesDate = itemDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          matchesDate = itemDate.toDateString() === yesterday.toDateString();
          break;
        case "lastWeek":
          matchesDate = itemDate >= lastWeek;
          break;
        case "all":
        default:
          matchesDate = true;
      }

      // Filtro por usuario
      const matchesUser =
        !showMyItemsOnly || item.authorId === currentUser?.uid;

      return matchesSearch && matchesLocation && matchesDate && matchesUser;
    },
    [searchTerm, locationFilter, dateFilter, showMyItemsOnly, currentUser]
  );

  const filteredItems = items.filter(filterItems);

  const isActive = (tab: string) => activeTab === tab;

  // Componente de carga
  const LoadingMoreIndicator = () => (
    <div className="flex justify-center items-center py-8 w-full">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="ml-2 text-sm text-muted-foreground">
        Cargando más objetos...
      </span>
    </div>
  );

  // Componente "Cargar más" o "No hay más resultados"
  const LoadMoreOrEnd = ({
    filtered,
    type,
  }: {
    filtered: boolean;
    type: string;
  }) => {
    const hasFilteredItems = filtered
      ? type === "todos"
        ? filteredItems.length > 0
        : type === "perdidos"
        ? filteredItems.filter(isPerdido).length > 0
        : filteredItems.filter(isEncontrado).length > 0
      : true;

    // Asignar el ref correcto según el tipo
    const getRef = () => {
      if (type === "todos") return loadMoreTodosRef;
      if (type === "perdidos") return loadMorePerdidosRef;
      return loadMoreEncontradosRef;
    };

    if (!hasFilteredItems) return null;

    return (
      <div ref={getRef()} className="col-span-full flex justify-center py-8">
        {loadingMore ? (
          <LoadingMoreIndicator />
        ) : hasMoreItems ? (
          <span className="text-sm text-muted-foreground">
            Scroll para cargar más objetos
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            ¡Eso es todo por ahora! Pero no pierdas la esperanza, sigue buscando
            o reporta tu objeto perdido.
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <UserNameModal onComplete={() => {}} />

      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <h1 className="text-2xl font-bold">Catálogo de Objetos</h1>
            <p className="text-muted-foreground">
              Encuentra objetos perdidos o reporta uno que hayas encontrado
            </p>
          </div>
          <div className="flex items-center w-full md:w-auto gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Reportar Objeto
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar objetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select
              value={locationFilter}
              onValueChange={(value) =>
                setLocationFilter(value as Location | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {Object.values(Location).map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="yesterday">Ayer</SelectItem>
                <SelectItem value="lastWeek">Última semana</SelectItem>
              </SelectContent>
            </Select>

            {currentUser && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="myItems"
                  checked={showMyItemsOnly}
                  onCheckedChange={(checked) =>
                    setShowMyItemsOnly(checked === true)
                  }
                />
                <Label htmlFor="myItems">Mis publicaciones</Label>
              </div>
            )}
          </div>
        </div>

        <Tabs
          defaultValue="todos"
          className="w-full"
          onValueChange={(value) => {
            setActiveTab(value);
            // Ya no necesitamos cambiar el showMyItemsOnly según la tab
            setShowMyItemsOnly(false);
          }}
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="perdidos">Perdidos</TabsTrigger>
            <TabsTrigger value="encontrados">Encontrados</TabsTrigger>
          </TabsList>

          {loading && !loadingMore ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-muted-foreground">Cargando objetos...</p>
            </div>
          ) : (
            <>
              <TabsContent value="todos" className="mt-0">
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item as any}
                        onAddComment={(itemId: string, comment: any) =>
                          handleAddComment(itemId, comment)
                        }
                        onLike={handleLike}
                        onShare={handleShare}
                        onDeleteComment={handleDeleteComment}
                        onDeleteItem={
                          canDeleteItem(item) ? handleDeleteItem : undefined
                        }
                        currentUser={currentUser}
                      />
                    ))}
                    <LoadMoreOrEnd filtered={true} type="todos" />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No se encontraron objetos
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="perdidos" className="mt-0">
                {filteredItems.filter(isPerdido).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.filter(isPerdido).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item as any}
                        onAddComment={(itemId: string, comment: any) =>
                          handleAddComment(itemId, comment)
                        }
                        onLike={handleLike}
                        onShare={handleShare}
                        onDeleteComment={handleDeleteComment}
                        onDeleteItem={
                          canDeleteItem(item) ? handleDeleteItem : undefined
                        }
                        currentUser={currentUser}
                      />
                    ))}
                    <LoadMoreOrEnd filtered={true} type="perdidos" />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No se encontraron objetos perdidos
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="encontrados" className="mt-0">
                {filteredItems.filter(isEncontrado).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.filter(isEncontrado).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item as any}
                        onAddComment={(itemId: string, comment: any) =>
                          handleAddComment(itemId, comment)
                        }
                        onLike={handleLike}
                        onShare={handleShare}
                        onDeleteComment={handleDeleteComment}
                        onDeleteItem={
                          canDeleteItem(item) ? handleDeleteItem : undefined
                        }
                        currentUser={currentUser}
                      />
                    ))}
                    <LoadMoreOrEnd filtered={true} type="encontrados" />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No se encontraron objetos encontrados
                    </p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        <ReportarObjetoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddItem}
        />
      </div>
    </>
  );
}
