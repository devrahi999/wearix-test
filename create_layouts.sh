#!/bin/bash

create_layout() {
  local dir=$1
  local title=$2
  local noindex=$3
  
  mkdir -p "$dir"
  
  if [ "$noindex" = "true" ]; then
    cat << INNER_EOF > "$dir/layout.tsx"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$title',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
INNER_EOF
  else
    cat << INNER_EOF > "$dir/layout.tsx"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$title',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
INNER_EOF
  fi
}

create_layout "src/app/(main)/cart" "Shopping Cart" "true"
create_layout "src/app/(main)/checkout" "Checkout" "true"
create_layout "src/app/(main)/order-confirmation" "Order Confirmation" "true"
create_layout "src/app/(main)/account" "My Account" "true"
create_layout "src/app/(auth)/login" "Login" "true"
create_layout "src/app/(auth)/register" "Register" "true"
create_layout "src/app/(main)/categories" "All Categories" "false"

echo "Layouts created."
