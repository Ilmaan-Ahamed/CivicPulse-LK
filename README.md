This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Report photo uploads and image storage

New report photos are uploaded to Cloudinary through the authenticated
`/api/upload` route. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` in `.env.local` for local development and in Vercel for
each deployment environment that needs uploads. The API reports missing
Cloudinary variable names in server logs; it does not expose storage credentials
to the browser. In Vercel, enable these variables for Production, Preview, and
Development as needed, then redeploy after changing them; existing deployments
keep the environment values they were built with.

`DATABASE_URL` is also required: upload authentication, user lookup, and rate
limiting use the application database. The application no longer falls back to
a localhost database URL when it is unset.

MinIO configuration (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`,
`MINIO_SECRET_KEY`, `MINIO_USE_SSL`, and `MINIO_BUCKET_NAME`) is separate from
the current Cloudinary upload path. MinIO is used to generate URLs for report
photos stored there. For the local Compose MinIO service, the endpoint is
`localhost:9000`; the console is at `http://localhost:9001` with the development
credentials in `docker-compose.yml`. If running the application inside Compose,
its internal endpoint is `minio`, while `MINIO_PUBLIC_ENDPOINT` should be the
host that browsers use to reach MinIO (usually `localhost`).

Run `docker compose up -d postgres minio`, then `npx prisma db push` after
confirming `DATABASE_URL` points to the intended development database.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
