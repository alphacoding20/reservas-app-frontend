# CanchaYa — Frontend actualizado

Frontend de CanchaYa construido con React, Vite, TypeScript y Tailwind. Este paquete conserva el flujo de reservas, consulta de clima, aviso de recargos por festivos y fines de semana, y completa las pantallas administrativas usando los endpoints existentes.

## Requisitos
- Node.js 20 o superior
- npm
- Los cuatro microservicios disponibles localmente o desplegados

## Ejecutar en local (puerto 5173)
1. Abre una terminal en esta carpeta.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Copia la configuración local:
   ```bash
   cp .env.example .env
   ```
   En Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Inicia el frontend en el puerto 5173:
   ```bash
   npm run dev
   ```
   También puedes exigir explícitamente el puerto:
   ```bash
   npm run dev -- --port 5173 --strictPort
   ```
   Si el puerto 5173 está ocupado, Vite mostrará un error en lugar de cambiar silenciosamente a 5174. Cierra el proceso que esté usando 5173 y vuelve a iniciar.
5. Abre `http://localhost:5173`.

## Funciones del usuario
- Registro e inicio de sesión.
- Consulta y búsqueda de canchas.
- Disponibilidad por fecha.
- Consulta de tarifa por fecha antes de reservar.
- Aviso de tarifa especial si la fecha es festivo o fin de semana, con precio base, precio final por hora, porcentaje de recargo y total estimado.
- Creación, cancelación y reprogramación de reservas.
- Consulta del pronóstico de lluvia para reservas confirmadas.
- Historial de notificaciones del usuario.

## Funciones del administrador
- Resumen con estadísticas existentes y estado de las canchas.
- Registrar, editar, cambiar estado y eliminar canchas.
- Crear bloqueos de disponibilidad.
- Consultar todas las reservas.
- Filtrar reservas por estado, cancha, rango de fechas, número de reserva o usuario.
- Marcar reservas como completadas o como no asistidas, y cancelar reservas.
- Ejecutar manualmente las alertas de lluvia y los recordatorios para una fecha.
- Consultar el historial de notificaciones correspondiente a la cuenta administradora.

## Cambios administrativos realizados solo en frontend
- Se reutiliza `PUT /api/canchas/{id}` para editar los datos y estado de una cancha.
- Se reutilizan los endpoints existentes de reservas para consultar todas, marcar asistencia y cancelar.
- Los filtros administrativos se aplican en el navegador sobre la lista ya consultada. No requieren endpoints adicionales.
- No se agregan tablas, microservicios ni reglas de negocio en el backend.

Nota: el endpoint de consulta de horario entrega los bloqueos como franjas sin identificador de bloqueo; por eso esta versión permite crear bloqueos, pero no inventa una operación para listar y eliminar bloqueos existentes desde esa respuesta.

## Configuración de APIs

### Local
`.env.example` contiene las cuatro URLs locales:
- Auth: `http://localhost:8081`
- Canchas: `http://localhost:8082`
- Reservas: `http://localhost:8083`
- Notificaciones: `http://localhost:8084`

### Render
En el servicio Static Site de Render configura estas variables de entorno con las URLs públicas reales de tus cuatro microservicios:
- `VITE_AUTH_API_URL`
- `VITE_COURTS_API_URL`
- `VITE_RESERVATIONS_API_URL`
- `VITE_NOTIFICATIONS_API_URL`

`.env.production.example` conserva las URLs públicas que estaban configuradas en la versión frontend anterior. Verifica que sigan siendo las URLs actuales antes de desplegar. Las variables `VITE_` quedan incluidas en el JavaScript público; no pongas contraseñas, tokens ni secretos allí.

## Desplegar en Render Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Añade las cuatro variables `VITE_*` indicadas arriba.
- En Render, agrega una regla de Rewrite en la sección Redirects/Rewrites: Source `/*`, Destination `/index.html`, Action `Rewrite`, para que las rutas de React Router funcionen al recargar una página.
- Después de modificar variables `VITE_*`, vuelve a desplegar para que se incorporen al build.

## Verificar antes de subir
```bash
npm run build
```

## Archivos principales
```text
src/
  App.tsx       Rutas, pantallas, panel de usuario y administrador
  api.ts        Clientes Axios y funciones REST
  auth.tsx      Contexto de sesión
  types.ts      Tipos de datos
  index.css     Estilos Tailwind
  main.tsx      Punto de entrada
```

## Seguridad
El proyecto conserva la sesión local utilizada en la demostración académica. No equivale a autenticación robusta para producción. No se incluyen credenciales de base de datos ni tokens de Telegram en el frontend.
