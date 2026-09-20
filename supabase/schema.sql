-- =====================================================================
-- 物件テーブル（properties）の作成SQL
-- Supabaseダッシュボードの「SQL Editor」に貼り付けて実行してください。
-- 何度実行してもエラーにならないように作ってあります（再実行可能）。
-- =====================================================================

-- ---------------------------------------------------------------------
-- テーブル定義
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id          uuid        primary key default gen_random_uuid(),
  -- 登録したユーザー。INSERT時は省略すると自動的にログイン中のユーザーIDが入る。
  -- ユーザーが退会（auth.usersから削除）されたら、そのユーザーの物件も削除する。
  user_id     uuid        not null default auth.uid()
                          references auth.users (id) on delete cascade,
  name        text        not null check (char_length(btrim(name)) > 0),        -- 物件名
  rent        integer     not null check (rent >= 0),                            -- 家賃（円）
  area        text        not null check (char_length(btrim(area)) > 0),        -- エリア名
  floor_plan  text        not null check (char_length(btrim(floor_plan)) > 0),  -- 間取り（例：1LDK）
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.properties            is '物件情報';
comment on column public.properties.user_id    is '登録したユーザーのID（auth.users.id）';
comment on column public.properties.name       is '物件名';
comment on column public.properties.rent       is '家賃（円・月額）';
comment on column public.properties.area       is 'エリア名';
comment on column public.properties.floor_plan is '間取り（例：1LDK）';

-- 「自分の物件」を絞り込む検索が速くなるようにインデックスを張る
create index if not exists properties_user_id_idx
  on public.properties (user_id);

-- ---------------------------------------------------------------------
-- 更新日時（updated_at）を、UPDATEのたびに自動で書き換えるトリガー
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security（行レベルセキュリティ）
-- 有効化すると、ポリシーで許可された行しか読み書きできなくなる。
-- ---------------------------------------------------------------------
alter table public.properties enable row level security;

-- ポリシーは「ログイン済み（authenticated）」のユーザーにのみ付与する。
-- 未ログイン（anon）にはポリシーが無いため、一切アクセスできない。
-- ※ (select auth.uid()) と書くのは、行ごとの再評価を避けて高速化するためのSupabase推奨の書き方。

-- 自分が登録した物件だけ表示できる
drop policy if exists "自分の物件のみ表示" on public.properties;
create policy "自分の物件のみ表示"
  on public.properties
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 登録できるのは、user_id が自分のIDの行だけ（他人になりすまして登録できない）
drop policy if exists "自分の物件のみ登録" on public.properties;
create policy "自分の物件のみ登録"
  on public.properties
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 自分の物件だけ編集できる。編集後も user_id を他人のIDに書き換えられない。
drop policy if exists "自分の物件のみ編集" on public.properties;
create policy "自分の物件のみ編集"
  on public.properties
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 自分の物件だけ削除できる
drop policy if exists "自分の物件のみ削除" on public.properties;
create policy "自分の物件のみ削除"
  on public.properties
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
