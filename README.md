# doenieren

[Hugo](https://gohugo.io/) website showing places with kebab cuisine in germany.

## Locations

For a location (node or way) to appear in `doenieren.in/<city>`, the following criteria must be met:

1. The location's [`cuisine`](https://wiki.openstreetmap.org/wiki/Key:cuisine) value must contain `kebab` or `turkish`.
2. The location's [`addr:city`](https://wiki.openstreetmap.org/wiki/Key:addr:city) value must equal `<city>`.

## Preprocessing

Geration of markdown files (`content/cities` and `data/cities`) is done via https://github.com/midzer/pbf2md/tree/doener project.

## Setup

```bash
# Clone this repo
git clone https://github.com/midzer/doenieren.git
# Launch hugo dev environment
hugo serve
# Done! Site is now available at http://localhost:1313/
```
