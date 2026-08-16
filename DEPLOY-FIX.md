# TIMEA Admin Production Setup

## Vercel Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the Supabase Publishable key may be stored under this existing variable name)
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose it to the browser)

Enable the variables for Production and Preview. Redeploy after changing any `NEXT_PUBLIC_*` variable.

## Admin modules

- `/admin` dashboard
- `/admin/products` product CRUD
- `/admin/orders` order listing, order details and status/payment updates
- `/admin/categories` category CRUD
- `/admin/brands` brand CRUD
- `/admin/coupons` coupon CRUD
- `/admin/reviews` moderation and deletion
- `/admin/inventory` stock adjustment + inventory transaction logging
- `/admin/users` account creation, roles, and deletion

All admin API routes verify the signed-in user's profile role before using the server-only Supabase Admin client.
