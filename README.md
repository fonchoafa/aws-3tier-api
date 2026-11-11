# Ecommerce API (AWS 3-tier lab)

Small Express app with a health check and a PostgreSQL connection test.

## Endpoints

| Route | Purpose |
|---|---|
| `GET /health` (also `/api/health`) | ALB health check, returns 200, does not use the database |
| `GET /db-test` (also `/api/db-test`) | Runs a query against the database to prove connectivity |
| `GET /` (also `/api`) | Basic "running" message |

## Run locally

```bash
npm install
cp .env.example .env     # then edit the values
npm start
```

Then open http://localhost:3000/health

The database test only works from somewhere that can reach the RDS instance (the
database is private, so it will not work from your laptop).

## Deploy on AWS

1. Push this repo to GitHub (make it public for the lab, or add a deploy token).
2. Paste `user-data.sh` into the EC2 launch template, with the placeholders filled in.
3. Target group: HTTP, port 3000, health check path `/health`.
4. Test through the ALB DNS name: `/health` should return `{"status":"ok"}` and
   `/db-test` should return `{"status":"connected", ...}`.

## Notes

- Never commit `.env`. It is in `.gitignore`.
- `user-data.sh` stores the DB password in plain text, which is acceptable for a
  short-lived lab. For anything real, use AWS Secrets Manager or SSM Parameter Store.
