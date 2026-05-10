# LinguaTrack — Ishga tushirish

## 1. PostgreSQL o'rnatish

### Variant A: Docker (Eng oson)
```bash
docker run --name linguatrack-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=linguatrack \
  -p 5432:5432 \
  -d postgres:16
```

### Variant B: O'rnatish
- Windows: https://www.postgresql.org/download/windows/
- O'rnatgandan so'ng: `createdb linguatrack`

## 2. .env faylini sozlash

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/linguatrack"
AUTH_SECRET="any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
```

## 3. Migratsiya va seed

```bash
cd linguatrack
npx prisma migrate dev --name init
npm run db:seed
```

## 4. Serverni ishga tushirish

```bash
npm run dev
```

**http://localhost:3000** da oching.

## Test foydalanuvchilar (seed dan)

| Rol | Email | Parol |
|-----|-------|-------|
| O'qituvchi | teacher@linguatrack.uz | teacher123 |
| Talaba 1 | student1@linguatrack.uz | student123 |
| Talaba 2 | student2@linguatrack.uz | student123 |
