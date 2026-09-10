# Coderr Backend

REST API for the Coderr freelancer marketplace, built with Django and the
Django REST Framework. Business users publish offers with three packages,
customers order those packages and rate the business users afterwards.

This is the backend half of the repository. The matching Next.js frontend lives
in [../frontend/](../frontend/), and [../README.md](../README.md) describes the
Docker Compose stack that runs both together.

## Requirements

- Python 3.12 or newer
- pip

## Setup

```bash
git clone <repository-url>
cd coderr-next/backend

python -m venv env
# Windows
env\Scripts\activate
# macOS / Linux
source env/bin/activate

pip install -r requirements.txt
```

### Configuration (optional)

Every setting has a development fallback, so the project runs without any
extra configuration. To override values, copy the template and adjust it:

```bash
cp .env.template .env.local
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | insecure dev key | Django secret key |
| `DJANGO_DEBUG` | `True` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma separated hosts |
| `DJANGO_CORS_ALLOWED_ORIGINS` | local Live Server ports | Allowed frontend origins |
| `DJANGO_CORS_ALLOW_ALL_ORIGINS` | `True` | Allow every origin (development only) |

`.env.local` is ignored by git and must never be committed.

### Database and start

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is then available at `http://127.0.0.1:8000/api/`, the admin interface
at `http://127.0.0.1:8000/admin/`.

### Guest accounts

The frontend has two guest login buttons. Create the matching accounts with:

```bash
python manage.py create_guest_users
```

| Account | Username | Password | Type |
| --- | --- | --- | --- |
| Guest customer | `mila` | `demo1234` | customer |
| Guest business | `jonas` | `demo1234` | business |

The command is idempotent and skips accounts that already exist.

## Frontend connection

Start the frontend with `npm run dev` in [../frontend/](../frontend/) while this
backend is running. It builds its API base URL from the host it was loaded from
and appends port `8000` (`lib/api/client.ts`), so opening the page on
`127.0.0.1` talks to `127.0.0.1:8000` and opening it on a LAN address talks to
that same address.

Add the frontend origin to `DJANGO_CORS_ALLOWED_ORIGINS` if you disable
`DJANGO_CORS_ALLOW_ALL_ORIGINS`.

Uploaded profile pictures and offer images are served from `/media/` while
`DEBUG` is enabled.

### Access from other devices in the network

By default `runserver` only listens on `127.0.0.1`, which is reachable from
this machine only. To open the app from a phone or a second computer:

```bash
python manage.py runserver 0.0.0.0:8000
```

Add the machine's LAN address to `DJANGO_ALLOWED_HOSTS` in `.env.local`:

```text
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,192.168.0.42
```

Then open the frontend through the same address, for example
`http://192.168.0.42:3000`. Do not mix the two: a page served from a LAN
address while the API is addressed as `127.0.0.1` is blocked by the browser,
because a public origin may not call loopback.

Windows may additionally ask to allow Python through the firewall the first
time an external device connects.

## Authentication

The API uses token authentication. Send the token returned by
`/api/registration/` or `/api/login/` in every authenticated request:

```http
Authorization: Token <your-token>
```

## Endpoints

| Method | Path | Permission |
| --- | --- | --- |
| POST | `/api/registration/` | public |
| POST | `/api/login/` | public |
| GET, PATCH | `/api/profile/<pk>/` | authenticated, PATCH owner only |
| GET | `/api/profiles/business/` | authenticated |
| GET | `/api/profiles/customer/` | authenticated |
| GET | `/api/offers/` | public |
| POST | `/api/offers/` | business users |
| GET | `/api/offers/<id>/` | authenticated |
| PATCH, DELETE | `/api/offers/<id>/` | offer owner |
| GET | `/api/offerdetails/<id>/` | authenticated |
| GET | `/api/orders/` | authenticated |
| POST | `/api/orders/` | customer users |
| PATCH | `/api/orders/<id>/` | business user of the order |
| DELETE | `/api/orders/<id>/` | staff |
| GET | `/api/order-count/<business_user_id>/` | authenticated |
| GET | `/api/completed-order-count/<business_user_id>/` | authenticated |
| GET, POST | `/api/reviews/` | authenticated, POST customer users |
| PATCH, DELETE | `/api/reviews/<id>/` | review author |
| GET | `/api/base-info/` | public |

### Offer list query parameters

| Parameter | Description |
| --- | --- |
| `creator_id` | Only offers of this user |
| `min_price` | Offers whose cheapest package costs at least this much |
| `max_delivery_time` | Offers deliverable within this number of days |
| `ordering` | `updated_at` or `min_price`, prefix with `-` to reverse |
| `search` | Full text search in title and description |
| `page`, `page_size` | Pagination, default page size is 6 |

Empty query values are ignored, so the request the frontend sends
(`?creator_id=&search=&ordering=&page=1&max_delivery_time=`) returns the
unfiltered first page.

### Review list query parameters

| Parameter | Description |
| --- | --- |
| `business_user_id` | Only reviews about this business user |
| `reviewer_id` | Only reviews written by this user |
| `ordering` | `updated_at` or `rating`, prefix with `-` to reverse |

## Project structure

```text
core/              settings, central routing, wsgi
auth_app/          profile model, registration, login, profile endpoints
offers_app/        offers and offer packages
orders_app/        orders and the business order counters
reviews_app/       reviews
base_info_app/     aggregated platform statistics
```

Every app keeps its API layer in an `api/` package containing `serializers.py`,
`views.py`, `urls.py` and, where needed, `permissions.py`, `filters.py` and
`pagination.py`.

## Tests

```bash
python manage.py test
```

With coverage:

```bash
coverage run --source=. --omit="*/migrations/*,*/tests.py,manage.py,core/wsgi.py,core/asgi.py,env/*" manage.py test
coverage report -m
```

## Troubleshooting

**Every request answers `401`, even the public ones.**
The frontend stores its token in `localStorage` and sends it with every
request. Token authentication runs before the permission check, so an invalid
token also rejects public endpoints such as `/api/base-info/`. This happens
after the database was recreated while the browser still holds the old token.
Clear it in the browser console and reload:

```js
localStorage.clear(); location.reload();
```

**The browser reports a failed CORS request with status `null`.**
No response arrived at all. Check that the backend is running and that the
frontend and the API use the same host, see
[Access from other devices in the network](#access-from-other-devices-in-the-network).

**`DisallowedHost` in the server log.**
Add the address you are using to `DJANGO_ALLOWED_HOSTS` in `.env.local`.

## Notes

- Business users can create offers, customers can order and review them.
  A user can write at most one review per business user.
- An offer always needs exactly one `basic`, one `standard` and one `premium`
  package. On `PATCH`, packages are matched by their `offer_type`, so their ids
  stay stable.
- Orders copy the package data at the time of ordering, so later offer changes
  do not modify existing orders.
- Profile text fields are always returned as empty strings instead of `null`.
- The SQLite database file is intentionally not part of this repository.
