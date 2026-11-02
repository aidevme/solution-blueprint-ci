<#
.SYNOPSIS
    Render a draw.io XML file to SVG/PNG/PDF using the draw.io desktop CLI.

.DESCRIPTION
    Wraps "draw.io.exe -x" with sensible HSO defaults: SVG, 10px border,
    diagram XML embedded in SVG/PNG/PDF (the export stays editable in draw.io),
    cropped PDF. Input can be a single .drawio file or a folder.
    -RouteEdges first reroutes connectors around shapes (libavoid).

    Requires draw.io Desktop installed. Default install location:
        C:\Program Files\draw.io\draw.io.exe

.PARAMETER InputPath
    Path to a .drawio file or a folder of .drawio files.

.PARAMETER Format
    Output format: svg (default), png, pdf, jpg.

.PARAMETER OutputPath
    Optional. Defaults to the input path with the new extension.

.PARAMETER Transparent
    PNG only. Produces a transparent background.

.PARAMETER Width
    Fit output to this width in pixels (preserves aspect ratio).

.PARAMETER Height
    Fit output to this height in pixels (preserves aspect ratio).

.PARAMETER Scale
    Scale factor (default 1.0).

.PARAMETER AllPages
    PDF only. Export all pages.

.PARAMETER RouteEdges
    Before exporting, reroute connectors around shapes with draw.io's libavoid
    router ("--layout libavoid"). Shapes keep their positions; edges get
    waypoints. REWRITES the input .drawio in place (uncompressed XML), so commit
    the rerouted file. Single file only. Needs a draw.io Desktop build that
    supports --layout.

.PARAMETER NoEmbedDiagram
    Do not embed the diagram XML (--embed-diagram) in SVG/PNG/PDF output.
    Embedding is on by default so an exported file reopens as an editable
    diagram. JPG never embeds.

.PARAMETER AdaptiveColors
    SVG only. Keep draw.io's dark-mode colours. By default the SVG root is set
    to "color-scheme: light", so its light-dark() colours always resolve to the
    light palette and the diagram stays white on a dark page or a dark-mode
    WordPress admin.

.PARAMETER DrawioExe
    Override path to draw.io.exe.

.EXAMPLE
    .\Render-DrawioDiagram.ps1 -InputPath .\diagrams\erd.drawio

.EXAMPLE
    .\Render-DrawioDiagram.ps1 -InputPath .\diagrams\architecture.drawio -RouteEdges
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [ValidateSet('svg', 'png', 'pdf', 'jpg')]
    [string]$Format = 'svg',

    [string]$OutputPath,

    [switch]$Transparent,

    [int]$Width,

    [int]$Height,

    [double]$Scale = 1.0,

    [switch]$AllPages,

    [switch]$EmbedFonts,

    [switch]$RouteEdges,

    [switch]$NoEmbedDiagram,

    [switch]$AdaptiveColors,

    [string]$DrawioExe = 'C:\Program Files\draw.io\draw.io.exe'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $DrawioExe)) {
    throw "draw.io.exe not found at: $DrawioExe. Install draw.io Desktop from https://github.com/jgraph/drawio-desktop/releases or pass -DrawioExe."
}

$resolved = Resolve-Path -LiteralPath $InputPath -ErrorAction Stop
$inputFull = $resolved.Path

if ($RouteEdges) {
    if (Test-Path $inputFull -PathType Container) {
        throw "-RouteEdges needs a single .drawio file, not a folder: $inputFull"
    }
    # libavoid keeps every vertex where it is and reroutes only the edges.
    # --uncompressed keeps the rewritten source diff-friendly.
    $routeArgs = @(
        '--export',
        '--format', 'xml',
        '--uncompressed',
        '--layout', 'libavoid',
        '--output', $inputFull,
        $inputFull
    )
    Write-Host "Routing edges (libavoid): $inputFull" -ForegroundColor Cyan
    Write-Verbose ("Command: `"$DrawioExe`" " + ($routeArgs -join ' '))
    $preRoute = (Get-Item $inputFull).LastWriteTime
    & $DrawioExe @routeArgs | Out-Null
    Start-Sleep -Milliseconds 500
    if ((Get-Item $inputFull).LastWriteTime -le $preRoute) {
        throw "draw.io edge routing failed: $inputFull was not rewritten. '--layout libavoid' needs a recent draw.io Desktop; update it, or render without -RouteEdges."
    }
}

if (-not $OutputPath) {
    if (Test-Path $inputFull -PathType Container) {
        $OutputPath = $inputFull
    }
    else {
        $OutputPath = [System.IO.Path]::ChangeExtension($inputFull, ".$Format")
    }
}

$args = @(
    '--export',
    '--format', $Format,
    '--output', $OutputPath,
    '--border', '10',
    '--scale', ([string]::Format([System.Globalization.CultureInfo]::InvariantCulture, '{0}', $Scale))
)

if ($Format -eq 'svg') {
    # Fonts are NOT embedded by default — keeps SVG small (~15KB vs ~400KB) and
    # Segoe UI falls back gracefully. Pass -EmbedFonts to embed for offline/print use.
    $embed = if ($EmbedFonts) { 'true' } else { 'false' }
    $args += @('--embed-svg-fonts', $embed)
}

if (-not $NoEmbedDiagram -and $Format -ne 'jpg') {
    # The exported file carries the diagram XML and reopens as an editable diagram.
    $args += '--embed-diagram'
}

if ($Transparent -and $Format -eq 'png') {
    $args += '--transparent'
}

if ($Width) { $args += @('--width', "$Width") }
if ($Height) { $args += @('--height', "$Height") }
if ($AllPages -and $Format -eq 'pdf') { $args += '--all-pages' }
if ($Format -eq 'pdf') { $args += '--crop' }

$args += $inputFull

Write-Host "Rendering: $inputFull -> $OutputPath ($Format)" -ForegroundColor Cyan
Write-Verbose ("Command: `"$DrawioExe`" " + ($args -join ' '))

# Capture pre-existing mtime (so we can tell whether this run actually wrote the file)
$preMtime = if (Test-Path $OutputPath) { (Get-Item $OutputPath).LastWriteTime } else { [DateTime]::MinValue }

& $DrawioExe @args | Out-Null
# NOTE: draw.io.exe is an Electron GUI app on Windows and frequently detaches from
# the console, leaving $LASTEXITCODE empty even on success. We therefore verify
# success by checking that the output file exists AND was updated by this run.

Start-Sleep -Milliseconds 500  # allow filesystem flush

if (-not (Test-Path $OutputPath)) {
    throw "draw.io export failed: output file not produced at $OutputPath"
}

$item = Get-Item $OutputPath
if ($item.LastWriteTime -le $preMtime) {
    throw "draw.io export failed: output file at $OutputPath was not updated (stale from $($item.LastWriteTime))"
}

if ($Format -eq 'svg' -and -not $AdaptiveColors -and (Test-Path $OutputPath -PathType Leaf)) {
    # draw.io writes every colour as light-dark(light, dark) under "color-scheme: light dark",
    # so a dark-mode viewer turns the diagram black. Pin the light palette.
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    $svg = [System.IO.File]::ReadAllText($OutputPath, $utf8)
    $pinned = $svg.Replace('color-scheme: light dark;', 'color-scheme: light;')
    if ($pinned -ne $svg) {
        [System.IO.File]::WriteAllText($OutputPath, $pinned, $utf8)
    }
    $item = Get-Item $OutputPath
}

Write-Host "OK  $OutputPath  ($($item.Length) bytes)" -ForegroundColor Green
