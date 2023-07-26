# Wastebin

Welcome to Wastebin, a simple, minimal pastebin service.

> Note: this app will probably stop receiving updates for the foreseeable future.
> If I decide to pursue this project further, I will probably just start from scratch using another tech stack due to some technical limitations and difficulties in Python & Jinja2.

## Demo

A public demo is available [here](https://wastebin.deta.dev/doc/readme.md).

You can view the source code of the app in the app itself, for example <https://wastebin.deta.dev/doc/main.py>.

## Installation

Install your own instance of Wastebin on Deta Space by clicking the button below.

[![Install on Space](https://deta.space/buttons/dark.svg)](https://deta.space/discovery/@lemonpi/wastebin)

## Why is it called Wastebin?

Because "w" was the only letter left that worked with "-astebin" and wasn't already used.

## Planned features

- [ ] Passwords for documents
- [ ] Uploading folders or multiple files at once

## Known issues

- Ephemeral documents are the source of many problems and edge cases
- Loading a document requires JavaScript, this was done to avoid making two requests to the server fetching the document

## Privacy

When you install your own copy of Wastebin, all the data is stored in your own Deta Space.
This means that you have full control over your data, and can delete it at any time.

## License

[MIT License](license.txt)
