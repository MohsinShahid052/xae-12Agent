FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production
# Remove this line: ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Install additional dependencies for our custom server
RUN npm install --save express compression morgan
# Remove CLI packages since we don't need them in production by default.
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]