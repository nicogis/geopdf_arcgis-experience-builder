import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import MediaLayer from 'esri/layers/MediaLayer'
import ImageElement from 'esri/layers/support/ImageElement'
import Point from 'esri/geometry/Point'
import Extent from 'esri/geometry/Extent'

type PixelPoint = { x: number, y: number }
type GeoPoint = { lon: number, lat: number }

interface GeoPdfControlPoint {
  sourcePoint: PixelPoint
  mapPoint: GeoPoint
}

interface GeoPdfRenderResult {
  imageDataUrl: string
  width: number
  height: number
}

interface GeoPdfGeoreferenceResult {
  controlPoints: GeoPdfControlPoint[]
  extent: __esri.Extent
}

export interface LoadedGeoPdf {
  layer: __esri.MediaLayer
  extent: __esri.Extent
}

const numberPattern = /-?\d*\.?\d+(?:[eE][+-]?\d+)?/g

const parseNumberArray = (text: string): number[] => {
  const matches = text.match(numberPattern) ?? []
  return matches.map(value => Number(value)).filter(value => Number.isFinite(value))
}

const parsePairs = (values: number[]): Array<{ x: number, y: number }> => {
  const pairs: Array<{ x: number, y: number }> = []
  for (let i = 0; i + 1 < values.length; i += 2) {
    pairs.push({ x: values[i], y: values[i + 1] })
  }
  return pairs
}

const getArrayFromPdfText = (pdfText: string, key: 'GPTS' | 'LPTS'): number[] => {
  const regex = new RegExp(`/${key}\\s*\\[([^\\]]+)\\]`, 'm')
  const match = pdfText.match(regex)
  if (!match?.[1]) return []
  return parseNumberArray(match[1])
}

const createExtentFromGeoPoints = (points: GeoPoint[]): __esri.Extent => {
  const xs = points.map(p => p.lon)
  const ys = points.map(p => p.lat)

  return new Extent({
    xmin: Math.min(...xs),
    ymin: Math.min(...ys),
    xmax: Math.max(...xs),
    ymax: Math.max(...ys),
    spatialReference: { wkid: 4326 }
  })
}

const clamp01 = (value: number): number => {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

const extractGeoreference = (pdfText: string, width: number, height: number): GeoPdfGeoreferenceResult => {
  const gptsRaw = getArrayFromPdfText(pdfText, 'GPTS')
  const lptsRaw = getArrayFromPdfText(pdfText, 'LPTS')

  if (gptsRaw.length < 6 || lptsRaw.length < 6) {
    throw new Error('GeoPDF metadata not found. Expected GPTS/LPTS arrays in Adobe geospatial PDF.')
  }

  if (gptsRaw.length !== lptsRaw.length) {
    throw new Error('Invalid GeoPDF metadata. GPTS/LPTS arrays have different lengths.')
  }

  const lptPairs = parsePairs(lptsRaw)
  const gptPairs = parsePairs(gptsRaw)

  const pairedCount = Math.min(4, lptPairs.length, gptPairs.length)
  if (pairedCount < 3) {
    throw new Error('GeoPDF metadata has insufficient control points.')
  }

  const controlPoints: GeoPdfControlPoint[] = []
  const geoPoints: GeoPoint[] = []

  for (let i = 0; i < pairedCount; i++) {
    const lp = lptPairs[i]
    const gp = gptPairs[i]

    const sourcePoint = {
      x: clamp01(lp.x) * width,
      y: (1 - clamp01(lp.y)) * height
    }

    // Adobe GeoPDF GPTS is commonly encoded as [lat, lon] pairs.
    const mapPoint = {
      lon: gp.y,
      lat: gp.x
    }

    controlPoints.push({ sourcePoint, mapPoint })
    geoPoints.push(mapPoint)
  }

  return {
    controlPoints,
    extent: createExtentFromGeoPoints(geoPoints)
  }
}

const renderFirstPageToImage = async (bytes: Uint8Array, workerUrl: string, maxSize: number): Promise<GeoPdfRenderResult> => {
  // Experience Builder bundles widget modules as SystemJS modules. The PDF.js
  // webpack entry emits a System.register worker chunk, which cannot execute in
  // a standalone Web Worker ("System is not defined"). Load the original PDF.js
  // worker as a static asset instead, matching pdfjs-dist 3.11.174.
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const loadingTask = pdfjs.getDocument({
    data: bytes
  })

  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const baseViewport = page.getViewport({ scale: 1 })
  const scale = maxSize / Math.max(baseViewport.width, baseViewport.height)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(viewport.width))
  canvas.height = Math.max(1, Math.round(viewport.height))

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Unable to create canvas context for PDF rendering.')
  }

  await page.render({
    canvasContext: context,
    viewport
  }).promise

  const imageDataUrl = canvas.toDataURL('image/png')
  if (imageDataUrl === 'data:,') throw new Error('Canvas limit exceeded. Select a lower resolution.')
  return {
    imageDataUrl,
    width: canvas.width,
    height: canvas.height
  }
}

export const loadGeoPdfAsMediaLayer = async (file: File, workerUrl: string, maxSize: number = 4096): Promise<LoadedGeoPdf> => {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const pdfText = new TextDecoder('latin1').decode(bytes)

  if (![2048, 4096, 8192].includes(maxSize)) throw new Error('Unsupported rendering resolution.')
  const renderResult = await renderFirstPageToImage(bytes, workerUrl, maxSize)
  const georefResult = extractGeoreference(pdfText, renderResult.width, renderResult.height)

  const controlPoints = georefResult.controlPoints.map(point => ({
    sourcePoint: point.sourcePoint,
    mapPoint: new Point({
      x: point.mapPoint.lon,
      y: point.mapPoint.lat,
      spatialReference: { wkid: 4326 }
    })
  }))

  const imageElement = new ImageElement({
    image: renderResult.imageDataUrl,
    georeference: {
      type: 'control-points',
      width: renderResult.width,
      height: renderResult.height,
      controlPoints
    },
    opacity: 1
  })

  const layer = new MediaLayer({
    title: `GeoPDF: ${file.name}`,
    source: [imageElement],
    opacity: 1,
    visible: true
  })

  return {
    layer,
    extent: georefResult.extent
  }
}