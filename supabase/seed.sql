insert into public.categories(name,slug) values ('كلاسيك','classic'),('كرونوغراف','chronograph'),('نسائي','women'),('غوص','diving'),('Luxury','luxury'),('رياضية','sport') on conflict (slug) do nothing;
insert into public.brands(name,slug) values ('TIMEA','timea'),('Aurelius','aurelius'),('Luna','luna'),('Oceanic','oceanic'),('Velocity','velocity') on conflict (slug) do nothing;
with b as (select id,slug from public.brands), c as (select id,slug from public.categories)
insert into public.products(sku,name,slug,price,stock,image,brand_id,category_id,description,movement,gender,case_material,warranty,featured,new_arrival)
select x.sku,x.name,x.slug,x.price,x.stock,x.image,(select id from b where slug=x.brand),(select id from c where slug=x.cat),x.description,x.movement,x.gender,'Stainless Steel','5 سنوات',x.featured,x.new_arrival from (values
('TM-1000','Classic Heritage','classic-heritage',4200,14,'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85','timea','classic','Automatic','رجالي',true,false),
('TM-1001','Chronograph Elite','chronograph-elite',6800,8,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85','aurelius','chronograph','Quartz','رجالي',true,false),
('TM-1002','Luna Rose','luna-rose',3550,21,'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=900&q=85','luna','women','Automatic','نسائي',true,false),
('TM-1003','Diver Pro 300','diver-pro-300',7900,5,'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=85','oceanic','diving','Automatic','رجالي',true,false),
('TM-1004','Minimal Steel','minimal-steel',2900,32,'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85','timea','classic','Quartz','رجالي',false,true),
('TM-1005','Royal Automatic','royal-automatic',12500,3,'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&fit=crop&w=900&q=85','aurelius','luxury','Automatic','رجالي',false,true),
('TM-1006','Sport Carbon','sport-carbon',5100,11,'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85','velocity','sport','Quartz','رجالي',false,true),
('TM-1007','Pearl Elegance','pearl-elegance',4600,16,'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=900&q=85','luna','women','Quartz','نسائي',false,true)
) as x(sku,name,slug,price,stock,image,brand,cat,movement,gender,featured,new_arrival)
on conflict (slug) do nothing;
