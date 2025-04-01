import { Item, Comment } from "@/types";
import emailjs from "@emailjs/browser";

// Reemplaza con tus propias credenciales de EmailJS
const EMAIL_SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "your_service_id";
const EMAIL_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "your_template_id";
const EMAIL_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "your_public_key";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Inicializar EmailJS
emailjs.init(EMAIL_PUBLIC_KEY);

/**
 * Envía un correo electrónico utilizando EmailJS
 */
export const sendEmail = async (
  to: string,
  bcc: string[] = [],
  subject: string,
  templateParams: any
): Promise<boolean> => {
  try {
    const response = await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
      to_email: to,
      bcc: bcc.join(","),
      subject,
      from_name: "PerdidosYa!",
      reply_to: "notificaciones@perdidosya.web.app",
      ...templateParams,
    });

    console.log("Correo enviado con éxito:", response);
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

/**
 * Envía notificaciones a todos los usuarios involucrados en una publicación
 * cuando se agrega un nuevo comentario
 */
export const sendCommentNotifications = async (
  item: Item,
  newComment: Comment,
  excludeUserIds: string[] = []
): Promise<boolean> => {
  try {
    // Extraer emails únicos del autor del ítem y los comentaristas
    let itemAuthor: { email: string; name: string; userId: string } | null =
      null;
    const commenters: { email: string; name: string; userId: string }[] = [];

    // Obtener el autor del ítem si tiene email
    if (item.authorEmail && item.authorId !== newComment.authorId) {
      itemAuthor = {
        email: item.authorEmail,
        name: item.authorName || "Usuario",
        userId: item.authorId,
      };
    }

    // Obtener todos los comentaristas excepto el usuario actual
    if (item.comments && item.comments.length > 0) {
      item.comments.forEach((comment: Comment) => {
        // Saltar usuarios excluidos (como el autor del nuevo comentario)
        if (
          comment.authorId &&
          comment.authorEmail &&
          !excludeUserIds.includes(comment.authorId) &&
          comment.authorId !== item.authorId && // No duplicar al autor del ítem
          comment.authorId !== newComment.authorId // No incluir al autor del nuevo comentario
        ) {
          commenters.push({
            email: comment.authorEmail,
            name: comment.authorName || "Usuario",
            userId: comment.authorId,
          });
        }
      });
    }

    // Si no hay nadie a quien notificar, terminar temprano
    if (!itemAuthor && commenters.length === 0) {
      console.log("No hay usuarios para notificar");
      return false;
    }

    const subject = `Nuevo comentario en "${item.name}" - PerdidosYa!`;
    const templateParams = {
      recipient_name: itemAuthor ? itemAuthor.name : "Usuarios",
      item_name: item.name,
      item_url: `${BASE_URL}/items/${item.id}`,
      comment_author: newComment.authorName || "Usuario",
      comment_text: newComment.text,
    };

    // Si hay autor del ítem, enviar a él como destinatario principal y a los comentaristas en BCC
    if (itemAuthor) {
      const bccEmails = commenters.map((user) => user.email);
      return await sendEmail(
        itemAuthor.email,
        bccEmails,
        subject,
        templateParams
      );
    }
    // Si no hay autor pero hay comentaristas, enviar al primer comentarista y el resto en BCC
    else if (commenters.length > 0) {
      const mainRecipient = commenters[0];
      const bccEmails = commenters.slice(1).map((user) => user.email);

      // Actualizar el nombre del destinatario principal
      templateParams.recipient_name = mainRecipient.name;

      return await sendEmail(
        mainRecipient.email,
        bccEmails,
        subject,
        templateParams
      );
    }

    return false;
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
    return false;
  }
};
