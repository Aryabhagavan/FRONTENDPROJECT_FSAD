# Nspire Farming Society Backend

Spring Boot backend for the farming awareness and farmer support platform.

## Includes

- JWT login and registration
- Role-based access for Admin, Farmer, Expert, and Public users
- DTO request and response objects
- ModelMapper configuration
- Centralized exception handling
- Swagger UI
- MySQL persistence

## Run In STS

1. Make sure MySQL is running. The app uses `mydb1` by default and can create it automatically.
2. Import `backend` as an existing Maven project in Spring Tool Suite.
3. Set `DB_USERNAME` and `DB_PASSWORD` if your MySQL credentials are different.
4. Run `SpringSecurityBackendDemoApplication`.
5. Open Swagger at `http://localhost:2026/swagger-ui.html`.

Default admin:

- username: `admin`
- password: `admin123`

React frontend should run separately with `npm run dev` and calls this backend at `http://localhost:2026/api`.
"# FRONTENDPROJECT_FSAD" 
