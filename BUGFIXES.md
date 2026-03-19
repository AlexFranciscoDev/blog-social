# Blog Social — Registro de Bugs y Soluciones

> Sesión de debugging: 20 marzo 2026
> Repos: `blog-social` (backend) · `blog-social-frontend` (frontend)

---

## Bug #1 — Las imágenes de posts no se mostraban

### ¿Qué pasaba?

En los componentes `Discover`, `My Posts` y `Profile`, las imágenes de los posts aparecían rotas (el icono típico de imagen rota del navegador). Los avatares de usuario sí funcionaban.

### Causa 1: Bug en la función que sirve imágenes del backend

**Archivo:** `controllers/post.js` — función `getImage`

Esta función tenía un error clásico de programación asíncrona. En JavaScript, cuando usas un **callback** (una función que se ejecuta "después"), el código que está fuera de ese callback **no espera** — se ejecuta inmediatamente.

```js
// ❌ ANTES — así estaba el código (MAL)
const getImage = (req, res) => {
    const filePath = './uploads/posts/' + file;

    fs.stat(filePath, (error, exists) => {
        // Este bloque se ejecuta DESPUÉS (es asíncrono)
        if (!exists) {
            return res.status(404).send({ message: 'Image not found' })
        }
    })

    // ⚠️ Esto se ejecuta ANTES que el callback de arriba
    // No sabe si el archivo existe o no, pero lo intenta enviar igualmente
    return res.sendFile(path.resolve(filePath));
}
```

**¿Qué pasaba en la práctica?**
- Si el archivo **existía**: `res.sendFile` lo enviaba y todo iba bien ✅
- Si el archivo **no existía**: `res.sendFile` intentaba enviarlo, fallaba con un error interno, y el navegador recibía una respuesta rota → imagen rota ❌

```js
// ✅ DESPUÉS — así se arregló (BIEN)
const getImage = (req, res) => {
    const filePath = './uploads/posts/' + file;

    fs.stat(filePath, (error, stats) => {
        // Todo el código está dentro del callback
        // Ahora SÍ sabemos si el archivo existe antes de actuar
        if (error || !stats) {
            return res.status(404).send({ message: 'Image not found' })
        }
        return res.sendFile(path.resolve(filePath)); // Solo se ejecuta si el archivo existe
    })
}
```

> 💡 **Para un junior:** Piensa en `fs.stat` como preguntar "¿existe este archivo?". La respuesta llega un momento después (asíncrono). Si pones código fuera del callback, ese código se ejecuta antes de recibir la respuesta — como si no hubieras esperado la contestación.

---

### Causa 2: Los archivos de imagen simplemente no existían en disco

Confirmado con el Network tab del navegador:
- URL intentada: `localhost:3800/api/post/postImage/1773785937105-Imagen Corporativa.jpg`
- Respuesta: `{"status":"Error","message":"Image not found"}`

Los posts en MongoDB tenían guardados los nombres de archivo correctamente, pero esos archivos físicamente **no estaban** en la carpeta `./uploads/posts/` del servidor. Esto nos lleva al Bug #2.

---

### Solución adicional: Imagen de reemplazo cuando falla la carga

Aunque el bug principal era del backend, también añadimos una protección en el frontend para que cuando una imagen falle por cualquier razón, se muestre una imagen placeholder en lugar del icono roto. Se usó el atributo `onError` de HTML:

```jsx
// ✅ Añadido en todos los componentes que muestran imágenes de posts
<img
  src={getPostImageUrl(post.image)}
  alt="post-img"
  onError={(e) => { e.target.src = '/img/blog-post.svg' }}
  // ^ Si la imagen falla, cambia el src automáticamente al placeholder
/>
```

---

## Bug #2 — Las imágenes desaparecían al cambiar de entorno

### ¿Qué pasaba?

Las imágenes funcionaban perfectamente justo después de crear un post, pero al día siguiente o al cambiar entre desarrollo y producción, dejaban de verse.

### Causa: Las imágenes se guardaban solo en el disco local

Cuando un usuario subía una imagen, el backend la guardaba en una carpeta local llamada `./uploads/posts/`. El problema es que esta carpeta estaba en el `.gitignore`:

```
# .gitignore del backend
uploads/   ← git ignora esta carpeta completamente
```

**¿Por qué está en el .gitignore?** Porque los archivos binarios (imágenes, vídeos...) no deberían subirse a git — hacen los repositorios enormes y lentos.

**¿Cuál es el problema entonces?** Que git es el puente entre entornos. Si las imágenes no van a git, no llegan al servidor de producción ni a otro ordenador.

```
Lo que pasaba:

💻 Tu ordenador (desarrollo)
   └── Creas post con imagen → se guarda en ./uploads/posts/imagen.jpg
   └── MongoDB guarda el nombre: "1773785937105-imagen.jpg"
   └── git push → ⚠️ uploads/ ignorado → la imagen NO se sube

🖥️ Servidor de producción (o nuevo día, nueva sesión)
   └── git pull → uploads/posts/ está VACÍO
   └── MongoDB dice "busca 1773785937105-imagen.jpg"
   └── El archivo no existe → imagen rota ❌
```

### Solución: Cloudinary — almacenamiento de imágenes en la nube

En lugar de guardar las imágenes en el disco local, las subimos directamente a **Cloudinary** (un servicio cloud para gestión de imágenes). Cloudinary devuelve una URL pública que funciona desde cualquier lugar.

```
✅ Flujo nuevo con Cloudinary:

💻 Tu ordenador (desarrollo)
   └── Creas post con imagen
   └── La imagen va a Cloudinary → Cloudinary devuelve una URL pública
   └── MongoDB guarda la URL: "https://res.cloudinary.com/blog-social/posts/imagen.jpg"

🖥️ Servidor de producción
   └── MongoDB tiene la URL de Cloudinary
   └── El frontend carga la imagen desde Cloudinary ✅ (siempre disponible)
```

**Cambios en el backend:**

```bash
# 1. Instalamos los paquetes necesarios
npm install cloudinary multer-storage-cloudinary
```

```js
// 2. Nuevo archivo: config/cloudinary.js
// Antes: multer guardaba en disco local
// Ahora: multer sube a Cloudinary

const postStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'blog-social/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    }
});
```

```js
// 3. En los controllers, antes se guardaba el nombre del archivo:
image: req.file.filename   // ❌ "1773785937105-imagen.jpg" (solo existe localmente)

// Ahora se guarda la URL completa de Cloudinary:
image: req.file.path       // ✅ "https://res.cloudinary.com/..." (accesible desde cualquier sitio)
```

**Cambios en el frontend — Helper de URLs retrocompatible:**

Creamos `src/helpers/imageHelpers.js`. El problema era que los posts **antiguos** tenían guardado solo el nombre de archivo, y los **nuevos** tendrían la URL completa de Cloudinary. El helper gestiona ambos casos:

```js
export const getPostImageUrl = (image) => {
    if (!image) return '/img/blog-post.svg';        // Sin imagen → placeholder

    if (image.startsWith('http')) return image;     // URL de Cloudinary (nuevo) ✅

    return Global.url + 'post/postImage/' + image;  // Filename local (posts antiguos) ✅
};
```

> 💡 **Para un junior:** `req.file.path` con Cloudinary no es una ruta de disco como `C:/uploads/imagen.jpg`, sino la URL pública que Cloudinary genera: `https://res.cloudinary.com/tu-cloud/blog-social/posts/imagen.jpg`. Esto es lo que guardamos en MongoDB.

---

## Bug #3 — Error 500 con respuesta HTML al crear un post

### ¿Qué pasaba?

Al intentar crear un post, el frontend recibía un error 500 y en la consola aparecía:

```
SyntaxError: Unexpected token '<', "<!DOCTYPE ... is not valid JSON
```

El frontend esperaba JSON del backend, pero recibía HTML — la página de error por defecto de Express.

### Causa 1: Express devuelve HTML cuando no hay error handler global

Express tiene un comportamiento por defecto: cuando ocurre un error no manejado, devuelve una página HTML de error. El proyecto no tenía ningún middleware que capturara esos errores y los devolviera en formato JSON.

Cuando Cloudinary fallaba (credenciales, red, etc.), el error llegaba a Express y este respondía con HTML. El frontend intentaba hacer `response.json()` sobre ese HTML → crash.

```js
// ✅ Solución: añadir error handler global en index.js
// IMPORTANTE: debe ir DESPUÉS de los routes
// IMPORTANTE: debe tener exactamente 4 parámetros (err, req, res, next)

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    return res.status(err.status || 500).send({
        status: 'Error',
        message: err.message || 'Internal Server Error'
        // ✅ Ahora siempre devuelve JSON, nunca HTML
    });
});
```

> 💡 **Para un junior:** Express identifica un error handler porque tiene **4 parámetros** en lugar de 3. Los middlewares normales son `(req, res, next)`. El error handler es `(err, req, res, next)`. Ese primer parámetro `err` es la clave para que Express lo reconozca como manejador de errores.

### Causa 2: `req.file` podía ser `undefined`

Si la subida a Cloudinary fallaba por cualquier razón, multer no asignaba `req.file`. El controller intentaba acceder a `req.file.path` sin comprobar antes si `req.file` existía → `TypeError: Cannot read properties of undefined`.

```js
// ❌ ANTES — crash si req.file es undefined
const newPost = new Post({
    image: req.file.path,  // TypeError si req.file no existe
    ...
});

// ✅ DESPUÉS — validación primero
if (!req.file) {
    return res.status(400).send({
        status: 'Error',
        message: 'Image is required'
    })
}
const newPost = new Post({
    image: req.file.path,  // Seguro, ya sabemos que existe
    ...
});
```

---

## Bug #4 — Imagen demasiado grande

### ¿Qué pasaba?

Al subir una imagen de ~22 MB, el backend devolvía:

```
"File size too large. Got 22233197. Maximum is 10485760"
```

**Traducido:** la imagen pesaba 22 MB pero Cloudinary en plan gratuito acepta máximo 10 MB.

El problema adicional era que **el error de Cloudinary llegaba sin ser manejado**, lo que provocaba de nuevo la respuesta HTML del Bug #3 (antes de arreglarlo).

### Solución: Límite de 5 MB en multer + validación en el cliente

**¿Por qué 5 MB si Cloudinary permite 10 MB?** Porque para imágenes de una web, 5 MB ya es mucho. Las imágenes web optimizadas deberían pesar entre 100 KB y 2 MB. Ponemos 5 MB como límite generoso pero razonable.

**Backend — limitación en multer + error manejado:**

```js
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB en bytes

// ✅ Wrapper personalizado para manejar el error con JSON
const handleUpload = (req, res, next) => {
    uploads.single('featuredImage')(req, res, (err) => {
        if (err && err.code === 'LIMIT_FILE_SIZE') {
            // Error específico de tamaño → mensaje claro
            return res.status(400).send({
                status: 'Error',
                message: 'Image too large. Maximum size is 5 MB.'
            });
        }
        if (err) {
            // Cualquier otro error de multer
            return res.status(500).send({ status: 'Error', message: err.message });
        }
        next(); // Todo OK, continúa al controller
    });
};
```

**Frontend — validación antes de enviar:**

```js
// ✅ Validamos en el cliente ANTES de hacer la petición
// Así el usuario ve el error inmediatamente, sin esperar respuesta del servidor

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

if (imageFile && imageFile.size > MAX_SIZE) {
    setPostSaved('SizeError');
    return; // Cortamos aquí, no enviamos nada al servidor
}
```

```jsx
{postSaved == 'SizeError' && (
    <span className='alert alert-danger'>
        Image too large. Maximum size is 5 MB.
    </span>
)}
```

> 💡 **Para un junior:** Siempre valida en **dos sitios**: en el cliente (para UX rápida) y en el servidor (para seguridad real). Un usuario malintencionado puede saltarse la validación del cliente manipulando el código del navegador. La del servidor es la que realmente protege.

---

## Resumen visual de todos los cambios

### Backend (`blog-social`)

| Archivo | Qué se cambió |
|---|---|
| `config/cloudinary.js` | **Nuevo** — configuración de Cloudinary |
| `index.js` | Error handler global JSON |
| `routes/post.js` | Cloudinary storage + límite 5 MB + `handleUpload` |
| `routes/user.js` | Cloudinary storage + límite 5 MB + `handleUpload` |
| `controllers/post.js` | Fix async `getImage` · `req.file.path` · check `req.file` |
| `controllers/user.js` | `req.file.path` en lugar de `req.file.filename` |
| `.env` | Variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

### Frontend (`blog-social-frontend`)

| Archivo | Qué se cambió |
|---|---|
| `helpers/imageHelpers.js` | **Nuevo** — `getPostImageUrl()` y `getProfileImageUrl()` |
| `Discover.jsx` | Usa helpers + `onError` placeholder |
| `Posts.jsx` | Usa helpers + `onError` placeholder |
| `Post.jsx` | Usa helpers + `onError` placeholder |
| `Edit.jsx` | Usa helpers + `onError` placeholder |
| `Profile.jsx` | Usa helpers + `onError` placeholder |
| `EditProfile.jsx` | Usa helper de perfil |
| `Nav.jsx` | Usa helper de perfil |
| `New.jsx` | Validación de tamaño en cliente |

---

## Lecciones clave

| Problema | Lección |
|---|---|
| Imágenes perdidas entre entornos | Nunca almacenes archivos en disco local en producción. Usa cloud storage |
| `uploads/` en `.gitignore` | Es correcto no subir binarios a git, pero implica necesitar storage externo |
| Express devuelve HTML en errores | Siempre añade un error handler global `(err, req, res, next)` que devuelva JSON |
| `res.sendFile` fuera de callback | El código fuera de callbacks se ejecuta sin esperar — entiende bien el flujo async |
| Sin validación de tamaño | Valida en cliente (UX) Y en servidor (seguridad) |
