# ეტაპი 1 — build
FROM node:20-alpine AS builder

WORKDIR /app

# package-lock-ის ზუსტი დაცვით ინსტალაცია (npm install-ისგან განსხვავებით
# ვერსიებს არ შეცვლის).
COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ ცვლადები build-ის დროს იკერება ფაილებში, გაშვებისას უკვე გვიანია.
# გადაცემა არასავალდებულოა — newRequest.js-ს production-ის მისამართი
# სარეზერვოდ აქვს ჩაწერილი.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ეტაპი 2 — გაშვება
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
