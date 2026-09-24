source "https://rubygems.org"

# Mismas versiones que el build clásico de GitHub Pages (Jekyll 3.10, minima 2.5.1…).
# Así el sitio que compila GitHub Actions es idéntico al de antes.
gem "github-pages", group: :jekyll_plugins

# Evita el aviso de jekyll-github-metadata y es necesario para `jekyll serve` en Ruby 3
gem "faraday-retry"
gem "webrick"

# Windows (para compilar en local)
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
gem "wdm", "~> 0.1", platforms: [:mingw, :x64_mingw, :mswin]
