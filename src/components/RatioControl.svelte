<script lang="ts">
  import { roleLabel } from '../domain/role-assignment'
  import type { RoleName } from '../types/project'

  let {
    name,
    ratio,
    role,
    onchange,
  }: { name: string; ratio: number; role: RoleName; onchange: (value: number) => void } = $props()
</script>

<div class="ratio">
  <div class="head">
    <strong>{name}</strong>
    <span class="tabular">{ratio}% · {roleLabel(role, ratio)}</span>
  </div>
  <div class="controls">
    <input type="range" min="1" max="100" value={ratio} aria-valuetext="{ratio}퍼센트" oninput={(e) => onchange(Number(e.currentTarget.value))} />
    <input class="text-input tabular" type="number" min="1" max="100" value={ratio} aria-label="{name} 비율" onchange={(e) => onchange(Number(e.currentTarget.value))} />
  </div>
</div>

<style>
  .head, .controls { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .controls { margin-top: 8px; }
  input[type='range'] { flex: 1; }
  input[type='number'] { width: 84px; }
  .ratio { margin-bottom: 16px; }
</style>
