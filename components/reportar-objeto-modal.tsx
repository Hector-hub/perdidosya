"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Upload, InfoIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Item } from "@/types";
import { Location, getLocationDescription } from "@/types/locations";
import { Checkbox } from "@/components/ui/checkbox";
import { Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserNameModal } from "@/components/user-name-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentModerationService } from "@/services/moderation";
import { ImageModerationService } from "@/services/image-moderation";
import Swal from "sweetalert2";

interface ReportarObjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newItem: Partial<Item>, imageFile?: File) => void;
}

export function ReportarObjetoModal({
  isOpen,
  onClose,
  onSubmit,
}: ReportarObjetoModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [itemType, setItemType] = useState<string>("encontrado");
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyPostCount, setDailyPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  useEffect(() => {
    // Get current user
    const unsubscribe = getAuth(firebase_app).onAuthStateChanged((user) => {
      // No need to set current user, we're using useAuth
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserDailyPosts = async () => {
      if (!currentUser) {
        setDailyPostCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Calcular inicio y fin del día actual
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startTimestamp = Timestamp.fromDate(startOfDay);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const endTimestamp = Timestamp.fromDate(endOfDay);

        // Consulta para contar publicaciones del usuario hoy
        const itemsRef = collection(db, "items");
        const q = query(
          itemsRef,
          where("authorId", "==", currentUser.uid),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp)
        );

        const querySnapshot = await getDocs(q);
        setDailyPostCount(querySnapshot.size);
      } catch (error) {
        console.error("Error al verificar publicaciones diarias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkUserDailyPosts();
    }
  }, [currentUser, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(null);
      if (file.size > 5 * 1024 * 1024) {
        setImageError(
          "El tamaño máximo permitido es 5MB. Por favor, selecciona una imagen más pequeña."
        );
        return;
      }

      try {
        setIsValidatingImage(true);
        // Validar contenido de la imagen
        const imageModerationService = ImageModerationService.getInstance();
        const validation = await imageModerationService.validateImage(file);

        if (!validation.isValid) {
          const fileInput = document.getElementById(
            "image"
          ) as HTMLInputElement;
          setImageError(
            "La imagen contiene contenido que no cumple con nuestras políticas. Por favor, selecciona otra imagen."
          );

          // Limpiar la selección de imagen
          setSelectedImagePreview(null);
          setSelectedImageFile(null);
          // Limpiar el input file
          if (fileInput) {
            fileInput.value = "";
          }
          return;
        }

        // Guardar el archivo original para subir a Storage
        setSelectedImageFile(file);

        // Crear una vista previa para mostrar en la UI
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error al validar la imagen:", error);
        setImageError(
          "Ocurrió un error al validar la imagen. Por favor, intente nuevamente."
        );
      } finally {
        setIsValidatingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Por favor inicia sesión para publicar");
      return;
    }

    if (!location) {
      toast.error("Por favor selecciona una ubicación");
      return;
    }

    // Verificar si se necesita especificar la ubicación en la descripción
    if (
      (location === Location.EDIFICIO_AULA || location === Location.OTROS) &&
      !description
    ) {
      toast.error(getLocationDescription(location));
      return;
    }

    try {
      setIsSubmitting(true);

      // Validar contenido con el servicio de moderación
      const moderationService = ContentModerationService.getInstance();

      // Validar título
      const titleValidation = await moderationService.validateContent(
        name || ""
      );
      if (!titleValidation.isValid) {
        toast.error(
          titleValidation.message || "El título contiene contenido inapropiado"
        );
        return;
      }

      // Validar descripción
      const descriptionValidation = await moderationService.validateContent(
        description || ""
      );
      if (!descriptionValidation.isValid) {
        toast.error(
          descriptionValidation.message ||
            "La descripción contiene contenido inapropiado"
        );
        return;
      }

      // Create a new object with form data
      const newItem: Partial<Item> = {
        name,
        description,
        location,
        type: itemType as "perdido" | "encontrado",
        authorId: currentUser.uid,
        authorName: isAnonymous
          ? "Anónimo"
          : currentUser.displayName || "Usuario",
        authorEmail: currentUser.email || null,
        authorPhotoURL: isAnonymous ? null : currentUser.photoURL || null,
        isAnonymous,
        createdAt: Timestamp.fromDate(date),
        updatedAt: Timestamp.fromDate(new Date()),
        likes: [],
        comments: [],
      };

      // Pasar el archivo para que se suba a Storage en lugar de guardar el base64
      const fileToUpload =
        selectedImageFile === null ? undefined : selectedImageFile;
      onSubmit(newItem, fileToUpload);

      // Reset the form
      setName("");
      setDescription("");
      setSelectedImagePreview(null);
      setSelectedImageFile(null);
      setDate(new Date());
      setItemType("encontrado");
      setLocation(null);
      setIsAnonymous(false);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error(
        "Ocurrió un error al publicar el objeto. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearImage = () => {
    setSelectedImagePreview(null);
    setSelectedImageFile(null);
  };

  // Estilos CSS para ocultar scrollbar
  const hideScrollbarStyle = {
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-hidden flex flex-col">
        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <DialogHeader>
          <DialogTitle>Publicar objeto</DialogTitle>
          <DialogDescription>
            Completa la información sobre el objeto que quieres reportar.
          </DialogDescription>
        </DialogHeader>

        {!currentUser ? (
          <div className="text-center p-4">
            <p className="mb-4">Debes iniciar sesión para publicar un objeto</p>
            <UserNameModal
              onComplete={() => {}}
              isOpen={true}
              onClose={onClose}
              isFromLogin={true}
            />
          </div>
        ) : isLoading ? (
          <div className="text-center p-4">
            <p>Cargando información...</p>
          </div>
        ) : !currentUser.emailVerified ? (
          <div className="p-4 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
                Verificación de correo pendiente
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                Para publicar objetos, debes verificar tu correo electrónico.
                Hemos enviado un enlace de verificación a tu dirección de
                correo: <strong>{currentUser.email}</strong>
              </p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    window.location.href = "/perfil";
                  }}
                >
                  Ir a mi perfil
                </Button>
              </div>
            </div>
          </div>
        ) : dailyPostCount >= 3 ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <h3 className="text-amber-800 dark:text-amber-200 font-semibold mb-2">
              Límite de publicaciones alcanzado
            </h3>
            <p className="text-amber-700 dark:text-amber-300">
              Has alcanzado el límite de 3 publicaciones por día. Vuelve mañana
              para publicar más objetos.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-grow overflow-hidden"
          >
            <div
              className="overflow-y-auto pr-2 space-y-4 hide-scrollbar"
              style={hideScrollbarStyle}
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Has publicado {dailyPostCount} de 3 objetos permitidos hoy.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="itemType">Tipo</Label>
                  <Tabs
                    value={itemType}
                    onValueChange={setItemType}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="encontrado">Encontrado</TabsTrigger>
                      <TabsTrigger value="perdido">Perdido</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del Objeto</Label>
                  <Input
                    id="title"
                    placeholder="ej., Mochila Azul, Carnet de Estudiante"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder={
                      itemType === "perdido"
                        ? "Perdí mi... Describe el objeto, características, cuándo y dónde lo viste por última vez"
                        : "Encontré un... Describe el objeto, características, cuándo y dónde lo encontraste"
                    }
                    className="min-h-[100px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Fecha{" "}
                      {itemType === "perdido" ? "de Pérdida" : "de Hallazgo"}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date
                            ? format(date, "PPP", { locale: es })
                            : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Select
                      value={location || ""}
                      onValueChange={(value) => setLocation(value as Location)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Location).map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {location &&
                      (location === Location.EDIFICIO_AULA ||
                        location === Location.OTROS) && (
                        <p className="text-sm text-muted-foreground">
                          {getLocationDescription(location)}
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Subir Imagen</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isValidatingImage}
                    />
                    {isValidatingImage ? (
                      <div className="py-8 space-y-2">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Evaluando imagen...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Por favor, espera mientras verificamos el contenido
                        </p>
                      </div>
                    ) : selectedImagePreview ? (
                      <div className="mt-2">
                        <img
                          src={selectedImagePreview}
                          alt="Objeto seleccionado"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={clearImage}
                          type="button"
                        >
                          Eliminar Imagen
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer py-8"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                      >
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Haz clic para subir o arrastra y suelta
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG o JPEG (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {imageError && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      {imageError}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) =>
                      setIsAnonymous(checked === true)
                    }
                  />
                  <Label htmlFor="anonymous">Publicar anónimamente</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Al publicar de forma anónima, no recibirás
                          notificaciones por correo electrónico sobre los
                          comentarios en tu publicación para proteger tu
                          privacidad.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 mt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isValidatingImage}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || isValidatingImage || dailyPostCount >= 3
                }
              >
                {isSubmitting || isValidatingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isValidatingImage
                      ? "Evaluando imagen..."
                      : "Publicando..."}
                  </>
                ) : (
                  "Publicar"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
