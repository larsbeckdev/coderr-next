# Coderr Frontend (Next.js)

The frontend for the Coderr freelancer marketplace, built with Next.js App
Router, shadcn/ui (Base UI, `base-mira` style) and Tailwind v4. It talks to the
Django REST API in [../backend/](../backend/) and needs no changes on that side.

Business users publish offers with a basic, standard and premium package,
customers book a package, follow the order status and leave one review per
business user.

## Requirements

- Node 24 (managed with fnm)
- The Coderr Django backend running and reachable

## Getting started

```powershell
npm install
npm run dev
```

The app expects the API at `http://127.0.0.1:8000/api`. The host name is never
compiled into the bundle: the client derives it from the address the page was
loaded from and appends the API port, so the same build works on `localhost`,
on a LAN address and on a server.

Two environment variables adjust that, both inlined at build time
(`lib/api/client.ts`):

```dotenv
# Port of the API on the same host the page was loaded from. Default 8000.
NEXT_PUBLIC_API_PORT=3070

# Full base URL, wins over the port. Only needed when the API is not on
# <same host>:<port>, for example behind a domain.
NEXT_PUBLIC_API_BASE_URL=https://demo.example.com/api
```

## Demo accounts

The login page offers both sides of the marketplace as one-click buttons. The
credentials are part of the source (`lib/auth/sign-in.ts`), so no environment
variable is involved:

| Account | Username | Password | Type |
| --- | --- | --- | --- |
| Guest customer | `mila` | `demo1234` | customer |
| Guest business | `jonas` | `demo1234` | business |

Create the matching accounts on the backend with:

```powershell
python manage.py create_guest_users
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint incl. the React Compiler rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

## Routes

| Route | Content |
| --- | --- |
| `/` | Landing page with the platform statistics from `/api/base-info/` |
| `/login`, `/register` | Authentication, redirects to the dashboard when a session exists |
| `/dashboard` | Counters and charts, different for customer and business accounts |
| `/offers` | Offer list with search, filters, sorting and pagination |
| `/offers/new`, `/offers/[offerId]/edit` | Offer form, business accounts only |
| `/offers/[offerId]` | Offer detail with the three packages and the provider card |
| `/orders` | Own orders, with the status controls for business accounts |
| `/profile`, `/profile/[userId]` | Own profile (editable) and foreign profiles with their reviews |
| `/imprint`, `/privacy` | Legal pages, reachable without a session |

## API coverage

Every endpoint of the Coderr API is used:

| Endpoint | Module |
| --- | --- |
| `POST /api/registration/`, `POST /api/login/` | `lib/api/auth.ts` |
| `GET, PATCH /api/profile/{id}/` | `lib/api/profiles.ts` |
| `GET /api/profiles/business/`, `GET /api/profiles/customer/` | `lib/api/profiles.ts` |
| `GET, POST /api/offers/` | `lib/api/offers.ts` |
| `GET, PATCH, DELETE /api/offers/{id}/` | `lib/api/offers.ts` |
| `GET /api/offerdetails/{id}/` | `lib/api/offers.ts` |
| `GET, POST /api/orders/` | `lib/api/orders.ts` |
| `PATCH, DELETE /api/orders/{id}/` | `lib/api/orders.ts` |
| `GET /api/order-count/{id}/`, `GET /api/completed-order-count/{id}/` | `lib/api/orders.ts` |
| `GET, POST /api/reviews/` | `lib/api/reviews.ts` |
| `PATCH, DELETE /api/reviews/{id}/` | `lib/api/reviews.ts` |
| `GET /api/base-info/` | `lib/api/base-info.ts` |

## Structure

```text
app/
  (auth)/       login and registration, split layout with the brand panel
  (site)/       landing page and the signed-in shell with header, nav and footer
  (legal)/      imprint and privacy
  fonts/        DM Sans, self hosted
components/
  auth/ brand/ dashboard/ forms/ landing/ layout/ offers/ orders/ profile/ reviews/
  ui/           shadcn components
hooks/          TanStack Query hooks per resource
lib/
  api/          one module per API resource, zod schemas for every response
  auth/         session storage, sign-in helpers and the useSession hook
```

## Notes

- The API authenticates with a DRF token that the browser has to send on every
  request, so the session is kept in `localStorage` under `coderr.session`. In
  an app that controls its own backend, an httpOnly cookie would be the better
  place. The profile type is stored next to the token because almost every
  screen branches on it and the auth endpoints do not return it.
- Responses are validated with zod. A contract change on the Django side shows
  up as an explicit error instead of a crash somewhere in a component.
- The theme follows the system setting and can be toggled with the `d` key
  outside of input fields.
