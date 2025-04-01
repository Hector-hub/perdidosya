"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Mail, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { updateProfile, getAuth } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";
import Image from "next/image";
import { ImageModerationService } from "@/services/image-moderation";

function ProfilePage() {
  const {
    user,
    isEmailVerified,
    sendVerificationEmail,
    checkEmailVerification,
  } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const auth = getAuth(firebase_app);
  const storage = getStorage(firebase_app);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!user && !isLoading) {
        router.push("/");
        Swal.fire({
          title: "Acceso denegado",
          text: "Debes iniciar sesión para acceder a esta página",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }, 1000);

    return () => clearTimeout(checkAuth);
  }, [user, router, isLoading]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });

      setIsEditing(false);
      Swal.fire({
        title: "Perfil actualizado",
        text: "Tu perfil ha sido actualizado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el perfil",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setSendingVerification(true);
    await sendVerificationEmail();
    setSendingVerification(false);
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    const verified = await checkEmailVerification();
    setCheckingVerification(false);

    if (verified) {
      Swal.fire({
        title: "¡Correo verificado!",
        text: "Tu correo electrónico ha sido verificado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Correo no verificado",
        text: "Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación",
        icon: "warning",
      });
    }
  };

  const handleProfilePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      // Validar tamaño del archivo
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError(
          "El tamaño máximo permitido es 5MB. Por favor, selecciona una imagen más pequeña."
        );
        return;
      }

      // Validar contenido de la imagen
      const imageModerationService = ImageModerationService.getInstance();
      const validation = await imageModerationService.validateImage(file);

      if (!validation.isValid) {
        const fileInput = document.getElementById(
          "profilePhoto"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        setPhotoError(
          "La imagen contiene contenido que no cumple con nuestras políticas. Por favor, selecciona otra imagen."
        );
        return;
      }

      // Create a storage reference
      const storageRef = ref(
        storage,
        `profile-photos/${user?.uid}/${file.name}`
      );

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the photoURL state
      setPhotoURL(downloadURL);

      Swal.fire({
        title: "Foto actualizada",
        text: "La foto de perfil se ha actualizado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      setPhotoError(
        "No se pudo subir la foto de perfil. Por favor, intente nuevamente."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Cargando perfil...</CardTitle>
            <CardDescription>Por favor espera</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Usuario y perfil básico */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="mb-4 flex w-full items-center justify-center gap-3">
              <div className="relative h-20 w-20 rounded-full overflow-hidden group">
                <Image
                  src={photoURL || "/placeholder-user.jpg"}
                  width={80}
                  height={80}
                  alt="User"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            <CardTitle>{user.displayName || "Usuario"}</CardTitle>
            <CardDescription className="break-words">
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEmailVerified && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Correo electrónico no verificado
                </AlertDescription>
              </Alert>
            )}
            {isEmailVerified && (
              <Alert variant="default" className="mb-4 border-green-500">
                <Shield className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Correo electrónico verificado
                </AlertDescription>
              </Alert>
            )}
            <div className="text-sm text-muted-foreground">
              <p>
                Cuenta creada:{" "}
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "Desconocido"}
              </p>
              <p>
                Último acceso:{" "}
                {user.metadata.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : "Desconocido"}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" /> Editar perfil
            </Button>
          </CardFooter>
        </Card>

        {/* Configuración y actividad */}
        <div>
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar perfil</CardTitle>
                    <CardDescription>
                      Actualiza tu información personal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nombre</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photoURL">Foto de perfil</Label>
                      <div
                        id="FileUpload"
                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
                      >
                        <input
                          onChange={handleProfilePhotoChange}
                          type="file"
                          name="profilePhoto"
                          id="profilePhoto"
                          accept="image/png, image/jpg, image/jpeg"
                          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                          disabled={uploadingPhoto}
                        />
                        <div className="flex flex-col items-center justify-center">
                          <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                            {uploadingPhoto ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.4613 2.07827C10.3429 1.94876 10.1755 1.875 10 1.875C9.82453 1.875 9.65714 1.94876 9.53873 2.07827L6.2054 5.7241C5.97248 5.97885 5.99019 6.37419 6.24494 6.6071C6.49969 6.84002 6.89502 6.82232 7.12794 6.56756L9.375 4.10984V13.3333C9.375 13.6785 9.65482 13.9583 10 13.9583C10.3452 13.9583 10.625 13.6785 10.625 13.3333V4.10984L12.8721 6.56756C13.105 6.82232 13.5003 6.84002 13.7551 6.6071C14.0098 6.37419 14.0275 5.97885 13.7946 5.7241L10.4613 2.07827Z"
                                  fill="#5750F1"
                                />
                                <path
                                  d="M3.125 12.5C3.125 12.1548 2.84518 11.875 2.5 11.875C2.15482 11.875 1.875 12.1548 1.875 12.5V12.5457C1.87498 13.6854 1.87497 14.604 1.9721 15.3265C2.07295 16.0765 2.2887 16.7081 2.79029 17.2097C3.29189 17.7113 3.92345 17.9271 4.67354 18.0279C5.39602 18.125 6.31462 18.125 7.45428 18.125H12.5457C13.6854 18.125 14.604 18.125 15.3265 18.0279C16.0766 17.9271 16.7081 17.7113 17.2097 17.2097C17.7113 16.7081 17.9271 16.0765 18.0279 15.3265C18.125 14.604 18.125 13.6854 18.125 12.5457V12.5C18.125 12.1548 17.8452 11.875 17.5 11.875C17.1548 11.875 16.875 12.1548 16.875 12.5C16.875 13.6962 16.8737 14.5304 16.789 15.1599C16.7068 15.7714 16.5565 16.0952 16.3258 16.3258C16.0952 16.5565 15.7714 16.7068 15.1599 16.789C14.5304 16.8737 13.6962 16.875 12.5 16.875H7.5C6.30382 16.875 5.46956 16.8737 4.8401 16.789C4.22862 16.7068 3.90481 16.5565 3.67418 16.3258C3.44354 16.0952 3.29317 15.7714 3.21096 15.1599C3.12633 14.5304 3.125 13.6962 3.125 12.5Z"
                                  fill="#5750F1"
                                />
                              </svg>
                            )}
                          </span>
                          <p className="mt-2.5 text-body-sm font-medium">
                            <span className="text-primary">
                              {uploadingPhoto
                                ? "Subiendo..."
                                : "Click para subirla"}
                            </span>
                          </p>
                          <p className="mt-1 text-body-xs">
                            PNG, JPG (max, 800 X 800px)
                          </p>
                        </div>
                      </div>
                      {photoError && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                          {photoError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" value={user.email || ""} disabled />
                      <p className="text-xs text-muted-foreground">
                        El correo electrónico no se puede cambiar
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Información de perfil</CardTitle>
                    <CardDescription>Detalles de tu cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Nombre</Label>
                      <p>{user.displayName || "No establecido"}</p>
                      <Separator className="my-2" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Correo electrónico</Label>
                      <p className="break-words">{user.email}</p>
                      <Separator className="my-2" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Método de inicio de sesión</Label>
                      <p>
                        {user.providerData[0]?.providerId === "password"
                          ? "Correo y contraseña"
                          : user.providerData[0]?.providerId === "google.com"
                          ? "Google"
                          : user.providerData[0]?.providerId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad de la cuenta</CardTitle>
                  <CardDescription>
                    Administra la seguridad de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Verificación de correo electrónico</Label>
                    <div className="flex items-center gap-2">
                      {isEmailVerified ? (
                        <div className="flex items-center text-green-500">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Correo verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-500">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>Correo no verificado</span>
                        </div>
                      )}
                    </div>

                    {!isEmailVerified && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          La verificación de tu correo te permite recuperar tu
                          cuenta y recibir notificaciones importantes.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendVerificationEmail}
                            disabled={sendingVerification}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {sendingVerification
                              ? "Enviando..."
                              : "Reenviar verificación"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCheckVerification}
                            disabled={checkingVerification}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {checkingVerification
                              ? "Verificando..."
                              : "Comprobar estado"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad reciente</CardTitle>
                  <CardDescription>Tus publicaciones recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Aquí se mostrarán tus publicaciones recientes de objetos
                    perdidos o encontrados.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
