# AutoReport IA — Backend

API REST para generación automática de reportes con IA.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- [Git](https://git-scm.com/)

## Correr en local

**1. Clonar el repositorio y posicionarse en develop**

```bash
git clone https://github.com/TU_USUARIO/autoreport-ia.git
cd autoreport-ia
git checkout develop
```

**2. Configurar variables de entorno**

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` y completar:

- `JWT_SECRET` — string aleatorio de mínimo 32 caracteres
- `ANTHROPIC_API_KEY` — obtener en [console.anthropic.com](https://console.anthropic.com)

**3. Levantar el entorno**

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

**4. Aplicar migraciones de base de datos**

```bash
docker exec -it autoreport_api npx prisma migrate dev --name init
```

**5. Verificar que funciona**

- API: http://localhost:3000/api/health
- Documentación: http://localhost:3000/api/docs

## Comandos útiles

```bash
# Ver logs del backend
docker logs autoreport_api -f

# Correr tests
docker exec autoreport_api npm test

# Abrir explorador de BD
docker exec autoreport_api npx prisma studio --port 5555 --browser none
# Luego abrir http://localhost:5555

# Detener todo
docker compose -f docker-compose.dev.yml down
```

## Estructura del proyecto

backend/
├── prisma/ # Schema y migraciones de BD
└── src/
├── config/ # Configuración (BD, Swagger, storage)
├── controllers/ # Reciben HTTP y responden
├── middleware/ # Auth, validación, errores
├── repositories/# Queries a la BD
├── routes/ # Definición de endpoints
├── services/ # Lógica de negocio
├── utils/ # Helpers (logger, errors, response)
└── validators/ # Schemas de validación Zod

## Convención de commits

feat: nueva funcionalidad
fix: corrección de bug
chore: configuración o mantenimiento
test: agregar o modificar tests
docs: documentación
refactor: refactorización
