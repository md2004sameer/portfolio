# Sameer SDE Portfolio

This is a static website; it has no build step, package manager, or server-side runtime.

## Deploy

Publish the contents of this folder as the hosting provider's static site root. Keep these files together and preserve their names and capitalization:

- `index.html`
- `style.css`
- `data.js`
- `script.js`
- `favicon.svg`
- `passport_size_image.jpeg`
- `Sameer_Resume.pdf`

The Windows 7 wallpaper is loaded from the external image URL in `style.css`, so the deployed site needs internet access to display it. The rest of the page assets are local.

## Check locally

From this folder, run `python3 -m http.server 8000` and open `http://localhost:8000`. Confirm the desktop loads, the portrait appears, the profile shortcuts open, and the resume can be opened and downloaded.

For provider-specific settings such as custom domains, redirects, and security headers, use the hosting provider's static-site configuration.
