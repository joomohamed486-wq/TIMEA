create extension if not exists pgcrypto;
create type public.app_role as enum ('SUPER_ADMIN','ADMIN','STAFF','INVENTORY_MANAGER','CUSTOMER');
create type public.order_status as enum ('NEW','CONFIRMED','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED','RETURNED','REFUNDED');
create type public.payment_status as enum ('PENDING','PAID','FAILED','REFUNDED');
create type public.coupon_type as enum ('PERCENTAGE','FIXED','FREE_SHIPPING');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null,
 email text unique not null,
 phone text,
 role public.app_role not null default 'CUSTOMER',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.brands (id uuid primary key default gen_random_uuid(),name text unique not null,slug text unique not null,logo text,description text,created_at timestamptz default now());
create table public.categories (id uuid primary key default gen_random_uuid(),name text unique not null,slug text unique not null,image text,created_at timestamptz default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), sku text unique not null, name text not null, slug text unique not null, description text,
 price numeric(12,2) not null check(price>=0), compare_at_price numeric(12,2), cost_price numeric(12,2), stock integer not null default 0 check(stock>=0), low_stock_threshold integer not null default 5,
 image text not null, featured boolean default false, new_arrival boolean default false, movement text, gender text, case_material text, case_diameter text, dial_color text, strap_material text, water_resistance text, warranty text,
 brand_id uuid not null references public.brands(id), category_id uuid not null references public.categories(id), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.addresses (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,country text not null,city text not null,area text,address text not null,building text,apartment text,postal_code text,notes text,created_at timestamptz default now());
create table public.carts (id uuid primary key default gen_random_uuid(),user_id uuid unique not null references public.profiles(id) on delete cascade,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.cart_items (id uuid primary key default gen_random_uuid(),cart_id uuid not null references public.carts(id) on delete cascade,product_id uuid not null references public.products(id) on delete cascade,quantity integer not null check(quantity>0),unique(cart_id,product_id));
create table public.coupons (id uuid primary key default gen_random_uuid(),code text unique not null,type public.coupon_type not null,value numeric(12,2) not null,minimum_order numeric(12,2) default 0,usage_limit integer,used_count integer default 0,starts_at timestamptz,ends_at timestamptz,active boolean default true);
create table public.orders (
 id uuid primary key default gen_random_uuid(),order_number text unique not null,user_id uuid not null references public.profiles(id),status public.order_status not null default 'NEW',payment_status public.payment_status not null default 'PENDING',payment_method text not null default 'COD',subtotal numeric(12,2) not null,discount numeric(12,2) default 0,shipping numeric(12,2) default 0,tax numeric(12,2) default 0,total numeric(12,2) not null,shipping_address jsonb not null,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.order_items (id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id uuid not null references public.products(id),name text not null,sku text not null,price numeric(12,2) not null,quantity integer not null check(quantity>0));
create table public.payments (id uuid primary key default gen_random_uuid(),order_id uuid unique not null references public.orders(id) on delete cascade,provider text not null,status public.payment_status default 'PENDING',amount numeric(12,2) not null,transaction_id text,created_at timestamptz default now());
create table public.reviews (id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,rating integer not null check(rating between 1 and 5),title text,comment text,approved boolean default false,created_at timestamptz default now());
create table public.wishlist_items (id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,product_id uuid not null references public.products(id) on delete cascade,unique(user_id,product_id));
create table public.inventory_transactions (id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id),user_id uuid references public.profiles(id),previous_qty integer not null,change integer not null,new_qty integer not null,reason text not null,created_at timestamptz default now());
create table public.coupon_usages (id uuid primary key default gen_random_uuid(),coupon_id uuid not null references public.coupons(id) on delete cascade,order_id uuid not null references public.orders(id) on delete cascade,unique(coupon_id,order_id));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,name,email) values(new.id,coalesce(new.raw_user_meta_data->>'name','Customer'),new.email); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('SUPER_ADMIN','ADMIN','STAFF','INVENTORY_MANAGER')); $$;

alter table public.profiles enable row level security; alter table public.products enable row level security; alter table public.brands enable row level security; alter table public.categories enable row level security; alter table public.carts enable row level security; alter table public.cart_items enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payments enable row level security; alter table public.addresses enable row level security; alter table public.reviews enable row level security; alter table public.wishlist_items enable row level security; alter table public.inventory_transactions enable row level security; alter table public.coupons enable row level security; alter table public.coupon_usages enable row level security;
create policy "public products read" on public.products for select using(true); create policy "admin products insert" on public.products for insert with check(public.is_admin()); create policy "admin products update" on public.products for update using(public.is_admin()) with check(public.is_admin()); create policy "admin products delete" on public.products for delete using(public.is_admin());
create policy "public brands read" on public.brands for select using(true); create policy "public categories read" on public.categories for select using(true);
create policy "own profile" on public.profiles for select using(id=auth.uid() or public.is_admin()); create policy "admin profile update" on public.profiles for update using(public.is_admin());
create policy "own cart" on public.carts for all using(user_id=auth.uid()) with check(user_id=auth.uid()); create policy "own cart items" on public.cart_items for all using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid())) with check(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy "own orders" on public.orders for select using(user_id=auth.uid() or public.is_admin()); create policy "admin orders update" on public.orders for update using(public.is_admin()) with check(public.is_admin());
create policy "own order items" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "own addresses" on public.addresses for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "approved reviews read" on public.reviews for select using(approved=true or user_id=auth.uid() or public.is_admin()); create policy "own reviews insert" on public.reviews for insert with check(user_id=auth.uid()); create policy "admin reviews update" on public.reviews for update using(public.is_admin());
create policy "own wishlist" on public.wishlist_items for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "admin inventory read" on public.inventory_transactions for select using(public.is_admin());
create policy "active coupons read" on public.coupons for select using(active=true); create policy "admin coupons write" on public.coupons for all using(public.is_admin()) with check(public.is_admin());

create or replace function public.create_order(p_items jsonb,p_address jsonb,p_payment_method text default 'COD',p_discount numeric default 0,p_shipping numeric default 0) returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); oid uuid; item jsonb; pid uuid; qty int; old_stock int; p record; subtotal numeric:=0; total numeric;
begin if uid is null then raise exception 'AUTH_REQUIRED'; end if; if jsonb_array_length(p_items)=0 then raise exception 'EMPTY_CART'; end if;
 for item in select * from jsonb_array_elements(p_items) loop pid:=(item->>'productId')::uuid; qty:=(item->>'quantity')::int; if qty<=0 then raise exception 'INVALID_QUANTITY'; end if; select * into p from public.products where id=pid for update; if not found then raise exception 'PRODUCT_NOT_FOUND'; end if; if p.stock<qty then raise exception 'INSUFFICIENT_STOCK'; end if; subtotal:=subtotal+(p.price*qty); end loop;
 total:=greatest(0,subtotal-coalesce(p_discount,0)+coalesce(p_shipping,0)); insert into public.orders(order_number,user_id,payment_method,subtotal,discount,shipping,tax,total,shipping_address) values('TM-'||to_char(now(),'YYYYMMDDHH24MISSMS'),uid,coalesce(p_payment_method,'COD'),subtotal,coalesce(p_discount,0),coalesce(p_shipping,0),0,total,p_address) returning id into oid;
 for item in select * from jsonb_array_elements(p_items) loop pid:=(item->>'productId')::uuid; qty:=(item->>'quantity')::int; select * into p from public.products where id=pid for update; old_stock:=p.stock; insert into public.order_items(order_id,product_id,name,sku,price,quantity) values(oid,p.id,p.name,p.sku,p.price,qty); update public.products set stock=stock-qty,updated_at=now() where id=p.id; insert into public.inventory_transactions(product_id,user_id,previous_qty,change,new_qty,reason) values(p.id,uid,old_stock,-qty,old_stock-qty,'ORDER'); end loop;
 insert into public.payments(order_id,provider,status,amount) values(oid,coalesce(p_payment_method,'COD'),'PENDING',total); return oid; end; $$;
