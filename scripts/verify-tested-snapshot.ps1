[CmdletBinding()]
param(
  [string]$ReferencePath
)

$ErrorActionPreference = 'Stop'

function Get-PackageTreeDigest {
  param([Parameter(Mandatory = $true)][string]$Root)

  $ResolvedRoot = (Resolve-Path -LiteralPath $Root).Path
  $Entries = Get-ChildItem -LiteralPath $ResolvedRoot -Recurse -File |
    Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' } |
    ForEach-Object {
      $Relative = $_.FullName.Substring($ResolvedRoot.Length).TrimStart('\', '/').Replace('\', '/')
      $Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
      "$Relative`t$Hash"
    } |
    Sort-Object

  $Payload = [string]::Join("`n", $Entries)
  $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Payload)
  $DigestBytes = [System.Security.Cryptography.SHA256]::HashData($Bytes)
  $Digest = [Convert]::ToHexString($DigestBytes).ToLowerInvariant()
  return [pscustomobject]@{ Files = $Entries.Count; Sha256 = $Digest }
}

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$PublishedPackage = Join-Path $RepositoryRoot 'packages\client\ui-appearance'
$MetadataPath = Join-Path $RepositoryRoot 'integration\tested-snapshot.json'
$Expected = Get-Content -Raw -LiteralPath $MetadataPath | ConvertFrom-Json
$Actual = Get-PackageTreeDigest -Root $PublishedPackage

if ($Actual.Files -ne $Expected.files -or $Actual.Sha256 -ne $Expected.sha256) {
  throw "Published package digest mismatch. Expected $($Expected.files) files / $($Expected.sha256), got $($Actual.Files) files / $($Actual.Sha256)."
}

Write-Host "Published package snapshot: OK ($($Actual.Files) files, $($Actual.Sha256))"

if ($ReferencePath -ne '') {
  $Reference = Get-PackageTreeDigest -Root $ReferencePath
  if ($Reference.Files -ne $Actual.Files -or $Reference.Sha256 -ne $Actual.Sha256) {
    throw "Reference package differs. Published: $($Actual.Files) / $($Actual.Sha256); reference: $($Reference.Files) / $($Reference.Sha256)."
  }
  Write-Host "Reference package matches byte-for-byte: $((Resolve-Path -LiteralPath $ReferencePath).Path)"
}
