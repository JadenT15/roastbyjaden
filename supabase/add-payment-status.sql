alter table orders
  add column if not exists payment_status text not null default 'UNPAID',
  add column if not exists payment_reference text not null default '',
  add column if not exists paid_at timestamptz;

alter table orders
  drop constraint if exists orders_payment_status_check,
  add constraint orders_payment_status_check check (
    payment_status in ('UNPAID', 'PENDING', 'PAID', 'PAYMENT_REVIEW')
  );
