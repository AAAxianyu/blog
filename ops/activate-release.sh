#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?release id is required}"
if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid release id: ${release_id}" >&2
  exit 2
fi

archive="/tmp/blog-${release_id}.tgz"
app_root="/srv/x1anyu-blog"
release_dir="${app_root}/releases/${release_id}"
data_root="/var/lib/x1anyu-blog"
previous_target=""

set_deployment_version() {
  local version="$1"
  if grep -q '^DEPLOYMENT_VERSION=' /etc/x1anyu-blog.env; then
    sed -i "s/^DEPLOYMENT_VERSION=.*/DEPLOYMENT_VERSION=${version}/" /etc/x1anyu-blog.env
  else
    printf 'DEPLOYMENT_VERSION=%s\n' "$version" >> /etc/x1anyu-blog.env
  fi
}

if [ -L "${app_root}/current" ]; then
  previous_target="$(readlink -f "${app_root}/current")"
fi

cleanup_failed_release() {
  if [ -n "$previous_target" ] && [ -d "$previous_target" ]; then
    set_deployment_version "$(basename "$previous_target")"
    ln -sfn "$previous_target" "${app_root}/current.rollback"
    mv -Tf "${app_root}/current.rollback" "${app_root}/current"
    systemctl restart x1anyu-blog || true
  fi
}
trap cleanup_failed_release ERR

id -u blog >/dev/null 2>&1 || useradd --system --home-dir "$app_root" --shell /usr/sbin/nologin blog
install -d -o root -g root -m 755 "${app_root}/releases"
install -d -o blog -g blog -m 750 "${data_root}/posts" "${data_root}/uploads" "${data_root}/trash"

rm -rf "$release_dir"
install -d -o root -g root -m 755 "$release_dir"
tar -xzf "$archive" -C "$release_dir"

if ! find "${data_root}/posts" -maxdepth 1 -type f \( -name '*.md' -o -name '*.mdx' \) | grep -q .; then
  cp -a "${release_dir}/seed-posts/." "${data_root}/posts/"
  chown -R blog:blog "${data_root}/posts"
fi

if [ ! -f /etc/x1anyu-blog.env ]; then
  umask 077
  {
    printf 'NODE_ENV=production\n'
    printf 'HOSTNAME=127.0.0.1\n'
    printf 'PORT=3000\n'
    printf 'SITE_URL=https://x1anyu.top\n'
    printf 'DEPLOYMENT_VERSION=%s\n' "$release_id"
    printf 'BLOG_CONTENT_DIR=%s/posts\n' "$data_root"
    printf 'BLOG_UPLOAD_DIR=%s/uploads\n' "$data_root"
    printf 'BLOG_TRASH_DIR=%s/trash\n' "$data_root"
    printf 'ADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18)"
    printf 'SESSION_SECRET=%s\n' "$(openssl rand -hex 32)"
  } > /etc/x1anyu-blog.env
else
  set_deployment_version "$release_id"
fi

cp "${release_dir}/ops/x1anyu-blog.service" /etc/systemd/system/x1anyu-blog.service
cp "${release_dir}/ops/nginx.conf" /etc/nginx/sites-available/blog
ln -sfn /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
rm -f /etc/nginx/sites-enabled/default

ln -sfn "$release_dir" "${app_root}/current.next"
mv -Tf "${app_root}/current.next" "${app_root}/current"

systemctl daemon-reload
systemctl enable x1anyu-blog

# The legacy deployment used PM2 on the same port. Remove it before systemd
# takes ownership during the first migration.
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete blog >/dev/null 2>&1 || true
  pm2 save --force >/dev/null 2>&1 || true
fi

systemctl restart x1anyu-blog
nginx -t
systemctl reload nginx

for _ in {1..15}; do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    trap - ERR
    rm -f "$archive"
    find "${app_root}/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
      | sort -nr | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
    exit 0
  fi
  sleep 1
done

echo "Health check failed for release ${release_id}" >&2
exit 1
