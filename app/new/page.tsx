"use client";

import ItemForm from "../../components/organisms/ItemForm";

export default function NewItem() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Publicar objeto perdido
      </h1>
      <ItemForm />
    </div>
  );
}
