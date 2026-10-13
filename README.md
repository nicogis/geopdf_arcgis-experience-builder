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
3. Open GeoPDF settings and select the Map widget.
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

No PowerShell watcher or manual copying into generated build folders is required. The widget obtains its hosted base URL from Experience Builder's `props.context.folderUrl` and loads the worker from:

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

The worker is loaded relative to the widget's URL supplied by Experience Builder, so the hosting site can use a virtual directory. For example:

```text
https://example.org/widgets/geoPdf/dist/runtime/widget.js
https://example.org/widgets/geoPdf/dist/runtime/assets/pdf.worker.min.js
```

Verify that the worker request returns **HTTP 200** with a JavaScript-compatible content type, then test a representative GeoPDF in the published experience. Static hosting such as IIS does not need a file-copy watcher.

## Troubleshooting

| Issue | Check |
| --- | --- |
| The widget asks for a map | Select an Experience Builder Map widget in GeoPDF settings. |
| PDF.js worker returns 404 | Verify the deployed `dist/runtime/assets/pdf.worker.min.js` path and the requested URL in browser DevTools. |
| `System is not defined` | Use the standalone PDF.js worker, not a SystemJS-bundled worker. |
| GeoPDF metadata not found | Check that the PDF contains supported Adobe `/GPTS` and `/LPTS` metadata. |
| Worker missing after compilation | Verify `copy-files.json`, the installed PDF.js package, and the compiler output. |
| Local development works but hosted deployment fails | Check runtime script URLs, worker URL, HTTPS, content types, and browser console errors. |

## Contributing

Bug reports, compatibility findings, reproducible GeoPDF samples, and pull requests are welcome. When reporting an issue, include the Experience Builder version, browser, relevant console errors, and whether the problem occurs in local development or a hosted deployment.

## License

See the repository's license information and the licenses of third-party dependencies.
