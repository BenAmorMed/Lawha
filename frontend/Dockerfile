FROM node:20-alpine

WORKDIR /app

# Copy ALL source files first (including config files needed for build)
COPY . .

# Install dependencies (including tailwindcss/postcss in dependencies)
RUN npm install --legacy-peer-deps

# Build - all config files are already in place
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
