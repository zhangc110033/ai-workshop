# PR Review Rules

## Red Flags

| Name | Description | Pattern | Severity |
|------|-------------|---------|----------|
| Sensitive file change | Changes to security-sensitive files | \.env\|\.secret\|credentials\|\.pem\|\.key | high |
| Large diff | PR diff exceeds 1000 lines | LARGE_DIFF_1000 | medium |
| TODO/FIXME left | Unresolved TODO or FIXME comments added | TODO\|FIXME\|HACK\|XXX | low |
| Console.log left | Debug console statements left in code | console\.log\|console\.debug | low |
| Hardcoded secret | Potential hardcoded secrets or tokens | password\s*=\|api_key\s*=\|secret\s*=\|token\s*= | high |
| Binary file added | Binary files committed to repo | \.exe\|\.dll\|\.so\|\.dylib\|\.bin | medium |
| Package lock missing | Dependencies changed without lock file update | package\.json | medium |
