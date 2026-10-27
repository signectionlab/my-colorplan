<script lang="ts">
  import { APP_COPYRIGHT } from '../constants/copyright'
</script>

<small class="app-copyright">{APP_COPYRIGHT}</small>

<style>
  .app-copyright {
    display: block;
    font-size: 11px;
    line-height: 1.3;
    letter-spacing: 0.02em;
    color: #9a9eb5;
  }
  :global(.app-footer) .app-copyright {
    color: #9a9eb5;
  }
  :global(.guide) .app-copyright {
    margin-top: 20px;
    text-align: center;
    color: var(--ink-mute, #6b7089);
  }
</style>
