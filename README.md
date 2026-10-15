# GeoPDF for ArcGIS Experience Builder

**GeoPDF** is an open-source custom widget for **ArcGIS Experience Builder Developer Edition 1.17**. It allows users to load a geospatial PDF from their computer and visualize its georeferenced first page as an overlay on an interactive map.

The widget uses PDF.js for browser-side PDF rendering and the ArcGIS Maps SDK for JavaScript to display the resulting image as a `MediaLayer`.

> **Project status:** Development release. Validate supported GeoPDF files and the hosting configuration before production use.

## Features

- Load a local geospatial PDF through the browser.
- Connect to an Experience Builder Map widget.
- Render the first page of a PDF using PDF.js, with configurable maximum image dimensions of 2048, 4096, or 8192 pixels (4096 by default).
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

Open the **GeoPDF widget settings** in the Portal Experience Builder editor. In **Widget deployment URL (optional)**, enter the HTTPS **base folder containing the hosted `manifest.json`**, ending with a slash.

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

## Widget settings: deployment URL and PDF resolution

GeoPDF exposes two configurable properties in the **Experience Builder widget settings**:

| Property | Default | Purpose |
| --- | --- | --- |
| **Widget deployment URL (optional)** (`widgetBaseUrl`) | Empty | Base HTTPS URL of the deployed widget folder, used to locate the PDF.js worker. Particularly important when the widget is externally hosted and registered in **ArcGIS Enterprise Portal**. |
| **PDF rendering resolution** (`renderMaxSize`) | **4096 px** | Maximum width or height of the raster image produced from the first PDF page. Choose **2048**, **4096**, or **8192 px**. |

### Widget deployment URL

When the widget is registered in Portal but hosted externally (for example, on IIS), set **Widget deployment URL (optional)** to the HTTPS folder containing `manifest.json`, **not** the manifest URL itself:

```text
https://widgets.example.org/widget/geopdf/
```

The widget then loads its PDF.js worker from `https://widgets.example.org/widget/geopdf/dist/runtime/assets/pdf.worker.min.js`. This avoids incorrect worker URLs pointing to Portal's own CDN. For local development, or if Experience Builder already resolves the correct widget folder, leave the property empty. This property affects **worker asset resolution**, not the Portal registration or PDF file location.

### PDF rendering resolution and performance

| Maximum dimension | Trade-off | Suggested use |
| --- | --- | --- |
| **2048 px** | Fastest rendering and lowest memory consumption, but less detail when zooming. | Large or complex PDFs, lower-powered clients, initial troubleshooting. |
| **4096 px (default)** | Balanced detail, processing time, and memory usage. | Recommended starting point. |
| **8192 px** | Sharper thin lines and small text, but potentially much slower and more memory-intensive. | Detailed maps on sufficiently capable client devices. |

The selected value is the **maximum image dimension**, not a DPI value or a fixed pixel count for both sides: the PDF page aspect ratio is preserved. Rendering is performed **in the user's browser** using PDF.js, so PDF page size, vector complexity, image content, device RAM, browser canvas limits, and GPU resources can all affect loading time and stability. An 8192 × 8192 RGBA canvas alone requires approximately **256 MiB** of raw pixel storage, before PDF.js, encoded images, graphics textures, and other allocations; real peak usage can be substantially higher.

A larger setting can improve detail, but it **does not preserve the original PDF vectors**: the current implementation displays a single georeferenced raster image. Zooming beyond its effective resolution will still produce pixelation or blur. If 8192 px is insufficient, a future **zoom-dependent tiled rendering** approach would be needed to render smaller regions at appropriate detail levels, with additional implementation complexity for tiling, caching, and map synchronization.

If a PDF loads slowly, the browser becomes unresponsive, or canvas rendering fails, try **4096 px or 2048 px**. Changes to resolution apply when the PDF is **loaded again**; an existing overlay is not automatically re-rendered.

## Supported files and limitations

The current implementation targets **Adobe geospatial PDFs** containing `/GPTS` and `/LPTS` metadata. It does not support every format marketed as “GeoPDF”.

- **First page only**: multi-page navigation is not implemented.
- **Georeferencing**: control points are read from the PDF and used to place the rendered image; results depend on the source document's metadata and coordinate system.
- **Rendering resolution**: configurable maximum dimension of 2,048, 4,096, or 8,192 pixels; 4,096 is the default. Rendering may upscale the PDF page beyond its native PDF.js viewport dimensions. Higher settings consume significantly more browser memory and may exceed canvas or GPU limits; reduce the setting if rendering fails. This remains a single raster overlay, not vector rendering or zoom-dependent tiling.
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
3. Open GeoPDF settings, select the Map widget, and choose the PDF rendering resolution (2048, 4096, or 8192 px). For an externally hosted Portal deployment, optionally set **Widget deployment URL (optional)** to the HTTPS folder containing `manifest.json`.
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

The `copy-files.json` rule is intended to include the PDF.js worker during the Experience Builder build; verify the resulting asset in the compiled output. The PowerShell code fences in this README simply show commands that can be run in a terminal on Windows; **PowerShell is not a runtime dependency of the widget**. By default, the widget obtains its hosted base URL from Experience Builder's `props.context.folderUrl`. When the optional **widget deployment URL** setting is populated, it overrides that base URL for the PDF.js worker. The worker is loaded from:

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

Verify that the worker request returns **HTTP 200** with a JavaScript-compatible content type, then test a representative GeoPDF in the published experience. Static hosting such as IIS serves the compiled assets directly. The PDF.js worker must be included in the deployed output.

## Troubleshooting

| Issue | Check |
| --- | --- |
| The widget asks for a map | Select an Experience Builder Map widget in GeoPDF settings. |
| PDF.js worker returns 404 | Verify the deployed `dist/runtime/assets/pdf.worker.min.js` path and the requested URL in browser DevTools. In Portal, set **Widget deployment URL (optional)** to the externally hosted widget folder containing `manifest.json`. |
| `Setting up fake worker failed` and a Portal CDN worker URL | In GeoPDF settings, configure the external HTTPS widget deployment URL; verify the worker is accessible on that host. |
| JavaScript chunk loading fails with a Portal CDN 404 | Rebuild and deploy the complete production output, including any generated chunks; PDF.js is imported statically to avoid its dynamic import chunk. Verify the Network requests. |
| `System is not defined` | Use the standalone PDF.js worker, not a SystemJS-bundled worker. |
| GeoPDF metadata not found | Check that the PDF contains supported Adobe `/GPTS` and `/LPTS` metadata. |
| Worker missing after compilation | Verify `copy-files.json`, the installed PDF.js package, and the compiler output. |
| PDF is blurry when zooming | Increase **PDF rendering resolution** to 4096 or 8192 px, then reload the PDF. A single raster overlay cannot retain vector sharpness at arbitrary zoom levels. |
| Rendering is slow, memory usage is high, or the canvas fails | Lower **PDF rendering resolution** to 4096 or 2048 px and reload. Very large or complex PDFs may exceed browser/device limits. |
| Local development works but hosted deployment fails | Check runtime script URLs, worker URL, HTTPS, content types, and browser console errors. |

## Roadmap / TODO

- [ ] **Zoom-dependent tiled GeoPDF rendering**: investigate replacing or complementing the current single-raster overlay with on-demand rendering of PDF regions at resolutions appropriate to the current map zoom. The goal is to improve the legibility of fine lines and labels at high zoom levels without rendering the entire PDF at 8192 px or more upfront.
  - Determine how to georeference and align tiles with the ArcGIS map.
  - Render only visible regions and update tiles when the map extent or zoom changes.
  - Evaluate tile caching, memory usage, cancellation of obsolete rendering tasks, and client-side performance.
  - Validate compatibility with ArcGIS Experience Builder and supported Adobe geospatial PDFs.

  **Status:** Planned investigation; tiled rendering is not currently implemented.

## Contributing

Bug reports, compatibility findings, reproducible GeoPDF samples, and pull requests are welcome. When reporting an issue, include the Experience Builder version, browser, relevant console errors, and whether the problem occurs in local development or a hosted deployment.

## License and third-party notices

Copyright 2026 NicoGIS.

The GeoPDF widget source code is licensed under the **Apache License, Version 2.0**. See [LICENSE.txt](LICENSE.txt) for the full terms and [NOTICE](NOTICE) for project attribution and third-party information.

**Mozilla PDF.js** (`pdfjs-dist@3.11.174`), used to render PDFs in the browser, is distributed under the **Apache License, Version 2.0** (not MIT). PDF.js and any bundled dependencies retain their own copyright and license notices. When redistributing a compiled widget that includes the PDF.js worker, preserve the applicable third-party license and notice information.

**ArcGIS Experience Builder** and the **ArcGIS Maps SDK for JavaScript** are Esri products governed by their own terms. The Apache License of this repository does not change the license terms of those products.
