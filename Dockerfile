FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend ./frontend
RUN npm run build --prefix frontend

FROM node:20-bookworm-slim AS production
ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix backend && npm cache clean --force

COPY backend ./backend
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 5000
CMD ["node", "backend/server.js"]
