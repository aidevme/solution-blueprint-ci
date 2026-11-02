<#
.SYNOPSIS
  Checks that every skill under agent-src/skills has a CHANGELOG.md and that a changed skill also has a
  changelog entry. With -Create, writes a missing CHANGELOG.md from the template in .templates/CHANGELOG_STYLE.md.

  Checks, per skill folder (any folder under agent-src/skills containing SKILL.md):
    - MISSING   : the skill has no CHANGELOG.md.
    - NO ENTRY  : files in the skill changed (working tree, staged or untracked; plus commits since -Base when
                  given) but CHANGELOG.md didn't.
    - NO RELEASE: CHANGELOG.md has uncommitted changes but no release heading for today (## YYYY-MM-DD).
    - TABLE     : SKILL.md still has a "## Changelog" section; CHANGELOG.md is the only history.

  -Create writes a missing CHANGELOG.md with today's release and one Added entry: "The skill itself" for a skill
  with no commits yet, or "This changelog" for an existing skill (backfill the older history from git, as the
  style guide describes). The entry for a change to an existing skill is written by the author or agent, never
  generated: only they know what changed for the reader.

  Exits 1 when any problem remains, so it can gate a commit or CI.

.PARAMETER Create
  Create missing CHANGELOG.md files from the template.

.PARAMETER Base
  A git ref (for example origin/dev). Commits between it and HEAD also count as changes.

.EXAMPLE
  pwsh -File agent-src/sync/check-changelogs.ps1
.EXAMPLE
  pwsh -File agent-src/sync/check-changelogs.ps1 -Create
.EXAMPLE
  pwsh -File agent-src/sync/check-changelogs.ps1 -Base origin/dev
#>
[CmdletBinding()]
param(
    [switch]$Create,
    [string]$Base
)

$ErrorActionPreference = 'Stop'

$syncDir   = $PSScriptRoot
$agentSrc  = Split-Path -Parent $syncDir
$repoRoot  = Split-Path -Parent $agentSrc
$skillsSrc = Join-Path $agentSrc 'skills'
$today     = Get-Date -Format 'yyyy-MM-dd'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-Description([string]$skillMd) {
    # Reads the frontmatter description (block scalar, folded or single line) and returns its first sentence.
    $lines = Get-Content -LiteralPath $skillMd
    $text = ''
    $inDesc = $false
    for ($i = 1; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -eq '---') { break }
        if ($line -match '^description:\s*(.*)$') {
            $rest = $Matches[1].Trim()
            if ($rest -and $rest -notmatch '^[|>][-+]?$') { $text = $rest.Trim('"', "'"); break }
            $inDesc = $true
            continue
        }
        if ($inDesc) {
            if ($line -match '^\S') { break }
            $text += ' ' + $line.Trim()
        }
    }
    $text = ($text -replace '\s+', ' ').Trim()
    if ($text -match '^(.+?[.!?])(\s|$)') { return $Matches[1] }
    return $text
}

function Get-RelPath([string]$path) {
    return ($path.Substring($repoRoot.Length).TrimStart('\', '/') -replace '\\', '/')
}

function New-Changelog([string]$folder, [string]$name, [bool]$hasHistory) {
    $rel = Get-RelPath $folder
    $summary = Get-Description (Join-Path $folder 'SKILL.md')
    if ($hasHistory) {
        $entry = "- **This changelog.** The skill's history in one file, from its commits."
    } else {
        $entry = "- **The skill itself.** $summary"
    }
    $content = @"
# Changelog

<!-- cspell:ignore aidevme evals Evals -->
<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to the **$name** skill. Newest first. Each entry says what changed and why it
matters to you; the commit has the detail. The source is ``$rel/``,
synced to ``.claude/skills/`` and ``.github/skills/``.

## $today

### Added

$entry

"@
    [System.IO.File]::WriteAllText((Join-Path $folder 'CHANGELOG.md'), ($content -replace "`r`n", "`n"), $utf8NoBom)
}

Push-Location $repoRoot
try {
    $problems = 0
    $created = 0
    $skills = Get-ChildItem -Path $skillsSrc -Recurse -Filter 'SKILL.md' -File | ForEach-Object { $_.Directory }
    foreach ($skill in $skills) {
        $rel = Get-RelPath $skill.FullName
        $changelog = Join-Path $skill.FullName 'CHANGELOG.md'
        $hasHistory = [bool](git log -1 --format=%h -- $rel 2>$null)

        if (-not (Test-Path $changelog)) {
            if ($Create) {
                New-Changelog $skill.FullName $skill.Name $hasHistory
                $kind = if ($hasHistory) { 'existing skill: backfill the older history from git' } else { 'new skill' }
                Write-Host "  CREATED   : $rel/CHANGELOG.md ($kind; review the entry)" -ForegroundColor Green
                $created++
            } else {
                Write-Host "  MISSING   : $rel has no CHANGELOG.md (run with -Create)" -ForegroundColor Yellow
                $problems++
                continue
            }
        }

        if (Select-String -LiteralPath (Join-Path $skill.FullName 'SKILL.md') -Pattern '^## Changelog\s*$' -Quiet) {
            Write-Host "  TABLE     : $rel/SKILL.md still has a '## Changelog' section; move it to CHANGELOG.md" -ForegroundColor Yellow
            $problems++
        }

        # Changed files in the skill: working tree, staged and untracked, plus commits since -Base.
        $changed = @(git status --porcelain --untracked-files=all -- $rel 2>$null | ForEach-Object { ($_.Substring(3) -split ' -> ')[-1].Trim('"') })
        if ($Base) { $changed += @(git diff --name-only "$Base...HEAD" -- $rel 2>$null) }
        $changed = @($changed | Where-Object { $_ } | Sort-Object -Unique)
        if ($changed.Count -eq 0) { continue }

        $changelogRel = "$rel/CHANGELOG.md"
        $others = @($changed | Where-Object { $_ -ne $changelogRel })
        if ($others.Count -gt 0 -and $changed -notcontains $changelogRel) {
            Write-Host "  NO ENTRY  : $rel changed ($($others.Count) file(s)) but CHANGELOG.md didn't" -ForegroundColor Yellow
            $problems++
            continue
        }
        $pending = @(git status --porcelain --untracked-files=all -- $changelogRel 2>$null)
        if ($pending.Count -gt 0 -and -not (Select-String -LiteralPath $changelog -Pattern "^## (\[[^\]]+\] - )?$today\b" -Quiet)) {
            Write-Host "  NO RELEASE: $changelogRel changed but has no '## $today' release" -ForegroundColor Yellow
            $problems++
        }
    }

    if ($problems -gt 0) {
        Write-Host "Changelog check: $problems problem(s). Add the entries following .templates/CHANGELOG_STYLE.md." -ForegroundColor Yellow
        exit 1
    }
    $msg = "Changelog check: OK ($($skills.Count) skill(s)"
    if ($created) { $msg += ", $created created" }
    Write-Host "$msg)." -ForegroundColor Green
    exit 0
} finally {
    Pop-Location
}
