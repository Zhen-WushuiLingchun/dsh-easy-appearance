[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)]
  [string]$HarnessPath
)

$ErrorActionPreference = 'Stop'

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SourcePackage = Join-Path $RepositoryRoot 'packages\client\ui-appearance'
$IntegrationPatch = Join-Path $RepositoryRoot 'integration\deepseek-harness-0.1.0-rc.5.patch'
$ResolvedHarness = (Resolve-Path -LiteralPath $HarnessPath).Path
$TargetPackage = Join-Path $ResolvedHarness 'packages\client\ui-appearance'

if (-not (Test-Path -LiteralPath (Join-Path $ResolvedHarness 'package.json'))) {
  throw "The target does not look like a DeepSeek Harness repository: $ResolvedHarness"
}
if (-not (Test-Path -LiteralPath (Join-Path $ResolvedHarness '.git'))) {
  throw "The target must be a Git worktree: $ResolvedHarness"
}
if (Test-Path -LiteralPath $TargetPackage) {
  throw "Refusing to overwrite the existing package: $TargetPackage"
}

Push-Location $ResolvedHarness
try {
  & git apply --check -- $IntegrationPatch
  if ($LASTEXITCODE -ne 0) {
    throw 'The integration patch does not apply cleanly. Use the matching DSH revision or integrate the documented hunks manually.'
  }

  if ($PSCmdlet.ShouldProcess($ResolvedHarness, 'Install ui-appearance package and integration patch')) {
    Copy-Item -LiteralPath $SourcePackage -Destination $TargetPackage -Recurse
    & git apply -- $IntegrationPatch
    if ($LASTEXITCODE -ne 0) {
      throw 'git apply failed after its preflight check. Remove the copied package directory before retrying.'
    }
  }
}
finally {
  Pop-Location
}

Write-Host 'Installed source and integration changes.'
Write-Host 'Next: pnpm install'
Write-Host 'Then: pnpm --filter @deepseek-ai/dsh-client-ui-appearance bundle'
Write-Host 'Then: pnpm run build:web'
