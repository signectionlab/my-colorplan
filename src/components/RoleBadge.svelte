<script lang="ts">
  import { roleLabel } from '../domain/role-assignment'
  import type { RoleName } from '../types/project'
  let { role, ratio }: { role: RoleName; ratio: number } = $props()
</script>

<span class="chip">{roleLabel(role, ratio)}</span>
