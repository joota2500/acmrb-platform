create table associados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  created_at timestamp default now()
);

create table noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text,
  created_at timestamp default now()
);

create table parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  created_at timestamp default now()
);