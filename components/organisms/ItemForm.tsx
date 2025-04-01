"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Item } from "../../types";

interface FormErrors {
  name?: string;
  description?: string;
  image?: string;
}

interface FormData {
  name: string;
  description: string;
  location: string;
  isAnonymous: boolean;
}

interface ItemFormProps {
  item?: Item | null;
}

const ItemForm = ({ item = null }: ItemFormProps) => {
  const isEditing = !!item;
  const router = useRouter();
  const { user } = useAuth();
  const { addOrUpdateItem, loading } = useFirebase();

  const [formData, setFormData] = useState<FormData>({
    name: item?.name || "",
    description: item?.description || "",
    location: item?.location || "",
    isAnonymous: item?.isAnonymous || false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageUrl || null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!imageFile && !item?.imageUrl) {
      newErrors.image = "La imagen es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para publicar");
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const itemData: Partial<Item> = {
        ...formData,
        authorId: user.uid,
        authorName: user.displayName || "Usuario",
      };

      if (isEditing && item) {
        itemData.id = item.id;
      }

      const result = await addOrUpdateItem(itemData, imageFile);

      if (result) {
        toast.success(
          isEditing
            ? "Objeto actualizado con éxito"
            : "Objeto publicado con éxito"
        );
        router.push(isEditing && item ? `/items?id=${item.id}` : "/");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Ocurrió un error al guardar");
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Debes iniciar sesión para publicar un objeto perdido
        </p>
        <Button onClick={() => router.push("/login")}>Iniciar sesión</Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? "Editar objeto perdido" : "Publicar objeto perdido"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del objeto*
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Mochila azul, Botella de agua, etc."
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción*
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe el objeto y dónde lo encontraste"
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-700"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ubicación donde se encontró
          </label>
          <Input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Ej: Biblioteca, Cafetería, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Foto del objeto*
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 transition-colors">
              <span>Seleccionar imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="relative w-24 h-24">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-500">{errors.image}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAnonymous"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label
            htmlFor="isAnonymous"
            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Publicar de forma anónima
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            className="mr-2"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Publicar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
