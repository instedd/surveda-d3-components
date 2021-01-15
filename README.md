## ⚠️  This repo is readonly and its component have been embedded in [instedd/surveda](https://github.com/instedd/surveda) ⚠️
Ref: [instedd/surrveda#1827](https://github.com/instedd/surveda/pull/1827)

---

# surveda-d3-components

## Install

```
docker-compose run --rm node yarn install
```

## Test

```
docker-compose run --rm node yarn install
```

## Publish a new version

```
vim package.json # update version
git add package.json && git commit -m "Version bump (v1.x.y)"
git tag v1.x.y
docker-compose run --rm node yarn run clean
docker-compose run --rm node yarn run build
npm publish
git push --tags
```
