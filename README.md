# GeoPDF for ArcGIS Experience Builder

**GeoPDF** is an open-source custom widget for **ArcGIS Experience Builder Developer Edition 1.17**. It allows users to load a geospatial PDF from their computer and visualize its georeferenced first page as an overlay on an interactive map.

The widget uses PDF.js for browser-side PDF rendering and the ArcGIS Maps SDK for JavaScript to display the resulting image as a `MediaLayer`.

> **Project status:** Development release. Validate supported GeoPDF files and the hosting configuration before production use.

## Features

- Load a local geospatial PDF through the browser.
- Connect to an Experience Builder Map widget.
- Render the first page of a PDF using PDF.js.
- Extract Adobe geospatial PDF `/GPTS` and `/LPTS` control-point metadata.
- Display the georeferenced page as a map overlay using `MediaLayer` and `ImageElement`.
- Zoom to the imported overlay.
- Toggle overlay visibility and adjust opacity.
- Localized interface: English, Italian, German, Spanish, French, and Simplified Chinese.

## Compatibility

| Component | Version / notes |
| --- | --- |
| ArcGIS Experience Builder | Developer Edition **1.17** |
| PDF.js | `pdfjs-dist` **3.11.174** |
| ArcGIS Maps SDK for JavaScript | Provided by the Experience Builder runtime |
| Hosting | Static web hosting, including IIS, subject to deployment testing |
| ArcGIS Enterprise / Portal | Verify compatibility with the target environment and widget registration workflow |

## ArcGIS Enterprise compatibility

**This repository targets ArcGIS Enterprise 11.5** and was developed for **ArcGIS Experience Builder Developer Edition 1.17** (ArcGIS Maps SDK for JavaScript 4.32). The widget's `manifest.json` declares `"exbVersion": "1.17.0"`.

Custom widgets should be built with the Developer Edition version corresponding to the target ArcGIS Enterprise release. **Do not assume that the compiled package for 11.5 can be deployed unchanged to 12.0, 12.1, or later.** Rebuild the source using the matching Experience Builder Developer Edition and validate compatibility, dependencies, PDF.js worker loading, and behavior in the target portal.

| ArcGIS Enterprise | Experience Builder Developer Edition | ArcGIS Maps SDK for JavaScript |
| --- | --- | --- |
| **11.5 (this release)** | **1.17** | **4.32** |
| 12.0 | 1.18 | 4.33 |
| 12.1 | 1.20 | 5.0 |

Source: [Esri – Experience Builder release versions](https://developers.arcgis.com/experience-builder/guide/release-versions/). Refer to the official table for other and future versions. For a different target release, install the corresponding Developer Edition, place the widget source in its `client/your-extensions/widgets/geoPdf` directory, review `manifest.json` and API compatibility, and generate a new production distribution with that version's build command.

## Publish the widget to ArcGIS Enterprise Portal

ArcGIS Enterprise 11.0 and later supports registering custom Experience Builder widgets in Portal. **The source repository alone cannot be registered directly**: compile the widget, host its production files on an HTTPS web server, then register the URL of its `manifest.json` as a Portal item.

### 1. Build for ArcGIS Enterprise 11.5

Install **Experience Builder Developer Edition 1.17**, copy this widget to:

```text
<experience-builder>/client/your-extensions/widgets/geoPdf/
```

Ensure `pdfjs-dist@3.11.174` is available in the Developer Edition `client` dependencies. In that `client` directory, run:

```powershell
npm run build:prod
```

For **Developer Edition 1.17 and earlier**, the production widget output is under `client/dist-prod/widgets/geoPdf`. **For Developer Edition 1.18 and later**, Esri documents `npm run build:for-download`, with output under `client/dist-download/widgets`. Always use the build procedure for the target Developer Edition version.

Verify that the production output contains `manifest.json`, the runtime widget JavaScript, any generated chunks, and `dist/runtime/assets/pdf.worker.min.js`. The worker copy configuration must be validated against the actual production output; if missing, correct the asset copy/deployment before publishing.

### 2. Host the compiled widget

Deploy the **complete production widget folder** to a web server such as IIS, retaining its generated folder structure. Example:

```text
https://widgets.example.org/geoPdf/manifest.json
https://widgets.example.org/geoPdf/dist/runtime/assets/pdf.worker.min.js
```

The hosting server must:

- Allow **anonymous HTTP access** to the widget's static files (even when the Portal itself requires sign-in).
- Serve content over **HTTPS** using a trusted TLS certificate.
- Permit the Portal origin via **CORS** when hosted on a different origin.
- Serve `.json` as `application/json` and JavaScript/worker assets with suitable MIME types.
- Include any dynamically generated **chunks** or shared assets required by the production build.

Before registering, open the manifest URL in a browser and confirm HTTP 200. Check that the PDF.js worker URL also returns HTTP 200, not a login page or HTML error response.

### 3. Register in Portal

A **Portal administrator** must register the widget:

1. Sign in to **ArcGIS Enterprise Portal 11.5**.
2. Go to **Content → My Content → New item** (the UI may label this **Add item**).
3. Choose **An application → Experience Builder widget**.
4. Enter the publicly reachable HTTPS URL to the hosted **`manifest.json`**, not the GitHub repository URL or the JavaScript bundle URL.
5. Confirm the item title (for example, **GeoPDF**), add tags, and save the item.
6. Share the item with the intended **groups**, **organization**, or **everyone**, as appropriate.
7. Open Experience Builder in the same Portal organization and find the widget under **Insert widget → Custom**.

Registration requires administrator privileges; widget users must have permission to access the registered Portal item. If the widget is used in a public experience, verify anonymous accessibility and appropriate item sharing.

### 4. Configure the published widget URL in Portal

When a custom widget is registered in ArcGIS Enterprise Portal, Experience Builder may resolve `props.context.folderUrl` against its own CDN rather than the external web server hosting the widget. In this situation, PDF.js can attempt to load its worker from an incorrect Portal path and fail with `Setting up fake worker failed`.

Open the **GeoPDF widget settings** in the Portal Experience Builder editor. In **Widget deployment URL (optional)** (shown in Italian as **URL pubblicazione widget (opzionale)**), enter the HTTPS **base folder containing the hosted `manifest.json`**, ending with a slash.

Example deployment:

```text
Manifest: https://widgets.example.org/widget/geopdf/manifest.json
Widget deployment URL: https://widgets.example.org/widget/geopdf/
PDF.js worker: https://widgets.example.org/widget/geopdf/dist/runtime/assets/pdf.worker.min.js
```

Do **not** enter the Portal homepage, Portal item URL, or `manifest.json` file URL in this field. The configured base URL is used only to resolve the PDF.js worker asset; it does not change the Portal widget registration URL.

Leave this field **empty** for local development or whenever Experience Builder correctly supplies the widget folder URL. Save and publish the Experience after changing the setting. Verify in browser DevTools → Network that `pdf.worker.min.js` is requested from the external widget host and returns **HTTP 200**.

### 5. Validate and update

Add a Map widget, bind GeoPDF to it, and test a supported Adobe geospatial PDF. Verify that the overlay is correctly positioned, that visibility and opacity work, and that the browser Network/Console tabs show no worker, CORS, MIME-type, or chunk-loading errors.

To update an already registered widget, replace its hosted production files while keeping the registered manifest URL stable. The Portal item normally does not need to be recreated; clear browser caches or adjust server cache headers if older JavaScript is still served.

**Official Esri documentation:**
- [Add custom widgets to ArcGIS Enterprise](https://doc.arcgis.com/en/experience-builder/11.5/configure-widgets/add-custom-widgets.htm)
- [Experience Builder release versions and compatibility](https://developers.arcgis.com/experience-builder/guide/release-versions/)

## Supported files and limitations

The current implementation targets **Adobe geospatial PDFs** containing `/GPTS` and `/LPTS` metadata. It does not support every format marketed as “GeoPDF”.

- **First page only**: multi-page navigation is not implemented.
- **Georeferencing**: control points are read from the PDF and used to place the rendered image; results depend on the source document's metadata and coordinate system.
- **Rendering resolution**: the page is rendered to an image with a maximum dimension of 2,048 pixels.
- **No server-side upload**: the selected PDF is processed in the browser.
- **No persistent overlay storage**: the imported layer belongs to the current application session.
- PDF documents without supported geospatial metadata cannot be positioned automatically.

## Installation for developers

Copy the widget source directory to the Experience Builder Developer Edition extensions location:

```text
<experience-builder>/client/your-extensions/widgets/geoPdf/
```

From the Experience Builder `client` directory, ensure that the matching PDF.js dependency is available:

```powershell
npm install pdfjs-dist@3.11.174
```

Start Experience Builder:

```powershell
npm start
```

In Experience Builder:

1. Add a **Map** widget to the page.
2. Add the **GeoPDF** widget.
3. Open GeoPDF settings and select the Map widget. For an externally hosted Portal deployment, optionally set **URL pubblicazione widget (opzionale)** to the HTTPS folder containing `manifest.json`.
4. Preview or run the application.
5. Select a supported geospatial PDF and use the visibility and opacity controls.

## PDF.js worker and automatic asset copying

The widget uses **pdfjs-dist 3.11.174** and its standalone `pdf.worker.min.js`. Experience Builder compiles widget modules using SystemJS; the PDF.js webpack worker entry is not suitable for this standalone worker.

Experience Builder Developer Edition **1.13 and later** supports a widget-level `copy-files.json` configuration. This repository uses it to copy the installed PDF.js worker into the widget's runtime assets **during compilation**, including rebuilds:

```json
[
  {
    "from": "../../../node_modules/pdfjs-dist/build/pdf.worker.min.js",
    "to": "dist/runtime/assets/pdf.worker.min.js"
  }
]
```

The paths are relative to the widget root at `client/your-extensions/widgets/geoPdf`. This expects `pdfjs-dist@3.11.174` to be installed in the Experience Builder `client/node_modules` directory.

No PowerShell watcher or manual copying into generated build folders is required. By default, the widget obtains its hosted base URL from Experience Builder's `props.context.folderUrl`. When the optional **widget deployment URL** setting is populated, it overrides that base URL for the PDF.js worker. The worker is loaded from:

```text
<widget-folder-url>/dist/runtime/assets/pdf.worker.min.js
```

This follows Esri's documented approach for widget runtime assets and Web Workers.

**Reference:** [Esri — Copy files to dist folder](https://developers.arcgis.com/experience-builder/guide/copy-files-to-dist-folder/), [Use assets](https://developers.arcgis.com/experience-builder/guide/use-assets/), [Web worker sample](https://developers.arcgis.com/experience-builder/sample-code/widgets/web-worker/).

## Hosting and deployment

Deploy the **complete compiled widget folder**, not just its nested `dist` directory. The relevant output is expected to include:

```text
geoPdf/
├── manifest.json
├── icon.svg
└── dist/
    ├── runtime/
    │   ├── widget.js
    │   └── assets/
    │       └── pdf.worker.min.js
    └── setting/
```

Other generated files may be present; keep the full compiled directory intact. For deployment, use the **production build** supported by the target Experience Builder Developer Edition and check the generated output before publishing.

The worker is loaded relative to the configured widget deployment URL, or by default relative to the widget folder URL supplied by Experience Builder, so the hosting site can use a virtual directory. For example:

```text
https://example.org/widgets/geoPdf/dist/runtime/widget.js
https://example.org/widgets/geoPdf/dist/runtime/assets/pdf.worker.min.js
```

Verify that the worker request returns **HTTP 200** with a JavaScript-compatible content type, then test a representative GeoPDF in the published experience. Static hosting such as IIS does not need a file-copy watcher.

## Troubleshooting

| Issue | Check |
| --- | --- |
| The widget asks for a map | Select an Experience Builder Map widget in GeoPDF settings. |
| PDF.js worker returns 404 | Verify the deployed `dist/runtime/assets/pdf.worker.min.js` path and the requested URL in browser DevTools. In Portal, set **URL pubblicazione widget (opzionale)** to the externally hosted widget folder containing `manifest.json`. |
| `Setting up fake worker failed` and a Portal CDN worker URL | In GeoPDF settings, configure the external HTTPS widget deployment URL; verify the worker is accessible on that host. |
| JavaScript chunk loading fails with a Portal CDN 404 | Rebuild and deploy the complete production output, including any generated chunks; PDF.js is imported statically to avoid its dynamic import chunk. Verify the Network requests. |
| `System is not defined` | Use the standalone PDF.js worker, not a SystemJS-bundled worker. |
| GeoPDF metadata not found | Check that the PDF contains supported Adobe `/GPTS` and `/LPTS` metadata. |
| Worker missing after compilation | Verify `copy-files.json`, the installed PDF.js package, and the compiler output. |
| Local development works but hosted deployment fails | Check runtime script URLs, worker URL, HTTPS, content types, and browser console errors. |

## Contributing

Bug reports, compatibility findings, reproducible GeoPDF samples, and pull requests are welcome. When reporting an issue, include the Experience Builder version, browser, relevant console errors, and whether the problem occurs in local development or a hosted deployment.

## License

See the repository's license information and the licenses of third-party dependencies.
