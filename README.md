# PGP-IA-TP2

Taller de Proyectos 2 - Plataforma de Gestión de Proyectos con Inteligencia Artificial - MERN

## Gestión APP – Entorno de Desarrollo con Docker 🐳

Este proyecto usa **React + Vite + Tailwind CSS** con un entorno de desarrollo totalmente aislado en Docker para facilitar la colaboración entre desarrolladores sin conflictos de versiones ni configuraciones locales.

---

### 🧱 Requisitos

- Tener instalado [Docker](https://www.docker.com/) y Docker Compose

---

### 🚀 Iniciar el entorno de desarrollo front

```bash
# Clona el proyecto
git clone https://github.com/usuario/gestion-APP.git
cd gestion-APP

# Construye e inicia el contenedor
docker-compose up --build
```

### 🚀 Iniciar el entorno de desarrollo back

```bash
# Clona el proyecto
git clone https://github.com/usuario/gestion-APP.git
cd backend

# Construye e inicia el contenedor
docker-compose up --build
```

Luego abre tu navegador en:
📍 http://localhost:5173

🛠️ Este comando compila la imagen, instala dependencias y ejecuta npm run dev dentro del contenedor.

♻️ Reiniciar sin volver a construir
Una vez construido, puedes simplemente iniciar con:

```bash
docker-compose up
```

Solo usa --build si cambiaste package.json, Dockerfile, o agregaste nuevas dependencias.

🔻 Detener el contenedor
Para detener el entorno de desarrollo:

```bash
docker-compose down
```
