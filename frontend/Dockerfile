FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite reads these from the environment and inlines them into the bundle.
ARG VITE_API_BASE_URL=/api
ARG VITE_TELEGRAM_URL=https://t.me/itstek
ARG VITE_INSTAGRAM_URL=https://instagram.com/itstek
ARG VITE_CONTACT_PHONE=+998920236090
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_TELEGRAM_URL=$VITE_TELEGRAM_URL \
    VITE_INSTAGRAM_URL=$VITE_INSTAGRAM_URL \
    VITE_CONTACT_PHONE=$VITE_CONTACT_PHONE

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
