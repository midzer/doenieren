# doenieren

[Hugo](https://gohugo.io/) website showing places with kebab cuisine in germany.

## Locations

All locations (nodes and ways) with `cuisine` == `kebab` or `turkish` are considered in preprocessing.

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
