# AutoReport IA

Sistema de generación automática de reportes con Inteligencia Artificial.

---

# Producción

| Recurso | URL |
|---|---|
| API | https://autoreport-ia.onrender.com |
| Documentación | https://autoreport-ia.onrender.com/api/docs |
| Health Check | https://autoreport-ia.onrender.com/api/health |

---

# Requisitos para desarrollo local

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- [Git](https://git-scm.com/)

---

# Instalación local

## 1. Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/autoreport-ia.git

cd autoreport-ia

git checkout develop

cp backend/.env.example backend/.env
```

Editar `backend/.env` y completar los siguientes valores:

```env
JWT_SECRET=string_aleatorio_minimo_32_caracteres
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
SUPABASE_URL=https://tu_proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
```

---

## 2. Levantar el entorno

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 3. Aplicar migraciones

```bash
docker exec -it autoreport_api npx prisma migrate dev --name init
```

---

## 4. Verificar funcionamiento

| Servicio | URL |
|---|---|
| API | http://localhost:3000/api/health |
| Swagger Docs | http://localhost:3000/api/docs |

---

# Comandos útiles

## Ver logs en tiempo real

```bash
docker logs autoreport_api -f
```

## Ejecutar tests

```bash
docker exec autoreport_api npm test
```

## Prisma Studio

```bash
docker exec autoreport_api npx prisma studio --port 5555 --browser none
```

Abrir en el navegador:

```txt
http://localhost:5555
```

## Detener contenedores

```bash
docker compose -f docker-compose.dev.yml down
```

## Crear nueva migración

```bash
docker exec -it autoreport_api npx prisma migrate dev --name nombre_cambio
```

---

# Estructura del proyecto

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── src/
    ├── config/         # BD, Swagger, Storage
    ├── controllers/    # Manejo de requests HTTP
    ├── middleware/     # Auth, validación, rate limiting, errores
    ├── repositories/   # Queries a la BD con Prisma
    ├── routes/         # Definición de endpoints
    ├── services/       # Lógica de negocio e integración con IA
    ├── utils/          # Logger, errores, responses
    └── validators/     # Schemas de validación con Zod
```

---

# Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| IA | Google Gemini 2.0 Flash |
| Almacenamiento | Supabase Storage |
| Despliegue | Render |
| Contenedores | Docker |

---

# Convención de commits

```txt
feat:      nueva funcionalidad
fix:       corrección de bug
chore:     configuración o mantenimiento
test:      agregar o modificar tests
docs:      documentación
refactor:  refactorización
```
